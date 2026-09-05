import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { env } from './config/envs';

async function bootstrap() {

  const logger = new Logger('Reservaciones-API')
  const app = await NestFactory.create(AppModule);


  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  await app.listen(env.port);
  logger.log(`API Rerservaciones running on port ${env.port}`)

}
bootstrap();
