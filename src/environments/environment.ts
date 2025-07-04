export const environment = {
  production: false,
  apiBaseUrl: '/api',
  auth: {
    baseUrl: '/api/auth',
    userUrl: '/api/users',
    clientDelimiter: '///',
    cookieNames: {
      accessToken: 'BAL_ess',
      refreshToken: 'BAL_esh',
    },
  },
};
