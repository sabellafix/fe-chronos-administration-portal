import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { SkelletonLoginComponent } from './components/skelleton-login/skelleton-login.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';

// MSAL imports
import { MsalModule, MsalService, MsalGuard, MsalBroadcastService, MSAL_INSTANCE, MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import { MSALInstanceFactory, MSALGuardConfigFactory } from '../core/auth/msal-config';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'callback', component: AuthCallbackComponent },
  { path: 'sign-up', component: SignUpComponent }
];

@NgModule({
  declarations: [
    LoginComponent,
    SkelletonLoginComponent,
    AuthCallbackComponent,
    SignUpComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    NgxSkeletonLoaderModule,
    MsalModule
  ],
  providers: [
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ],
})
export class LoginModule { }
