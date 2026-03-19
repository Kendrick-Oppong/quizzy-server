import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const origins =
    process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) || [];

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? '3000';
  const defaultHost = `http://localhost:${port}`;
  const backendUrl = process.env.BACKEND_URL ?? defaultHost;
  const baseUrl = `${backendUrl}/api`;

  const config = new DocumentBuilder()
    .setTitle('Quizzy API')
    .setDescription(
      `The Quizzy Application API documentation\n\n**Base URL:** \`${baseUrl}\``,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('refresh_token')
    .addServer(
      backendUrl,
      process.env.BACKEND_URL ? 'Production server' : 'Local server',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { docExpansion: 'none' },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
