// Log when production environment is loaded
console.log('Loading PRODUCTION environment');

export const environment = {
  production: true,
  apiUrl: 'https://theluxarapi-4s3ok4xm.b4a.run/api',
  apiBaseUrl: 'https://theluxarapi-4s3ok4xm.b4a.run/api',
  auth: {
    baseUrl: 'https://theluxarapi-4s3ok4xm.b4a.run/auth',
    userUrl: 'https://theluxarapi-4s3ok4xm.b4a.run/users',
    clientDelimiter: '//',
    cookieNames: {
      accessToken: 'BAL_ess',
      refreshToken: 'BAL_esh',
    },
  },
};

// Force export a known production base URL that can be imported directly
export const PRODUCTION_API_URL = 'https://theluxarapi-4s3ok4xm.b4a.run';
