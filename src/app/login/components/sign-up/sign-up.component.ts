import { Component } from '@angular/core';
import { SsoAuthService } from '@app/core/services/http/sso-auth.service';
import { environment } from '@env/environment';
import { IdentityProviders } from '@app/core/models/interfaces/identityProviders';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  loading = false;
  companyLogo: string = 'assets/images/chronos-dark.png';
  companyName: string = environment.companyName;
  identityProviders: IdentityProviders = environment.identityProviders;

  constructor(private ssoAuthService: SsoAuthService) {}

  signUpWithGoogle(): void {
    this.loading = true;
    this.ssoAuthService.loginWithGoogle();
  }

  signUpWithMicrosoft(): void {
    this.loading = true;
    this.ssoAuthService.loginWithMicrosoft();
  }

  signUpWithApple(): void {
    this.loading = true;
    this.ssoAuthService.loginWithApple();
  }

  signUpGeneric(): void {
    this.loading = true;
    this.ssoAuthService.signUpWithB2C();
  }
}
