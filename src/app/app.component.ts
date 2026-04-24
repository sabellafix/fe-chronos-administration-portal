import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { InteractionStatus, EventMessage, EventType, AuthenticationResult } from '@azure/msal-browser';
import { Subject, filter, takeUntil } from 'rxjs';
import { SsoAuthService } from './core/services/http/sso-auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'fe-chronos-administration-portal';
  private readonly _destroying$ = new Subject<void>();
  isIframe = false;

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private ssoAuthService: SsoAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener;

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.checkAndSetActiveAccount();
      });

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.ACTIVE_ACCOUNT_CHANGED),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        if (this.msalService.instance.getAllAccounts().length === 0) {
          window.location.pathname = '/login';
        }
      });

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {
        const payload = result.payload as AuthenticationResult;
        if (payload.account) {
          this.msalService.instance.setActiveAccount(payload.account);
        }
      });

    this.handleRedirectCallback();
  }

  private async handleRedirectCallback(): Promise<void> {
    try {
      const result = await this.msalService.instance.handleRedirectPromise();
      if (result) {
        if (result.account) {
          this.msalService.instance.setActiveAccount(result.account);
        }
      }
    } catch (error) {
      console.error('Error handling redirect promise:', error);
    }
  }

  private checkAndSetActiveAccount(): void {
    const activeAccount = this.msalService.instance.getActiveAccount();

    if (!activeAccount && this.msalService.instance.getAllAccounts().length > 0) {
      const accounts = this.msalService.instance.getAllAccounts();
      this.msalService.instance.setActiveAccount(accounts[0]);
    }
  }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}
