import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { 
  AuthenticationResult, 
  EventMessage, 
  EventType, 
  InteractionStatus,
  RedirectRequest,
  AccountInfo
} from '@azure/msal-browser';
import { BehaviorSubject, Observable, filter, takeUntil, Subject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { b2cPolicies } from '../../auth/msal-config';
import { StorageService } from '../shared/storage.service';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { AuthService } from './auth.service';
import { TokenRefreshService } from '../shared/token-refresh.service';
import { CookieService } from '../shared/cookie.service';

export interface SsoLoginResponse {
  token: string;
  refreshToken: string;
  user: any;
  expiresAt: string;
}

export type SsoProvider = 'google' | 'microsoft' | 'apple' | 'email';

@Injectable({
  providedIn: 'root'
})
export class SsoAuthService implements OnDestroy {
  private readonly _destroying$ = new Subject<void>();
  private _isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private _isSsoProcessing$ = new BehaviorSubject<boolean>(false);
  private _ssoError$ = new BehaviorSubject<string | null>(null);
  
  isAuthenticated$ = this._isAuthenticated$.asObservable();
  isSsoProcessing$ = this._isSsoProcessing$.asObservable();
  ssoError$ = this._ssoError$.asObservable();

  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private http: HttpClient,
    private storageService: StorageService,
    private cookieService: CookieService,
    private authService: AuthService,
    private tokenRefreshService: TokenRefreshService,
    private router: Router
  ) {
    this.initializeMsal();
  }

  private initializeMsal(): void {
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => 
          msg.eventType === EventType.LOGIN_SUCCESS ||
          msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
        ),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {
        const payload = result.payload as AuthenticationResult;
        if (payload && payload.idToken) {
          this.processAuthenticationResult(payload);
        }
      });

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => 
          msg.eventType === EventType.ACQUIRE_TOKEN_FAILURE
        ),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {
        this._isSsoProcessing$.next(false);
        this._ssoError$.next(result.error?.message || 'Error de autenticación');
        console.error('MSAL Error:', result.error);
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.checkAndSetActiveAccount();
        this.handleRedirectPromise();
      });
  }

  private async handleRedirectPromise(): Promise<void> {
    try {
      const result = await this.msalService.instance.handleRedirectPromise();
      if (result && result.idToken) {
        this.processAuthenticationResult(result);
      }
    } catch (error) {
      console.error('Error handling redirect:', error);
      this._ssoError$.next('Error procesando la autenticación');
    }
  }

  private checkAndSetActiveAccount(): void {
    const activeAccount = this.msalService.instance.getActiveAccount();
    if (!activeAccount && this.msalService.instance.getAllAccounts().length > 0) {
      const accounts = this.msalService.instance.getAllAccounts();
      this.msalService.instance.setActiveAccount(accounts[0]);
    }
    this._isAuthenticated$.next(!!this.msalService.instance.getActiveAccount());
  }

  private async processAuthenticationResult(result: AuthenticationResult): Promise<void> {
    if (!result.idToken) {
      return;
    }

    this._isSsoProcessing$.next(true);
    this._ssoError$.next(null);

    try {
      if (result.account) {
        this.msalService.instance.setActiveAccount(result.account);
      }

      const provider = this.extractProviderFromAccount(result.account);
      const response = await firstValueFrom(
        this.validateAndCreateUser(result.idToken, provider)
      );

      this.establishSession(response);

      this._isAuthenticated$.next(true);
      this._isSsoProcessing$.next(false);

      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Error processing SSO authentication:', error);
      this._isSsoProcessing$.next(false);
      this._ssoError$.next(error.error?.message || 'Error al procesar la autenticación SSO');
      this.router.navigate(['/login']);
    }
  }

  private extractProviderFromAccount(account: AccountInfo | null): SsoProvider {
    if (!account) return 'email';
    
    const idp = account.idTokenClaims?.['idp'] as string;
    if (idp) {
      if (idp.includes('google')) return 'google';
      if (idp.includes('live.com') || idp.includes('microsoft')) return 'microsoft';
      if (idp.includes('apple')) return 'apple';
    }
    return 'email';
  }

  private establishSession(response: SsoLoginResponse): void {
    this.storageService.set(StorageKeyConst._TOKEN, response.token);
    this.storageService.set(StorageKeyConst._USER, JSON.stringify(response.user));
    this.storageService.set(StorageKeyConst._EXPIRES_AT, response.expiresAt);

    if (response.refreshToken) {
      this.storageService.set('REFRESH_TOKEN', response.refreshToken);
    }

    if (response.user.role) {
      this.storageService.set(StorageKeyConst._ROLE, JSON.stringify(response.user.role));
    }

    this.tokenRefreshService.notifyTokenUpdate();
    this.authService.updateAuthenticationStatus();
  }

  loginWithGoogle(): void {
    this._isSsoProcessing$.next(true);
    this._ssoError$.next(null);
    
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
    this._isSsoProcessing$.next(true);
    this._ssoError$.next(null);
    
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
    this._isSsoProcessing$.next(true);
    this._ssoError$.next(null);
    
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
    this._isSsoProcessing$.next(true);
    this._ssoError$.next(null);
    
    const loginRequest: RedirectRequest = {
      scopes: environment.azureB2C.scopes,
      authority: b2cPolicies.authorities.signUpSignIn.authority
    };
    this.msalService.loginRedirect(loginRequest);
  }

  signUpWithB2C(): void {
    this._isSsoProcessing$.next(true);
    this._ssoError$.next(null);
    
    const signUpRequest: RedirectRequest = {
      scopes: environment.azureB2C.scopes,
      authority: b2cPolicies.authorities.signUpSignIn.authority,
      extraQueryParameters: {
        prompt: 'create'
      }
    };
    this.msalService.loginRedirect(signUpRequest);
  }

  validateAndCreateUser(idToken: string, provider: SsoProvider = 'email'): Observable<SsoLoginResponse> {
    return this.http.post<SsoLoginResponse>(`${environment.apiUrl}/api/auth/sso-callback`, {
      idToken: idToken,
      provider: this.mapProviderToBackend(provider)
    });
  }

  private mapProviderToBackend(provider: SsoProvider): string {
    const providerMap: Record<SsoProvider, string> = {
      'google': 'Google',
      'microsoft': 'Microsoft',
      'apple': 'Apple',
      'email': 'AzureADB2C'
    };
    return providerMap[provider] || 'AzureADB2C';
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

  async getIdToken(): Promise<string | null> {
    const account = this.msalService.instance.getActiveAccount();
    if (!account) {
      return null;
    }

    try {
      const result = await this.msalService.instance.acquireTokenSilent({
        scopes: environment.azureB2C.scopes,
        account: account
      });
      return result.idToken;
    } catch (error) {
      console.error('Error acquiring id token silently', error);
      return null;
    }
  }

  clearBrowserSessionAndCookies(): void {
    this.storageService.clearAll();
    this.cookieService.clearAll();
    this.cookieService.clearAllByDomain(environment.ssoCookieDomain);

    this.msalService.instance.setActiveAccount(null);

    this.clearMsalArtifactsFromStorage(localStorage);
    this.clearMsalArtifactsFromStorage(sessionStorage);
  }

  private clearMsalArtifactsFromStorage(storage: Storage): void {
    const keysToDelete: string[] = [];

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && (key.startsWith('msal.') || key.toLowerCase().includes('msal'))) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      storage.removeItem(key);
    }
  }

  logout(): void {
    const account = this.msalService.instance.getActiveAccount();

    
    this.clearBrowserSessionAndCookies();
    this.authService.setAuthenticated(false);
    this.authService.logOut();
    this._isAuthenticated$.next(false);
    
    if (account) {
      this.msalService.logoutRedirect({
        postLogoutRedirectUri: environment.azureB2C.postLogoutRedirectUri,
        account: account
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  getCurrentUser(): AccountInfo | null {
    return this.msalService.instance.getActiveAccount();
  }

  getAllAccounts(): AccountInfo[] {
    return this.msalService.instance.getAllAccounts();
  }

  isMsalAuthenticated(): boolean {
    return this.msalService.instance.getAllAccounts().length > 0;
  }

  resetPassword(): void {
    const resetRequest: RedirectRequest = {
      scopes: environment.azureB2C.scopes,
      authority: b2cPolicies.authorities.resetPassword.authority
    };
    this.msalService.loginRedirect(resetRequest);
  }

  clearError(): void {
    this._ssoError$.next(null);
  }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}
