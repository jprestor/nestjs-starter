import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { LoggerService } from './core/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(LoggerService)); // custom logger
  app.use(helmet()); // security html headers
  app.useGlobalPipes(new ValidationPipe({ whitelist: true })); // global request body validation

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
