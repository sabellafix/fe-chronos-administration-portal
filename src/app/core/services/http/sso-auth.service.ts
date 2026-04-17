import { Injectable, OnDestroy } from '@angular/core';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { 
  AuthenticationResult, 
  EventMessage, 
  EventType, 
  InteractionStatus,
  RedirectRequest
} from '@azure/msal-browser';
import { BehaviorSubject, Observable, filter, takeUntil, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { b2cPolicies } from '../../auth/msal-config';

export interface SsoLoginResponse {
  token: string;
  refreshToken: string;
  user: any;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SsoAuthService implements OnDestroy {
  private readonly _destroying$ = new Subject<void>();
  private _isAuthenticated$ = new BehaviorSubject<boolean>(false);
  
  isAuthenticated$ = this._isAuthenticated$.asObservable();

  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private http: HttpClient
  ) {
    this.initializeMsal();
  }

  private initializeMsal(): void {
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {
        const payload = result.payload as AuthenticationResult;
        this.handleLoginSuccess(payload);
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.checkAndSetActiveAccount();
      });
  }

  private checkAndSetActiveAccount(): void {
    const activeAccount = this.msalService.instance.getActiveAccount();
    if (!activeAccount && this.msalService.instance.getAllAccounts().length > 0) {
      const accounts = this.msalService.instance.getAllAccounts();
      this.msalService.instance.setActiveAccount(accounts[0]);
    }
    this._isAuthenticated$.next(!!this.msalService.instance.getActiveAccount());
  }

  loginWithGoogle(): void {
    const loginRequest: RedirectRequest = {
      scopes: environment.azureB2C.scopes,
      authority: b2cPolicies.authorities.signUpSignIn.authority,
      extraQueryParameters: {
        domain_hint: 'google.com'
      }
    };
    this.msalService.loginRedirect(loginRequest);
  }

  loginWithMicrosoft(): void {
    const loginRequest: RedirectRequest = {
      scopes: environment.azureB2C.scopes,
      authority: b2cPolicies.authorities.signUpSignIn.authority,
      extraQueryParameters: {
        domain_hint: 'live.com'
      }
    };
    this.msalService.loginRedirect(loginRequest);
  }

  loginWithApple(): void {
    const loginRequest: RedirectRequest = {
      scopes: environment.azureB2C.scopes,
      authority: b2cPolicies.authorities.signUpSignIn.authority,
      extraQueryParameters: {
        domain_hint: 'apple.com'
      }
    };
    this.msalService.loginRedirect(loginRequest);
  }

  loginWithB2C(): void {
    const loginRequest: RedirectRequest = {
      scopes: environment.azureB2C.scopes,
      authority: b2cPolicies.authorities.signUpSignIn.authority
    };
    this.msalService.loginRedirect(loginRequest);
  }

  signUpWithB2C(): void {
    const signUpRequest: RedirectRequest = {
      scopes: environment.azureB2C.scopes,
      authority: b2cPolicies.authorities.signUpSignIn.authority,
      extraQueryParameters: {
        prompt: 'create'
      }
    };
    this.msalService.loginRedirect(signUpRequest);
  }

  private async handleLoginSuccess(result: AuthenticationResult): Promise<void> {
    if (result.idToken) {
      this.validateAndCreateUser(result.idToken).subscribe({
        next: (response) => {
          console.log('SSO login successful', response);
        },
        error: (error) => {
          console.error('Error validating SSO token', error);
        }
      });
    }
  }

  validateAndCreateUser(idToken: string): Observable<SsoLoginResponse> {
    return this.http.post<SsoLoginResponse>(`${environment.apiUrl}/api/auth/sso-callback`, {
      idToken: idToken,
      provider: 'AzureADB2C'
    });
  }

  async getAccessToken(): Promise<string | null> {
    const account = this.msalService.instance.getActiveAccount();
    if (!account) {
      return null;
    }

    try {
      const result = await this.msalService.instance.acquireTokenSilent({
        scopes: environment.azureB2C.scopes,
        account: account
      });
      return result.accessToken;
    } catch (error) {
      console.error('Error acquiring token silently', error);
      return null;
    }
  }

  logout(): void {
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: environment.azureB2C.postLogoutRedirectUri
    });
  }

  getCurrentUser(): any {
    return this.msalService.instance.getActiveAccount();
  }

  resetPassword(): void {
    const resetRequest: RedirectRequest = {
      scopes: environment.azureB2C.scopes,
      authority: b2cPolicies.authorities.resetPassword.authority
    };
    this.msalService.loginRedirect(resetRequest);
  }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}
