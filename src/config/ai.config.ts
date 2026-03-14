export default () => ({
  ai: {
    openAiApiKey: process.env.OPENAI_API_KEY || '',
    azureOpenAiApiKey: process.env.AZURE_OPENAI_API_KEY || '',
    azureOpenAiEndpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    azureOpenAiDeployment: process.env.AZURE_OPENAI_DEPLOYMENT || '',
  },
});
