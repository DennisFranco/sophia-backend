import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

import type {
  AiProvider,
  GenerateTutorResponseInput,
  GenerateTutorResponseResult,
} from './ai-provider.interface';

@Injectable()
export class GeminiProvider implements AiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly client?: GoogleGenAI;
  private readonly model: string;
  private readonly enabled: boolean;

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('ai.geminiApiKey');

    this.model = this.configService.get<string>(
      'ai.geminiModel',
      'gemini-3.1-flash-lite-preview',
    );

    if (!apiKey) {
      this.enabled = false;
      return;
    }

    this.client = new GoogleGenAI({ apiKey });
    this.enabled = true;
  }

  async generateTutorResponse(
    input: GenerateTutorResponseInput,
  ): Promise<GenerateTutorResponseResult> {
    if (!this.enabled || !this.client) {
      return {
        text: [
          'En este momento el tutor IA no está disponible.',
          'Puedo seguir guiándote con el contenido configurado del curso cuando la integración esté activa.',
          'Por ahora intenta formular tu duda indicando:',
          '1. tema,',
          '2. qué entiendes,',
          '3. en qué paso te bloqueaste.',
        ].join(' '),
        model: 'fallback:no-api-key',
        fallbackUsed: true,
      };
    }

    try {
      const history =
        input.conversationHistory?.map((item) => ({
          role: item.role,
          parts: [{ text: item.text }],
        })) ?? [];

      const response = await this.client.models.generateContent({
        model: this.model,
        contents: [
          ...history,
          {
            role: 'user',
            parts: [{ text: input.userMessage }],
          },
        ],
        config: {
          systemInstruction: input.systemInstruction,
          temperature: input.temperature ?? 0.3,
        },
      });

      const usage = response.usageMetadata;
      const text = response.text?.trim();

      if (!text) {
        return {
          text: [
            'No pude generar una respuesta útil en este momento.',
            'Intenta reformular la pregunta indicando el tema y el paso donde tienes dificultad.',
          ].join(' '),
          model: `${this.model}:empty-response`,
          fallbackUsed: true,
        };
      }

      return {
        text,
        model: this.model,
        inputTokens: usage?.promptTokenCount,
        outputTokens: usage?.candidatesTokenCount,
        totalTokens: usage?.totalTokenCount,
        fallbackUsed: false,
      };
    } catch (error: unknown) {
      const normalizedMessage =
        error instanceof Error
          ? error.message
          : 'Unknown Gemini provider error';

      this.logger.error('Gemini provider error', normalizedMessage);

      return {
        text: [
          'El tutor IA no pudo responder en este momento.',
          'Te sugiero intentar de nuevo con una pregunta más concreta.',
          'Incluye el tema, el concepto que no entiendes y el paso exacto donde te bloqueaste.',
        ].join(' '),
        model: `${this.model}:fallback-error`,
        fallbackUsed: true,
        outputTokens: 0,
        totalTokens: 0,
        inputTokens: 0,
      };
    }
  }
}
