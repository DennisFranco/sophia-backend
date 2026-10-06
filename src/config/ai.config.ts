export default () => ({
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
    debug: process.env.AI_DEBUG === 'true',
  },
});
