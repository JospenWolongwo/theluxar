export const environment = {
  production: false,
  apiBaseUrl: '/api',
  auth: {
    baseUrl: 'http://localhost:3000/auth',
    userUrl: 'http://localhost:3000/users',
    clientDelimiter: '//',
    cookieNames: {
      accessToken: 'BAL_ess',
      refreshToken: 'BAL_esh',
    },
  },
};
