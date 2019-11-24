export const environment = {
  production: false,
  secure: false,
  backendUrl: 'http://backend:9000/api',
  rulesUrl: 'http://backend:9000/rules',
  auth: {
    clientId: 'user',
    redirectUri: 'auth.html',
    authUrl: 'http://backend:9000/oauth2/access_token',
    logoutUrl: 'http://backend:9000/signout'
  }
};