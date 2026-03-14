export default () => ({
  logger: {
    level: process.env.LOG_LEVEL || 'debug',
  },
});
