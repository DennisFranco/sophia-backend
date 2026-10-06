export interface GenerateTutorResponseInput {
  systemInstruction: string;
  userMessage: string;
  conversationHistory?: Array<{
    role: 'user' | 'model';
    text: string;
  }>;
}

export interface GenerateTutorResponseResult {
  text: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  fallbackUsed?: boolean;
  providerError?: {
    name?: string;
    status?: number;
    message: string;
  };
}

export interface AiProvider {
  generateTutorResponse(
    input: GenerateTutorResponseInput,
  ): Promise<GenerateTutorResponseResult>;
}
