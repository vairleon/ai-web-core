import * as dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
async function bootstrap() {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI web core')
    .setDescription('The AI web API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.useBodyParser('json', { limit: '10mb' });
  app.useBodyParser('raw', { limit: '100mb' });
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document);
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    // origin: 'http://localhost:8080',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });
  await app.listen(process.env.PORT);
}
bootstrap();
