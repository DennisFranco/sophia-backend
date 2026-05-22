import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';

import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';

const server = express();

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      {
        bufferLogs: true,
      },
    );

    const configService = app.get(ConfigService);
    const logger = new Logger('VercelBootstrap');

    const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
    const appName = configService.get<string>('app.name', 'SOPHIA Backend');
    const frontendUrl = configService.get<string>('app.frontendUrl');

    app.setGlobalPrefix(apiPrefix);

    app.use(helmet());
    app.use(compression());

    app.enableCors({
      origin: frontendUrl ? [frontendUrl] : true,
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.useGlobalFilters(new GlobalExceptionFilter());

    const swaggerConfig = new DocumentBuilder()
      .setTitle(appName)
      .setDescription('API documentation for SOPHIA mobile backend')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste access token here',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    await app.init();

    logger.log(`Application initialized on Vercel with prefix: /${apiPrefix}`);

    cachedServer = server;
  }

  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  return app(req, res);
}
