const fs = require('fs');
//const dotenv = require('dotenv').defult();

require('dotenv').config();

const environment = process.env.ENVIRONMENT;

let BACKEND_URL;
let RULES_URL;
let AUTH_URL;
let LOGOUT_URL;

if (environment === 'production') {
    BACKEND_URL = process.env.BACKEND_URL;
    RULES_URL = process.env.RULES_URL;
    AUTH_URL = process.env.AUTH_URL;
    LOGOUT_URL = process.env.LOGOUT_URL;
} 

const targetPath = `./src/environments/environment.prod.ts`;
const envConfigFile = `
export const environment = {
    production: true,
    backendUrl: '${BACKEND_URL}',
    rulesUrl: '${RULES_URL}',
    auth: {
      clientId: 'user',
      redirectUri: 'auth.html',
      authUrl: '${AUTH_URL}',
      logoutUrl: '${LOGOUT_URL}'
    }
  };
`;

console.log(('IMPORTING ENV VAR \n'));

fs.writeFile(targetPath, envConfigFile, function (err) {
    if (err) {
        throw console.error(err);
    } else {
        console.log('Angular environment.ts file generated correctly at ${targetPath}');
    }
});
