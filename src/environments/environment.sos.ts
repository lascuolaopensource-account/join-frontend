export const environment = {
  production: true,
  backendUrl: 'http://192.168.1.2:9000/api',
  rulesUrl: 'http://192.168.1.2:9000/rules',
  auth: {
    clientId: 'user',
    redirectUri: 'auth.html',
    authUrl: 'http://192.168.1.2:9000/oauth2/access_token',
    logoutUrl: 'http://192.168.1.2:9000/signout'
  }
};
