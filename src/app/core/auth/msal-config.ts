import { MsalGuardConfiguration, MsalInterceptorConfiguration } from '@azure/msal-angular';
import { 
  BrowserCacheLocation, 
  InteractionType, 
  IPublicClientApplication, 
  LogLevel, 
  PublicClientApplication 
} from '@azure/msal-browser';
import { environment } from '../../../environments/environment';

export const b2cPolicies = {
  names: {
    signUpSignIn: 'SignUpSignIn',
    resetPassword: 'PasswordReset'
  },
  authorities: {
    signUpSignIn: {
      authority: `https://${environment.azureB2C.tenantName}.ciamlogin.com/${environment.azureB2C.tenantName}.onmicrosoft.com`
    },
    resetPassword: {
      authority: `https://${environment.azureB2C.tenantName}.ciamlogin.com/${environment.azureB2C.tenantName}.onmicrosoft.com`
    }
  },
  authorityDomain: `${environment.azureB2C.tenantName}.ciamlogin.com`
};

export const msalConfig = {
  auth: {
    clientId: environment.azureB2C.clientId,
    authority: b2cPolicies.authorities.signUpSignIn.authority,
    knownAuthorities: [b2cPolicies.authorityDomain],
    redirectUri: environment.azureB2C.redirectUri,
    postLogoutRedirectUri: environment.azureB2C.postLogoutRedirectUri
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
        }
      },
      logLevel: LogLevel.Warning,
      piiLoggingEnabled: false
    }
  }
};

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['openid', 'profile', 'email']
    }
  };
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}
