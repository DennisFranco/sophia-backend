export default () => ({
  database: {
    mongodbUri: process.env.MONGODB_URI || '',
  },
});
