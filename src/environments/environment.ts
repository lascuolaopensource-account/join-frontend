export const environment = {
  production: false,
  backendUrl: 'http://localhost:9000/api',
  rulesUrl: 'http://localhost:9000/rules',
  auth: {
    clientId: 'user',
    redirectUri: 'auth.html',
    authUrl: 'http://localhost:9000/oauth2/access_token',
    logoutUrl: 'http://localhost:9000/signout'
  }
};
