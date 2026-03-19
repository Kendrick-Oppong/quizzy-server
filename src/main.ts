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
  const swaggerServers = [] as { url: string; description?: string }[];

  if (process.env.SWAGGER_BASE_URL) {
    swaggerServers.push({
      url: process.env.SWAGGER_BASE_URL,
      description: 'Configured base URL',
    });
  } else if (process.env.CORS_ORIGINS) {
    const origins = process.env.CORS_ORIGINS.split(',')
      .map((o) => o.trim())
      .filter(Boolean);
    origins.forEach((origin, i) =>
      swaggerServers.push({ url: origin, description: `CORS origin ${i + 1}` }),
    );
  } else {
    swaggerServers.push({ url: defaultHost, description: 'Local server' });
  }

  const baseUrl = `${swaggerServers[0].url}/api`;

  const configBuilder = new DocumentBuilder()
    .setTitle('Quizzy API')
    .setDescription(
      `The Quizzy Application API documentation\n\n**Base URL:** \`${baseUrl}\``,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('refresh_token');

  swaggerServers.forEach(({ url, description }) =>
    configBuilder.addServer(url, description),
  );

  const config = configBuilder.build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { docExpansion: 'none' },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
