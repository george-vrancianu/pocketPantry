import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import type { AppConfig } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: 12 * 1024 * 1024 }),
  );
  const config = app.get(ConfigService<AppConfig, true>);

  configureApp(app);
  app.enableCors({
    origin: [
      config.get('CLIENT_ORIGIN', { infer: true }),
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      /^http:\/\/(?:10\.(?:25[0-5]|2[0-4]\d|1?\d?\d)\.(?:25[0-5]|2[0-4]\d|1?\d?\d)\.(?:25[0-5]|2[0-4]\d|1?\d?\d)|192\.168\.(?:25[0-5]|2[0-4]\d|1?\d?\d)\.(?:25[0-5]|2[0-4]\d|1?\d?\d)|172\.(?:1[6-9]|2\d|3[0-1])\.(?:25[0-5]|2[0-4]\d|1?\d?\d)\.(?:25[0-5]|2[0-4]\d|1?\d?\d)):(?:5173|5174)$/,
    ],
    credentials: true,
    methods: 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pocket Pantry API')
    .setDescription('Pocket Pantry API')
    .setVersion('1.0')
    .addCookieAuth('better-auth.session_token')
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  const port = config.get('PORT', { infer: true });
  await app.listen(port, '0.0.0.0');
  Logger.log(`API listening on port ${port} (all interfaces)`, 'Bootstrap');
}

void bootstrap();
