import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.enableCors();

  const port = process.env.PORT ?? 4000;
  const host = process.env.HOST ?? '127.0.0.1';
  await app.listen(port, host);
  console.log(`Closdex API listening on ${host}:${port}`);
}

bootstrap();
