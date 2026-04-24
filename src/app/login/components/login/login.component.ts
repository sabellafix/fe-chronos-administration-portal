import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { User } from '@app/core/models/bussiness/user';
import { CompanyInfo } from '@app/core/models/views/companyInfo';
import { InfoUser } from '@app/core/models/views/infoUser';
import { AuthService } from '@app/core/services/http/auth.service';
import { UserService } from '@app/core/services/http/user.service';
import { RolService } from '@app/core/services/http/rol.service';
import { environment } from '@env/environment';
import { StorageService } from '@app/core/services/shared/storage.service';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { UserResponse } from '@app/core/models/dtos/userResponse';
import { TokenRefreshService } from '@app/core/services/shared/token-refresh.service';
import { Rol } from '@app/core/models/bussiness/rol';
import { SalonService } from '@app/core/services/http/salon.service';
import { Salon } from '@app/core/models/bussiness/salon';
import { SsoAuthService } from '@app/core/services/http/sso-auth.service';
import { IdentityProviders } from '@app/core/models/interfaces/identityProviders';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

  private readonly _destroying$ = new Subject<void>();
  identityProviders: IdentityProviders = environment.identityProviders;

  form: FormGroup;
  infoUser : InfoUser = new InfoUser();
  userResponse : UserResponse = new UserResponse();
  email : string = "";
  charge: boolean = false;
  loading: boolean = false;
  logginError: boolean = false;
  ssoError: string | null = null;
  userDomain : string = environment.apiUrl;
  salons : Salon[] = [];
  user : User = new User();

  assets: string = "assets/images/";
  companyName : string = environment.companyName;
  companyLogo : string = 'assets/images/chronos-dark.png';
  companyInfo : CompanyInfo = new CompanyInfo();

  @ViewChild('loginVideo', { static: false }) loginVideo!: ElementRef<HTMLVideoElement>;

  constructor(private authService : AuthService,
              private router : Router,
              private userService : UserService,
              private rolService : RolService,
              private storageService : StorageService,
              private tokenRefreshService : TokenRefreshService,
              private salonService : SalonService,
              private ssoAuthService : SsoAuthService
  ) {
    this.form = new FormGroup({
      userNumber : new FormControl("", [Validators.required, Validators.email]),
      password : new FormControl("", Validators.required),
    });
  }

  ngOnInit() {
    this.ssoAuthService.isSsoProcessing$
      .pipe(takeUntil(this._destroying$))
      .subscribe(isProcessing => {
        this.loading = isProcessing;
      });

    this.ssoAuthService.ssoError$
      .pipe(takeUntil(this._destroying$))
      .subscribe(error => {
        this.ssoError = error;
        if (error) {
          this.loading = false;
        }
      });

    this.authService.isLoggedIn()
      .pipe(takeUntil(this._destroying$))
      .subscribe(isLoggedIn => {
        if (isLoggedIn) {
          this.router.navigate(['/dashboard']);
        }
      });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeVideo();
    }, 100);
  }

  private initializeVideo() {
    if (this.loginVideo && this.loginVideo.nativeElement) {
      const video = this.loginVideo.nativeElement;
      
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      
      video.addEventListener('loadstart', () => {
      });
      
      video.addEventListener('loadeddata', () => {
      });
      
      video.addEventListener('canplay', () => {
        this.playVideo(video);
      });
      
      video.addEventListener('error', (e) => {
      });
      
      video.load();
    }
  }

  private playVideo(video: HTMLVideoElement) {
    video.play()
      .then(() => {
      })
      .catch(error => {
        console.error('Error al reproducir el video:', error);
        document.addEventListener('click', () => {
          video.play().catch(e => console.error('Error en reproducción manual:', e));
        }, { once: true });
      });
  }

  signIn(){
    this.form.markAllAsTouched();
    if(this.form.valid){
      this.infoUser.password = this.form.get("password")?.value;
      this.infoUser.email = this.form.get("userNumber")?.value;
      this.loading = true;
      this.userService.login(this.infoUser).subscribe(
        (response: any) => {
          this.userResponse = <UserResponse>response; 
          if(this.userResponse.token != ''){  
            if(this.userResponse.user.roleId != null){
              this.storageService.set(StorageKeyConst._TOKEN, this.userResponse.token);
              this.storageService.set(StorageKeyConst._USER, JSON.stringify(this.userResponse.user));
              this.storageService.set(StorageKeyConst._EXPIRES_AT, this.userResponse.expiresAt);
              this.tokenRefreshService.notifyTokenUpdate();
              
              this.authService.updateAuthenticationStatus();
              
              this.rolService.getRolByIdBearer(this.userResponse.user.roleId, this.userResponse.token).subscribe((response: Rol) => {
                this.userResponse.user.role = response;
                this.storageService.set(StorageKeyConst._ROLE, JSON.stringify(this.userResponse.user.role));
                this.router.navigate(['/dashboard']);
              });
            }
          }
        },
        (error: any) =>{
          this.logginError = true;
          this.loading = false;
        }
      );
    }
  }

  signInWithGoogle(): void {
    this.loading = true;
    this.ssoAuthService.loginWithGoogle();
  }

  signInWithMicrosoft(): void {
    this.loading = true;
    this.ssoAuthService.loginWithMicrosoft();
  }

  signInWithApple(): void {
    this.loading = true;
    this.ssoAuthService.loginWithApple();
  }

  signUpWithSSO(): void {
    this.ssoAuthService.signUpWithB2C();
  }

  clearSsoError(): void {
    this.ssoError = null;
    this.ssoAuthService.clearError();
  }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}
