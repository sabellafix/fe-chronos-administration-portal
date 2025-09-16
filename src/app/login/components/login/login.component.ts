import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '@app/core/models/bussiness/user';
import { CompanyInfo } from '@app/core/models/views/companyInfo';
import { InfoUser } from '@app/core/models/views/infoUser';
import { AuthService } from '@app/core/services/http/auth.service';
import { UserService } from '@app/core/services/http/user.service';

import { environment } from '@env/environment';
import { StorageService } from '@app/core/services/shared/storage.service';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { UserResponse } from '@app/core/models/dtos/userResponse';
import { TokenRefreshService } from '@app/core/services/shared/token-refresh.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, AfterViewInit{

  form: FormGroup;
  infoUser : InfoUser = new InfoUser();
  userResponse : UserResponse = new UserResponse();
  email : string = "";
  charge: boolean = false;
  loading: boolean = false;
  logginError: boolean = false;
  userDomain : string = environment.apiUrl;

  user : User = new User();

  assets: string = "assets/images/";
  companyName : string = environment.companyName;
  companyLogo : string = 'assets/images/chronos-dark.png';
  companyInfo : CompanyInfo = new CompanyInfo();

  @ViewChild('loginVideo', { static: false }) loginVideo!: ElementRef<HTMLVideoElement>;

  constructor(private authService : AuthService,
              private router : Router,
              private userService : UserService,
              private storageService : StorageService,
              private tokenRefreshService : TokenRefreshService
  ) {
    this.form = new FormGroup({
      userNumber : new FormControl("", [Validators.required, Validators.email]),
      password : new FormControl("", Validators.required),
    });
  }

  ngOnInit() {
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
            this.storageService.set(StorageKeyConst._TOKEN, this.userResponse.token);
            this.storageService.set(StorageKeyConst._USER, JSON.stringify(this.userResponse.user));
            this.storageService.set(StorageKeyConst._EXPIRES_AT, this.userResponse.expiresAt);
            this.storageService.set(StorageKeyConst._USER_ROLE, this.userResponse.user.userRole);
            
            // Notificar que el token ha sido actualizado
            this.tokenRefreshService.notifyTokenUpdate();
            
            this.router.navigate(['/bookings']);
          }
        },
        (error: any) =>{
          this.logginError = true;
          this.loading = false;
        }
      );
    }
  }

}
