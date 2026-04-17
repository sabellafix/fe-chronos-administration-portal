import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { EventMessage, EventType, AuthenticationResult, InteractionStatus } from '@azure/msal-browser';
import { Subject, filter, takeUntil } from 'rxjs';
import { SsoAuthService } from '@app/core/services/http/sso-auth.service';
import { StorageService } from '@app/core/services/shared/storage.service';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { RolService } from '@app/core/services/http/rol.service';
import { TokenRefreshService } from '@app/core/services/shared/token-refresh.service';
import { AuthService } from '@app/core/services/http/auth.service';
import { Rol } from '@app/core/models/bussiness/rol';

@Component({
  selector: 'app-auth-callback',
  template: `
    <div class="callback-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Procesando autenticación...</span>
      </div>
      <p class="mt-3">Procesando autenticación...</p>
      <p *ngIf="errorMessage" class="text-danger">{{ errorMessage }}</p>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: #f8f9fa;
    }
    .spinner-border {
      width: 3rem;
      height: 3rem;
    }
  `]
})
export class AuthCallbackComponent implements OnInit, OnDestroy {
  private readonly _destroying$ = new Subject<void>();
  errorMessage: string = '';

  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private ssoAuthService: SsoAuthService,
    private storageService: StorageService,
    private rolService: RolService,
    private tokenRefreshService: TokenRefreshService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => 
          msg.eventType === EventType.LOGIN_SUCCESS || 
          msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
        ),
        takeUntil(this._destroying$)
      )
      .subscribe({
        next: (result: EventMessage) => {
          const payload = result.payload as AuthenticationResult;
          this.processAuthResult(payload);
        },
        error: (error) => {
          this.errorMessage = 'Error durante la autenticación';
          console.error('Auth error:', error);
        }
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        const account = this.msalService.instance.getActiveAccount();
        if (!account) {
          this.router.navigate(['/login']);
        }
      });
  }

  private processAuthResult(result: AuthenticationResult): void {
    if (result.idToken) {
      this.ssoAuthService.validateAndCreateUser(result.idToken).subscribe({
        next: (response) => {
          this.storageService.set(StorageKeyConst._TOKEN, response.token);
          this.storageService.set(StorageKeyConst._USER, JSON.stringify(response.user));
          this.storageService.set(StorageKeyConst._EXPIRES_AT, response.expiresAt);
          
          this.tokenRefreshService.notifyTokenUpdate();
          this.authService.updateAuthenticationStatus();

          if (response.user.roleId) {
            this.rolService.getRolByIdBearer(response.user.roleId, response.token).subscribe({
              next: (role: Rol) => {
                response.user.role = role;
                this.storageService.set(StorageKeyConst._ROLE, JSON.stringify(role));
                this.router.navigate(['/dashboard']);
              },
              error: () => {
                this.router.navigate(['/dashboard']);
              }
            });
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al procesar la autenticación';
          console.error('Backend validation error:', error);
          setTimeout(() => this.router.navigate(['/login']), 3000);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}
