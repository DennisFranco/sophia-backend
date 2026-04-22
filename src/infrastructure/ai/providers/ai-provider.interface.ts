export interface GenerateTutorResponseInput {
  systemInstruction: string;
  userMessage: string;
  conversationHistory?: Array<{
    role: 'user' | 'model';
    text: string;
  }>;
  temperature?: number;
}

export interface GenerateTutorResponseResult {
  text: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  fallbackUsed?: boolean;
}

export interface AiProvider {
  generateTutorResponse(
    input: GenerateTutorResponseInput,
  ): Promise<GenerateTutorResponseResult>;
}
