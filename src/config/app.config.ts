export default () => ({
  app: {
    name: process.env.APP_NAME || 'SOPHIA Backend',
    port: Number(process.env.PORT || 3000),
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:19006',
  },
});
