import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DateItem } from '@app/core/models/bussiness/calendar/dateItem';
import { Booking } from '@app/core/models/bussiness/booking';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { OffcanvasCreateBookingComponent } from '../../../shared/offcanvas/offcanvas-create-booking/offcanvas-create-booking.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Service } from '@app/core/models/bussiness/service';
import { Space } from '@app/core/models/bussiness/space';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-bookings-floor',
  templateUrl: './bookings-floor.component.html',
  styleUrl: './bookings-floor.component.scss'
})
export class BookingsFloorComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(OffcanvasCreateBookingComponent) offcanvasCreateBooking!: OffcanvasCreateBookingComponent;
  @ViewChild('threejsContainer', { static: false }) threejsContainer!: ElementRef;

  dateNow : Date = new Date();
  dates: DateItem[] = [];
  activeDate: DateItem = new DateItem();
  bookings: Booking[] = [];
  spaces: any[] = [];
  private scrollListener?: () => void;

  // Propiedades para Three.js
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private chair3DModel: THREE.Group | null = null;
  private animationId: number = 0;

  // Constantes para la celda central
  readonly CENTRAL_SPACE_ID = 10; // Espacio central (de 0-19)
  readonly CENTRAL_HOUR = 14; // Hora central (de 6-22)

  constructor(private snackBar: MatSnackBar){
    this.spaces = this.getSpaces();
    this.getStaticBookings();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.init3DScene();
    this.load3DModel();
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener("scroll", this.scrollListener);
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  getSpaces(){
    const spaces: any[] = [];
    
    const today = new Date(this.dateNow);
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysToMonday);
    
    
    for (let i = 0; i < 15; i++) {
      const space = new Space();
      space.id = i; 
      space.name = 'Space ' + i;
      space.description = 'Description ' + i;
      space.isActive = false;
      
      spaces.push(space);
    }
    
    return spaces;
  } 

  setActiveDate(date: DateItem = new DateItem()   ){
    this.dates.forEach(date => date.isActive = false);
    date.isActive = true;
    this.activeDate = date;
  }

  getHoursRange(): number[] {
    const hours: number[] = [];
    for (let i = 0; i <= 15; i++) {
      hours.push(i);
    }
    return hours;
  }

  formatHour(hour: number): string {
    if (hour === 0) {
      return '12 am';
    } else if (hour < 12) {
      return `${hour} am`;
    } else if (hour === 12) {
      return '12 pm';
    } else {
      return `${hour} pm`;
    }
  }

  openBookingModal(date: Date, hour?: number): void {
    this.offcanvasCreateBooking.selectedDate = date;
    this.offcanvasCreateBooking.selectedHour = hour;
    
    this.offcanvasCreateBooking.show();
  }

  onBookingCreated(booking: Booking): void {
    this.bookings.push(booking);
    this.snackBar.open('Booking created successfully', 'Cerrar', {
      duration: 3000,
     
      panelClass: 'snackbar-success'
    });
  
  }

  onBookingCancelled(): void {
    console.log('Creación de cita cancelada');
  }

  getStaticBookings(){
    const booking1 = new Booking();
    booking1.id = '1';
    booking1.customerId = '1';
    booking1.supplierId = 'supplier-1';
    booking1.serviceId = 'service-1';
    booking1.bookingReference = 'Haircut and Styling';
    booking1.bookingDate.year = 2025;
    booking1.bookingDate.month = 6;
    booking1.bookingDate.day = 21;
    booking1.startTime.hour = 12;
    booking1.startTime.minute = 0;
    booking1.endTime.hour = 14;
    booking1.endTime.minute = 0;
    booking1.durationMinutes = 60;
    booking1.totalPrice = 120;
    booking1.status = BookingStatus.Pending;
    booking1.services = [new Service()];
    booking1.services[0].serviceName = 'Haircut and Styling';
    booking1.services[0].color = '#5d77a2';
    booking1.customer.photo = '../assets/images/users/user3.png';
    booking1.customer.firstName = 'Rick';
    booking1.customer.lastName = 'Sanchez';

    const booking2 = new Booking();
    booking2.id = '2';
    booking2.customerId = '2';
    booking2.supplierId = 'supplier-1';
    booking2.serviceId = 'service-1';
    booking2.bookingReference = 'Keratin Treatment';
    booking2.bookingDate.year = 2025;
    booking2.bookingDate.month = 6;
    booking2.bookingDate.day = 21;
    booking2.startTime.hour = 8;
    booking2.startTime.minute = 0;
    booking2.endTime.hour = 10;
    booking2.endTime.minute = 0;
    booking2.durationMinutes = 60;
    booking2.totalPrice = 260;
    booking2.status = BookingStatus.Confirmed;
    booking2.services = [new Service()];
    booking2.services[0].serviceName = 'Keratin Treatment';
    booking2.services[0].color = '#6bbe60';
    booking2.customer.photo = '../assets/images/users/user5.png';
    booking2.customer.firstName = 'Morty';
    booking2.customer.lastName = 'Smith';

    const booking3 = new Booking();
    booking3.id = '3';
    booking3.customerId = '3';
    booking3.supplierId = 'supplier-1';
    booking3.serviceId = 'service-1';
    booking3.bookingReference = 'Bridal and Event Hair Styling';
    booking3.bookingDate.year = 2025;
    booking3.bookingDate.month = 6;
    booking3.bookingDate.day = 20;
    booking3.startTime.hour = 8;
    booking3.startTime.minute = 0;
    booking3.endTime.hour = 10;
    booking3.endTime.minute = 0;
    booking3.durationMinutes = 60;
    booking3.totalPrice = 100;
    booking3.status = BookingStatus.InProgress;
    booking3.services = [new Service()];
    booking3.services[0].serviceName = 'Bridal and Event Hair Styling';
    booking3.services[0].color = '#c44f4f';
    booking3.customer.photo = '../assets/images/users/user21.png';
    booking3.customer.firstName = 'Summer';
    booking3.customer.lastName = 'Smith';

    this.bookings = [booking1, booking2, booking3];
  }

  getBookingsForDateTime(date: Date, hour: number): Booking[] {
    return this.bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      const bookingHour = booking.startTime.hour;
      
      return bookingDate.toString() === date.toString() && bookingHour === hour;
    });
  }

  getBookingsForDate(date: Date): Booking[] {
    return this.bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      return bookingDate.toString() === date.toString();
    });
  }

  hasBookings(date: Date, hour: number): boolean {
    return this.getBookingsForDateTime(date, hour).length > 0;
  }

  getBookingStatusColor(booking: Booking): string {
    switch (booking.status) {
      case BookingStatus.Pending: return '#fed485'; // Amarillo
      case BookingStatus.Confirmed: return '#a4ebbc'; // Verde
      case BookingStatus.InProgress: return '#b8d8fd'; // Azul
      case BookingStatus.Completed: return '#6c757d'; // Gris
      case BookingStatus.Cancelled: return '#dc3545'; // Rojo
      default: return '#6c757d';
    }
  }

  // Verificar si es la celda central donde debe aparecer el modelo 3D
  isCentralCell(spaceId: number, hour: number): boolean {
    return spaceId === this.CENTRAL_SPACE_ID && hour === this.CENTRAL_HOUR;
  }

  // Inicializar la escena 3D
  private init3DScene(): void {
    if (!this.threejsContainer) return;

    // Crear la escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf8f9fa);

    // Crear la cámara
    this.camera = new THREE.PerspectiveCamera(
      50,
      1, // aspect ratio será ajustado dinámicamente
      0.1,
      1000
    );
    this.camera.position.set(2, 2, 3);
    this.camera.lookAt(0, 0, 0);

    // Crear el renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    this.renderer.setSize(100, 100); // Tamaño inicial pequeño
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Agregar luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    this.scene.add(directionalLight);

    // Agregar el renderer al contenedor
    this.threejsContainer.nativeElement.appendChild(this.renderer.domElement);

    // Iniciar la animación
    this.animate();
  }

  // Cargar el modelo 3D (crear una silla simple programáticamente)
  private load3DModel(): void {
    // Crear una silla simple usando geometrías básicas
    this.chair3DModel = new THREE.Group();
    
    // Material principal
    const chairMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x4a616e,
      transparent: true,
      opacity: 0.9
    });

    const accentMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2196f3 
    });

    // Verificar que el modelo 3D esté inicializado
    if (!this.chair3DModel) return;

    // Asiento
    const seatGeometry = new THREE.BoxGeometry(1, 0.1, 1);
    const seat = new THREE.Mesh(seatGeometry, chairMaterial);
    seat.position.set(0, 0, 0);
    seat.castShadow = true;
    seat.receiveShadow = true;
    this.chair3DModel.add(seat);

    // Respaldo
    const backGeometry = new THREE.BoxGeometry(1, 1, 0.1);
    const back = new THREE.Mesh(backGeometry, chairMaterial);
    back.position.set(0, 0.5, -0.45);
    back.castShadow = true;
    back.receiveShadow = true;
    this.chair3DModel.add(back);

    // Patas de la silla
    const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.8);
    
    // Posiciones de las patas
    const legPositions = [
      { x: -0.4, z: -0.4 },
      { x: 0.4, z: -0.4 },
      { x: -0.4, z: 0.4 },
      { x: 0.4, z: 0.4 }
    ];

    legPositions.forEach(pos => {
      if (!this.chair3DModel) return;
      const leg = new THREE.Mesh(legGeometry, accentMaterial);
      leg.position.set(pos.x, -0.45, pos.z);
      leg.castShadow = true;
      leg.receiveShadow = true;
      this.chair3DModel.add(leg);
    });

    // Reposabrazos
    const armGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.6);
    
    const leftArm = new THREE.Mesh(armGeometry, chairMaterial);
    leftArm.position.set(-0.5, 0.25, -0.1);
    leftArm.castShadow = true;
    leftArm.receiveShadow = true;
    this.chair3DModel.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, chairMaterial);
    rightArm.position.set(0.5, 0.25, -0.1);
    rightArm.castShadow = true;
    rightArm.receiveShadow = true;
    this.chair3DModel.add(rightArm);

    // Detalles decorativos
    const detailGeometry = new THREE.SphereGeometry(0.05);
    for (let i = 0; i < 3; i++) {
      if (!this.chair3DModel) return;
      const detail = new THREE.Mesh(detailGeometry, accentMaterial);
      detail.position.set(0, 0.3 + (i * 0.2), -0.4);
      detail.castShadow = true;
      this.chair3DModel.add(detail);
    }

    // Ajustar posición y escala
    this.chair3DModel.scale.setScalar(1.5);
    this.chair3DModel.position.set(0, -0.3, 0);
    this.chair3DModel.rotation.y = Math.PI / 1.5; // Rotar 90 grados

    // Agregar a la escena
    this.scene.add(this.chair3DModel);
    console.log('Modelo 3D de silla creado exitosamente');
  }

  // Bucle de animación
  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Rotar la silla suavemente
    // if (this.chair3DModel) {
    //   this.chair3DModel.rotation.y += 0.005;
    // }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // Redimensionar el renderizador
  private resizeRenderer(): void {
    if (!this.threejsContainer || !this.renderer || !this.camera) return;

    const container = this.threejsContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
