import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { MyLogger } from './logger/my.logger';
import { MyloggerDev } from 'src/logger/my.logger.dev';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // logger: new MyLogger(),
    bufferLogs: true
  });
  app.useLogger(new MyLogger())
  app.useGlobalPipes(new ValidationPipe());

  //enable cors
  app.enableCors();

  app.useStaticAssets(join(__dirname, '../uploads'), { prefix: '/uploads' });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
