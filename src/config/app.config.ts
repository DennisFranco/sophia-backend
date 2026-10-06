const splitCsv = (value?: string): string[] => {
  return (value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

export default () => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:19006';
  const corsOrigins = splitCsv(process.env.CORS_ORIGINS);

  return {
    app: {
      name: process.env.APP_NAME || 'SOPHIA Backend',
      port: Number(process.env.PORT || 3000),
      apiPrefix: process.env.API_PREFIX || 'api/v1',
      nodeEnv: process.env.NODE_ENV || 'development',
      frontendUrl,
      corsOrigins: corsOrigins.length > 0 ? corsOrigins : [frontendUrl],
      swaggerEnabled:
        process.env.SWAGGER_ENABLED !== undefined
          ? process.env.SWAGGER_ENABLED === 'true'
          : process.env.NODE_ENV !== 'production',
    },
  };
};
