import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import * as THREE from 'three';
import { 
  Floor, 
  Site, 
  SiteType, 
  ServiceType, 
  WorkstationData,
  SiteStatus 
} from '@app/core/models/bussiness/floor';
import { 
  MockFloorService, 
  MockSiteService, 
  MockSiteTypeService, 
  MockServiceTypeService 
} from '@app/core/services/mock/floor-services.index';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-calendar-floor',
  templateUrl: './calendar-floor.component.html',
  styleUrl: './calendar-floor.component.scss'
})
export class CalendarFloorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  // Eventos para comunicación con componentes padre
  @Output() siteSelected = new EventEmitter<WorkstationData>();
  @Output() siteHovered = new EventEmitter<{ site: Site, isHovering: boolean }>();
  @Output() floorClicked = new EventEmitter<{ x: number, y: number }>();

  // Three.js core
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls: any; // OrbitControls se importará dinámicamente
  
  // Elementos de la escena
  private floorGroup!: THREE.Group;
  private sitesGroup!: THREE.Group;
  private lightingGroup!: THREE.Group;
  
  // Datos del negocio
  public currentFloor!: Floor;
  public sites: Site[] = [];
  public siteTypes: Map<string, SiteType> = new Map();
  public serviceTypes: Map<string, ServiceType> = new Map();
  public siteObjects: Map<string, THREE.Object3D> = new Map();
  
  // Estado del componente
  public isLoading = true;
  public selectedFloorId = 'floor-001'; // Piso por defecto
  public hoveredSite: Site | null = null;
  public selectedSite: Site | null = null;
  
  // Configuración 3D
  private readonly FLOOR_HEIGHT = 0.1;
  private readonly SITE_BASE_HEIGHT = 1.2;
  private readonly CAMERA_HEIGHT = 8;
  private readonly CAMERA_DISTANCE = 15;
  
  // Raycasting para interactividad
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  
  // Control de ciclo de vida
  private destroy$ = new Subject<void>();

  constructor(
    private mockFloorService: MockFloorService,
    private mockSiteService: MockSiteService,
    private mockSiteTypeService: MockSiteTypeService,
    private mockServiceTypeService: MockServiceTypeService
  ) {}

  ngOnInit(): void {
    this.loadFloorData();    
  }

  ngAfterViewInit(): void {
    this.initializeThreeJS();
    this.setupEventListeners();
    
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disposeThreeJS();
  }

  /**
   * Carga los datos del piso y sitios desde los servicios mock
   */
  private loadFloorData(): void {
    this.isLoading = true;
    
    forkJoin({
      floor: this.mockFloorService.get(this.selectedFloorId),
      sites: this.mockSiteService.getSitesByFloor(this.selectedFloorId),
      siteTypes: this.mockSiteTypeService.getActiveSiteTypes(),
      serviceTypes: this.mockServiceTypeService.getActiveServiceTypes()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.currentFloor = data.floor;
        this.sites = data.sites;
        
        // Convertir arrays a Maps para acceso rápido
        this.siteTypes.clear();
        data.siteTypes.forEach(type => this.siteTypes.set(type.id, type));
        
        this.serviceTypes.clear();
        data.serviceTypes.forEach(type => this.serviceTypes.set(type.id, type));
        
        this.isLoading = false;
        console.log('Floor data loaded:', {
          floor: this.currentFloor,
          sitesCount: this.sites.length,
          siteTypesCount: this.siteTypes.size
        });
        
        // Si Three.js ya está inicializado, crear la escena
        if (this.scene) {
          this.createScene();
        }
      },
      error: (error) => {
        console.error('Error loading floor data:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Inicializa Three.js con la configuración básica
   */
  private initializeThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    // const width = canvas.offsetWidth || 800;
    // const height = canvas.offsetHeight || 600;

    const width = 900;
    const height = 720;

    // Crear escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf5f5f5); // Fondo gris claro

    // Configurar cámara con perspectiva de 3 puntos horizontal
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(this.CAMERA_DISTANCE, this.CAMERA_HEIGHT, this.CAMERA_DISTANCE);
    this.camera.lookAt(
      this.currentFloor?.width / 2 || 6, 
      0, 
      this.currentFloor?.depth / 2 || 5
    );

    // Crear renderizador
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Inicializar grupos
    this.floorGroup = new THREE.Group();
    this.sitesGroup = new THREE.Group();
    this.lightingGroup = new THREE.Group();
    
    this.scene.add(this.floorGroup);
    this.scene.add(this.sitesGroup);
    this.scene.add(this.lightingGroup);

    // Cargar controles de órbita dinámicamente
    this.loadOrbitControls().then(() => {
      // Crear la escena una vez que tenemos los datos y Three.js está listo
      if (!this.isLoading) {
        this.createScene();
      }
    });

    // Configurar responsive
    this.setupResponsive();
  }

  /**
   * Carga dinámicamente los controles de órbita de Three.js
   */
  private async loadOrbitControls(): Promise<void> {
    try {
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      
      // Configuración de controles
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.1;
      this.controls.screenSpacePanning = false;
      this.controls.minDistance = 5;
      this.controls.maxDistance = 30;
      this.controls.maxPolarAngle = Math.PI / 2.1; // Limitar rotación vertical
      
      // Centrar controles en el centro del piso
      if (this.currentFloor) {
        this.controls.target.set(
          this.currentFloor.width / 2,
          0,
          this.currentFloor.depth / 2
        );
      }
      
      this.controls.update();
    } catch (error) {
      console.error('Error loading OrbitControls:', error);
    }
  }

  /**
   * Crea toda la escena 3D
   */
  private createScene(): void {
    if (!this.currentFloor || this.sites.length === 0) {
      console.warn('Cannot create scene: missing floor data or sites');
      return;
    }

    // Limpiar escena anterior
    this.clearScene();

    // Crear elementos de la escena
    this.createLighting();
    this.createFloor();
    this.createSites();
    
    // Iniciar bucle de renderizado
    this.startRenderLoop();
    
    console.log('3D Scene created successfully');
  }

  /**
   * Configura la iluminación de la escena
   */
  private createLighting(): void {
    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(
      this.currentFloor.floorConfig.ambientLight.color,
      this.currentFloor.floorConfig.ambientLight.intensity
    );
    this.lightingGroup.add(ambientLight);

    // Luz direccional principal
    const directionalLight = new THREE.DirectionalLight(
      this.currentFloor.floorConfig.directionalLight.color,
      this.currentFloor.floorConfig.directionalLight.intensity
    );
    
    const lightPos = this.currentFloor.floorConfig.directionalLight.position;
    directionalLight.position.set(lightPos.x, lightPos.y, lightPos.z);
    directionalLight.castShadow = true;
    
    // Configuración de sombras
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -this.currentFloor.width;
    directionalLight.shadow.camera.right = this.currentFloor.width;
    directionalLight.shadow.camera.top = this.currentFloor.depth;
    directionalLight.shadow.camera.bottom = -this.currentFloor.depth;
    
    this.lightingGroup.add(directionalLight);

    // Luz de relleno
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-lightPos.x, lightPos.y / 2, -lightPos.z);
    this.lightingGroup.add(fillLight);
  }

  /**
   * Crea el piso base con cuadrícula
   */
  private createFloor(): void {
    const floorWidth = this.currentFloor.width;
    const floorDepth = this.currentFloor.depth;

    // Crear geometría del piso
    const floorGeometry = new THREE.PlaneGeometry(floorWidth, floorDepth);
    const floorMaterial = new THREE.MeshLambertMaterial({ 
      color: '#FFFFFF', //;this.currentFloor.floorConfig.floorColor,
      transparent: true,
      opacity: 0
    });

    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2; // Rotar para que sea horizontal
    floorMesh.position.set(floorWidth / 2, 0, floorDepth / 2);
    floorMesh.receiveShadow = true;
    floorMesh.name = 'floor';
    
    this.floorGroup.add(floorMesh);

    // Crear cuadrícula si está habilitada
    if (this.currentFloor.floorConfig.showGrid) {
      this.createGrid(floorWidth, floorDepth);
    }

    // Crear paredes si están habilitadas
    if (this.currentFloor.floorConfig.showWalls) {
      this.createWalls(floorWidth, floorDepth);
    }
  }

  /**
   * Crea la cuadrícula del piso
   */
  private createGrid(width: number, depth: number): void {
    const gridSize = this.currentFloor.gridSize;
    const gridColor = this.currentFloor.floorConfig.gridColor;

    // Líneas verticales (paralelas al eje Z)
    for (let x = 0; x <= width; x += gridSize) {
      const geometry = new THREE.BufferGeometry();
      const points = [
        new THREE.Vector3(x, 0.01, 0),
        new THREE.Vector3(x, 0.01, depth)
      ];
      geometry.setFromPoints(points);
      
      const material = new THREE.LineBasicMaterial({ 
        color: gridColor,
        transparent: true,
        opacity: 0.5
      });
      
      const line = new THREE.Line(geometry, material);
      this.floorGroup.add(line);
    }

    // Líneas horizontales (paralelas al eje X)
    for (let z = 0; z <= depth; z += gridSize) {
      const geometry = new THREE.BufferGeometry();
      const points = [
        new THREE.Vector3(0, 0.01, z),
        new THREE.Vector3(width, 0.01, z)
      ];
      geometry.setFromPoints(points);
      
      const material = new THREE.LineBasicMaterial({ 
        color: gridColor,
        transparent: true,
        opacity: 0.5
      });
      
      const line = new THREE.Line(geometry, material);
      this.floorGroup.add(line);
    }
  }

  /**
   * Crea las paredes perimetrales
   */
  private createWalls(width: number, depth: number): void {
    const wallHeight = this.currentFloor.height || 3;
    const wallThickness = 0.1;
    const wallColor = this.currentFloor.floorConfig.wallColor;

    const wallMaterial = new THREE.MeshLambertMaterial({ 
      color: wallColor,
      transparent: true,
      opacity: 0.1
    });

    // Pared norte (parte superior)
    const northWall = new THREE.Mesh(
      new THREE.BoxGeometry(width + wallThickness, wallHeight, wallThickness),
      wallMaterial
    );
    northWall.position.set(width / 2, wallHeight / 2, -wallThickness / 2);
    this.floorGroup.add(northWall);

    // Pared sur (parte inferior)
    const southWall = new THREE.Mesh(
      new THREE.BoxGeometry(width + wallThickness, wallHeight, wallThickness),
      wallMaterial
    );
    southWall.position.set(width / 2, wallHeight / 2, depth + wallThickness / 2);
    this.floorGroup.add(southWall);

    // Pared oeste (izquierda)
    const westWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, depth),
      wallMaterial
    );
    westWall.position.set(-wallThickness / 2, wallHeight / 2, depth / 2);
    this.floorGroup.add(westWall);

    // Pared este (derecha)
    const eastWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, depth),
      wallMaterial
    );
    eastWall.position.set(width + wallThickness / 2, wallHeight / 2, depth / 2);
    this.floorGroup.add(eastWall);
  }

  /**
   * Crea todos los sitios del piso
   */
  private createSites(): void {
    this.sites.forEach(site => {
      const siteObject = this.createSiteObject(site);
      if (siteObject) {
        this.sitesGroup.add(siteObject);
        this.siteObjects.set(site.Id, siteObject);
      }
    });
  }

  /**
   * Crea un objeto 3D para un sitio específico
   */
  private createSiteObject(site: Site): THREE.Object3D | null {
    const siteType = this.siteTypes.get(site.siteTypeId);
    if (!siteType) {
      console.warn(`SiteType not found for site ${site.Id}`);
      return null;
    }

    // Crear grupo para el sitio
    const siteGroup = new THREE.Group();
    siteGroup.name = `site-${site.Id}`;
    siteGroup.userData = { site, siteType };

    // Determinar geometría según el tipo de sitio
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    switch (siteType.category) {
      case 'workstation':
        geometry = new THREE.BoxGeometry(site.width, this.SITE_BASE_HEIGHT, site.depth);
        material = new THREE.MeshLambertMaterial({ color: site.getCurrentColor() });
        break;
      
      case 'washstation':
        geometry = new THREE.CylinderGeometry(0.6, 0.8, this.SITE_BASE_HEIGHT, 8);
        material = new THREE.MeshLambertMaterial({ color: site.getCurrentColor() });
        break;
      
      case 'reception':
        geometry = new THREE.BoxGeometry(site.width, this.SITE_BASE_HEIGHT * 0.6, site.depth);
        material = new THREE.MeshLambertMaterial({ color: site.getCurrentColor() });
        break;
      
      case 'waiting':
        geometry = new THREE.SphereGeometry(0.4, 8, 6);
        material = new THREE.MeshLambertMaterial({ color: site.getCurrentColor() });
        break;
      
      case 'storage':
        geometry = new THREE.BoxGeometry(site.width, this.SITE_BASE_HEIGHT * 1.5, site.depth * 0.5);
        material = new THREE.MeshLambertMaterial({ 
          color: site.getCurrentColor(),
          transparent: true,
          opacity: 0.7
        });
        break;
      
      default:
        geometry = new THREE.BoxGeometry(site.width, this.SITE_BASE_HEIGHT, site.depth);
        material = new THREE.MeshLambertMaterial({ color: '#cccccc' });
    }

    // Crear mesh principal
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, this.SITE_BASE_HEIGHT / 2, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    siteGroup.add(mesh);

    // Posicionar el grupo en el piso
    const pos3D = site.getPosition3D();
    siteGroup.position.set(pos3D.x, pos3D.y, pos3D.z);
    
    // Aplicar rotación si está configurada
    if (site.rotation !== 0) {
      siteGroup.rotation.y = THREE.MathUtils.degToRad(site.rotation);
    }

    // Aplicar escala si está configurada
    const scale = site.threeJsConfig.scale;
    siteGroup.scale.set(scale.x, scale.y, scale.z);

    return siteGroup;
  }

  /**
   * Configura los event listeners
   */
  private setupEventListeners(): void {
    const canvas = this.canvasRef.nativeElement;
    
    // Mouse move para hover
    canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
    
    // Click para selección
    canvas.addEventListener('click', (event) => this.onMouseClick(event));
    
    // Resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Maneja el movimiento del mouse para hover
   */
  private onMouseMove(event: MouseEvent): void {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.sitesGroup.children, true);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object.parent;
      const siteData = intersectedObject?.userData;
      
      if (siteData?.['site'] && this.hoveredSite?.Id !== siteData['site'].Id) {
        // Cambió el sitio hovereado
        this.onSiteHover(siteData['site'], true);
      }
    } else if (this.hoveredSite) {
      // Ya no hay hover
      this.onSiteHover(this.hoveredSite, false);
    }
  }

  /**
   * Maneja clicks del mouse
   */
  private onMouseClick(event: MouseEvent): void {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.sitesGroup.children, true);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object.parent;
      const siteData = intersectedObject?.userData;
      
      if (siteData?.['site']) {
        this.onSiteSelected(siteData['site']);
      }
    } else {
      // Click en el piso
      const floorIntersects = this.raycaster.intersectObjects(this.floorGroup.children, false);
      if (floorIntersects.length > 0) {
        const point = floorIntersects[0].point;
        this.floorClicked.emit({ x: point.x, y: point.z });
      }
    }
  }

  /**
   * Maneja hover sobre sitios
   */
  private onSiteHover(site: Site, isHovering: boolean): void {
    if (isHovering) {
      this.hoveredSite = site;
      this.canvasRef.nativeElement.style.cursor = 'pointer';
      
      // Efecto visual de hover
      const siteObject = this.siteObjects.get(site.Id);
      if (siteObject) {
        const mesh = siteObject.children[0] as THREE.Mesh;
        const material = mesh.material as THREE.MeshLambertMaterial;
        material.color.setHex(parseInt(site.threeJsConfig.highlightColor.replace('#', '0x')));
      }
    } else {
      this.hoveredSite = null;
      this.canvasRef.nativeElement.style.cursor = 'default';
      
      // Restaurar color original
      const siteObject = this.siteObjects.get(site.Id);
      if (siteObject) {
        const mesh = siteObject.children[0] as THREE.Mesh;
        const material = mesh.material as THREE.MeshLambertMaterial;
        material.color.setHex(parseInt(site.getCurrentColor().replace('#', '0x')));
      }
    }
    
    this.siteHovered.emit({ site, isHovering });
  }

  /**
   * Maneja selección de sitios
   */
  private onSiteSelected(site: Site): void {
    this.selectedSite = site;
    const siteType = this.siteTypes.get(site.siteTypeId);
    
    if (siteType) {
      const workstationData: WorkstationData = {
        site,
        siteType,
        availableServices: Array.from(this.serviceTypes.values()).filter(service => 
          service.requirements.siteTypes.includes(site.siteTypeId) ||
          service.requirements.siteTypes.length === 0
        ),
        performanceMetrics: {
          efficiency: 85, // Mock data
          occupancyRate: site.isOccupied ? 100 : 0,
          revenue: 150000 // Mock data
        }
      };
      
      this.siteSelected.emit(workstationData);
    }
    
    console.log('Site selected:', site);
  }

  /**
   * Configuración responsive
   */
  private setupResponsive(): void {
    // ResizeObserver para detectar cambios de tamaño del contenedor
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        this.onWindowResize();
      });
      resizeObserver.observe(this.canvasRef.nativeElement.parentElement!);
    }
  }

  /**
   * Maneja redimensionamiento de ventana
   */
  private onWindowResize(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.offsetWidth || 800;
    const height = canvas.offsetHeight || 600;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Inicia el bucle de renderizado
   */
  private startRenderLoop(): void {
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (this.controls) {
        this.controls.update();
      }
      
      this.renderer.render(this.scene, this.camera);
    };
    
    animate();
  }

  /**
   * Limpia la escena anterior
   */
  private clearScene(): void {
    // Limpiar grupos
    [this.floorGroup, this.sitesGroup, this.lightingGroup].forEach(group => {
      while (group.children.length > 0) {
        const child = group.children[0];
        group.remove(child);
        
        // Disponer geometrías y materiales
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
    
    // Limpiar mapa de objetos
    this.siteObjects.clear();
  }

  /**
   * Disponer recursos de Three.js
   */
  private disposeThreeJS(): void {
    if (this.renderer) {
      this.clearScene();
      this.renderer.dispose();
    }
    
    if (this.controls) {
      this.controls.dispose();
    }
  }

  /**
   * Métodos públicos para control externo
   */
  public switchFloor(floorId: string): void {
    if (floorId !== this.selectedFloorId) {
      this.selectedFloorId = floorId;
      this.loadFloorData();
    }
  }

  public updateSiteStatus(siteId: string, status: SiteStatus): void {
    const site = this.sites.find(s => s.Id === siteId);
    if (site) {
      site.occupancyStatus = status;
      
      // Actualizar color en 3D
      const siteObject = this.siteObjects.get(siteId);
      if (siteObject) {
        const mesh = siteObject.children[0] as THREE.Mesh;
        const material = mesh.material as THREE.MeshLambertMaterial;
        material.color.setHex(parseInt(site.getCurrentColor().replace('#', '0x')));
      }
    }
  }

  public focusOnSite(siteId: string): void {
    const site = this.sites.find(s => s.Id === siteId);
    if (site && this.controls) {
      const pos3D = site.getPosition3D();
      this.controls.target.set(pos3D.x, pos3D.y, pos3D.z);
      this.controls.update();
    }
  }

  public resetCamera(): void {
    if (this.controls && this.currentFloor) {
      this.camera.position.set(this.CAMERA_DISTANCE, this.CAMERA_HEIGHT, this.CAMERA_DISTANCE);
      this.controls.target.set(
        this.currentFloor.width / 2,
        0,
        this.currentFloor.depth / 2
      );
      this.controls.update();
    }
  }

  // Métodos de utilidad para el template
  public getSiteStatusColor(status: string): string {
    switch (status) {
      case 'available': return 'success';
      case 'occupied': return 'danger';
      case 'reserved': return 'warning';
      case 'maintenance': return 'secondary';
      case 'blocked': return 'dark';
      default: return 'secondary';
    }
  }

  public getSiteStatusText(status: string): string {
    switch (status) {
      case 'available': return 'Disponible';
      case 'occupied': return 'Ocupado';
      case 'reserved': return 'Reservado';
      case 'maintenance': return 'Mantenimiento';
      case 'blocked': return 'Bloqueado';
      default: return 'Desconocido';
    }
  }

  public getSiteTypeLegend(): { name: string, color: string, count: number }[] {
    const legend: { name: string, color: string, count: number }[] = [];
    
    this.siteTypes.forEach(siteType => {
      const sitesOfType = this.sites.filter(s => s.siteTypeId === siteType.id);
      if (sitesOfType.length > 0) {
        legend.push({
          name: siteType.name,
          color: siteType.visualConfig.defaultColor,
          count: sitesOfType.length
        });
      }
    });
    
    return legend;
  }

  public getAvailableSitesCount(): number {
    return this.sites.filter(s => s.occupancyStatus === 'available').length;
  }

  public getOccupiedSitesCount(): number {
    return this.sites.filter(s => s.occupancyStatus === 'occupied').length;
  }

  public getReservedSitesCount(): number {
    return this.sites.filter(s => s.occupancyStatus === 'reserved').length;
  }

  public getMaintenanceSitesCount(): number {
    return this.sites.filter(s => s.occupancyStatus === 'maintenance').length;
  }

  public getOccupancyPercentage(): number {
    const total = this.sites.length;
    const occupied = this.getOccupiedSitesCount() + this.getReservedSitesCount();
    return total > 0 ? Math.round((occupied / total) * 100) : 0;
  }

  public getServiceName(serviceId: string): string {
    const service = this.serviceTypes.get(serviceId);
    return service?.name || 'Servicio desconocido';
  }

  public onCreateBooking(site: Site): void {
    // Emitir evento para crear una nueva reserva
    console.log('Creating booking for site:', site);
    // Aquí se podría abrir un modal o navegar a una página de creación de reserva
  }
}
