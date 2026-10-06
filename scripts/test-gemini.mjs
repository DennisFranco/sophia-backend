import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

if (!apiKey) {
  console.error('[Gemini smoke] GEMINI_API_KEY is missing');
  process.exit(1);
}

console.log(`[Gemini smoke] model=${model} apiKeyPresent=true`);

const ai = new GoogleGenAI({ apiKey });

try {
  const response = await ai.models.generateContent({
    model,
    contents: 'Responde únicamente con la palabra OK.',
  });

  console.log('[Gemini smoke] success', {
    text: response.text?.trim(),
    inputTokens: response.usageMetadata?.promptTokenCount,
    outputTokens: response.usageMetadata?.candidatesTokenCount,
    totalTokens: response.usageMetadata?.totalTokenCount,
  });
} catch (error) {
  console.error('[Gemini smoke] failed', {
    name: error?.name,
    status: error?.status ?? error?.statusCode,
    message: error?.message,
  });
  process.exit(1);
}
