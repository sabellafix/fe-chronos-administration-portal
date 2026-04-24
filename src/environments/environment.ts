export const environment = {
    production: false,
    apiUrl: 'https://az-chronos-services-bmbzgqajgfevbyd2.eastus2-01.azurewebsites.net',
    apiAsistantUrl: 'https://chronos-assistant-cqf0gxahe6g5adbh.eastus-01.azurewebsites.net',
    // apiUrl: 'https://localhost:44300',  
    apiKey: 'Ciq8Q-SRk8Q~RZZgw_wfMiB4L2GlQt1_uNiW~OZv~FHdd5',
    companyName: 'Administration Platform',
    companyLogo: 'icon.png',
    ssoCookieDomain: 'chronosportal.ciamlogin.com',
    encryptionKey: '087HIph807Wh766R54',
    salonId: '07c3fea6-9326-45cf-b97b-c29b92e5437e',
    twilio: {
      smsMessageSid: 'SM079ad2bf3836f265befbb6d462447a5c',
      smsSid: 'SM079ad2bf3836f265befbb6d462447a',
      messageSid: 'SM079ad2bf3836f265befbb6d462447a5c',
      accountSid: 'AC4c808d46b875111e8dce87edad64dea2'
    },
    identityProviders: {
      Google : true,
      Microsoft : false,
      Apple : false
    },
    
    azureB2C: {
      tenantName: 'chronosportal',
      tenantId: '0e9fb1ff-ed73-4b9c-ae61-a3fdbe97ceca',
      clientId: '01bbe673-0f31-428c-92d7-80a036ea4646',
      signUpSignInPolicy: 'SignUpSignIn',
      resetPasswordPolicy: 'PasswordReset',
      // redirectUri: 'http://localhost:4200/login/callback',
      // postLogoutRedirectUri: 'http://localhost:4200/login',
      redirectUri: 'https://salmon-island-076177c0f.2.azurestaticapps.net/login/callback',
      postLogoutRedirectUri: 'https://salmon-island-076177c0f.2.azurestaticapps.net/login',
      scopes: ['openid', 'profile', 'email', 'offline_access']
    }
  };