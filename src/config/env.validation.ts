import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  PORT: Joi.number().port().default(3000),

  APP_NAME: Joi.string().default('SOPHIA Backend'),
  API_PREFIX: Joi.string().default('api/v1'),
  FRONTEND_URL: Joi.string().required(),
  CORS_ORIGINS: Joi.string().allow('').optional(),
  SWAGGER_ENABLED: Joi.boolean().truthy('true').falsy('false').optional(),

  MONGODB_URI: Joi.string().required(),

  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(8).max(14).default(10),

  GEMINI_API_KEY: Joi.string().allow('').optional(),
  GEMINI_MODEL: Joi.string().default('gemini-3.1-flash-lite'),

  OPENAI_API_KEY: Joi.string().allow('').optional(),
  AZURE_OPENAI_API_KEY: Joi.string().allow('').optional(),
  AZURE_OPENAI_ENDPOINT: Joi.string().allow('').optional(),
  AZURE_OPENAI_DEPLOYMENT: Joi.string().allow('').optional(),

  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
    .default('debug'),
});
