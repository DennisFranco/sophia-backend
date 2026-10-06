// RUTA: /test/app.e2e-spec.ts

import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from './../src/app.module';

describe('SOPHIA Backend (e2e)', () => {
  let app: INestApplication<App>;
  let apiPrefix: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    /*
     * main.ts aplica este prefijo cuando se ejecuta la aplicación real.
     * En los tests E2E debemos configurarlo explícitamente porque
     * bootstrap() de main.ts no se ejecuta.
     */
    const configService = app.get(ConfigService);

    apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');

    app.setGlobalPrefix(apiPrefix);

    await app.init();
  }, 15_000);

  afterAll(async () => {
    await app?.close();
  });

  it('GET /api/v1/health debe responder correctamente', async () => {
    const response = await request(app.getHttpServer())
      .get(`/${apiPrefix}/health`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        message: 'SOPHIA backend is running',
        timestamp: expect.any(String),
      }),
    );

    expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
  });
});
