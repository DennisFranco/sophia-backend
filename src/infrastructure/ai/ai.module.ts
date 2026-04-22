import { Module } from '@nestjs/common';
import { GeminiProvider } from './providers/gemini.provider';

@Module({
  providers: [
    {
      provide: 'AI_PROVIDER',
      useClass: GeminiProvider,
    },
  ],
  exports: ['AI_PROVIDER'],
})
export class AiModule {}
