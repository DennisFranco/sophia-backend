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
  private readonly debugEnabled: boolean;

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('ai.geminiApiKey');

    this.model = this.configService.get<string>(
      'ai.geminiModel',
      'gemini-3.1-flash-lite',
    );
    this.debugEnabled = this.configService.get<boolean>('ai.debug', false);

    if (!apiKey) {
      this.enabled = false;
      this.logger.warn(
        `Gemini provider disabled: GEMINI_API_KEY is missing. model=${this.model}`,
      );
      return;
    }

    this.client = new GoogleGenAI({ apiKey });
    this.enabled = true;

    this.logger.log(
      `Gemini provider configured. model=${this.model} apiKeyPresent=true`,
    );
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

      // Gemini 3.x deprecó parámetros de muestreo como temperature.
      // Usamos el valor por defecto del modelo para evitar incompatibilidades.
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
      const normalized = this.normalizeProviderError(error);

      this.logger.error(
        `Gemini request failed. model=${this.model} name=${normalized.name ?? 'unknown'} status=${normalized.status ?? 'unknown'} message=${normalized.message}`,
      );

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
        ...(this.debugEnabled ? { providerError: normalized } : {}),
      };
    }
  }

  private normalizeProviderError(error: unknown): {
    name?: string;
    status?: number;
    message: string;
  } {
    if (error instanceof Error) {
      const withStatus = error as Error & {
        status?: unknown;
        statusCode?: unknown;
      };

      const rawStatus = withStatus.status ?? withStatus.statusCode;
      const status = typeof rawStatus === 'number' ? rawStatus : undefined;

      return {
        name: error.name,
        status,
        message: error.message || 'Unknown Gemini provider error',
      };
    }

    return {
      message:
        typeof error === 'string'
          ? error
          : 'Unknown Gemini provider error',
    };
  }
}
