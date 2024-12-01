import * as dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';

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

  // const corsOptions = {
  //   origin: [
  //     process.env.CORS_ORIGIN,
  //     'https://webai2.work4creation.fun',
  //     'http://localhost:3001'  // 开发环境
  //   ],
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  //   allowedHeaders: ['Content-Type', 'Authorization'],
  //   credentials: true
  // };
  // app.use(cors(corsOptions));

  SwaggerModule.setup('docs', app, document);
  app.enableCors({
    // origin: 'https://webai2.work4creation.fun',
    // origin: 'http://localhost:8080',
    origin: [
      process.env.CORS_ORIGIN,
      'http://localhost:3001',
      'https://webai2.work4creation.fun',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });

  // 配置静态文件服务
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // 访问路径前缀
  });

  await app.listen(process.env.PORT);
}
bootstrap();
