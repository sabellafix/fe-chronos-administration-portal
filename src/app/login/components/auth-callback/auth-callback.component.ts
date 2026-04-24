import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { Subject, filter, takeUntil, combineLatest } from 'rxjs';
import { SsoAuthService } from '@app/core/services/http/sso-auth.service';
import { AuthService } from '@app/core/services/http/auth.service';

@Component({
  selector: 'app-auth-callback',
  template: `
    <div class="callback-container">
      <div class="callback-card">
        <div *ngIf="!errorMessage" class="loading-section">
          <div class="spinner-container">
            <div class="spinner"></div>
          </div>
          <h2 class="mt-4">Procesando autenticación</h2>
          <p class="text-muted">Por favor espera mientras verificamos tu identidad...</p>
        </div>
        
        <div *ngIf="errorMessage" class="error-section">
          <div class="error-icon">
            <i class="bi bi-exclamation-circle"></i>
          </div>
          <h2 class="mt-3 text-danger">Error de autenticación</h2>
          <p class="text-muted">{{ errorMessage }}</p>
          <button class="btn btn-primary mt-3" (click)="goToLogin()">
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .callback-card {
      background: white;
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    
    .loading-section, .error-section {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .spinner-container {
      width: 64px;
      height: 64px;
      position: relative;
    }
    
    .spinner {
      width: 100%;
      height: 100%;
      border: 4px solid #e9ecef;
      border-top: 4px solid #6f19e6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .error-icon {
      font-size: 48px;
      color: #dc3545;
    }
    
    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #343a40;
      margin-bottom: 8px;
    }
    
    .text-muted {
      color: #6c757d;
      font-size: 0.95rem;
    }
    
    .btn-primary {
      background-color: #6f19e6;
      border-color: #6f19e6;
      padding: 12px 32px;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.2s ease;
    }
    
    .btn-primary:hover {
      background-color: #5a14c0;
      border-color: #5a14c0;
      transform: translateY(-1px);
    }
  `]
})
export class AuthCallbackComponent implements OnInit, OnDestroy {
  private readonly _destroying$ = new Subject<void>();
  errorMessage: string = '';
  private hasProcessed = false;

  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private ssoAuthService: SsoAuthService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.ssoAuthService.ssoError$
      .pipe(takeUntil(this._destroying$))
      .subscribe(error => {
        if (error) {
          this.errorMessage = error;
        }
      });

    combineLatest([
      this.ssoAuthService.isSsoProcessing$,
      this.ssoAuthService.isAuthenticated$,
      this.authService.isLoggedIn()
    ])
    .pipe(takeUntil(this._destroying$))
    .subscribe(([isProcessing, isSsoAuth, isLoggedIn]) => {
      if (!isProcessing && (isSsoAuth || isLoggedIn) && !this.hasProcessed) {
        this.hasProcessed = true;
        this.router.navigate(['/dashboard']);
      }
    });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.checkAuthenticationState();
      });

    setTimeout(() => this.checkAuthenticationState(), 500);
  }

  private checkAuthenticationState(): void {
    if (this.hasProcessed) return;

    const accounts = this.msalService.instance.getAllAccounts();
    
    if (accounts.length === 0) {
      const hasLocalToken = !!localStorage.getItem('TOKEN');
      if (!hasLocalToken && !this.errorMessage) {
        this.errorMessage = 'No se encontró sesión de autenticación';
        setTimeout(() => this.goToLogin(), 2000);
      }
      return;
    }

    this.msalService.instance.setActiveAccount(accounts[0]);
  }

  goToLogin(): void {
    this.ssoAuthService.clearError();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}
