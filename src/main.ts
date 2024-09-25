import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

import { TransformInterceptor } from './core/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );
  const reflector = app.get(Reflector);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor(reflector)); 
  app.setGlobalPrefix('/api/');
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI
  });
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  await app.listen(port || 3000).then(async () => {
    console.log(`Application is running on: ${await app.getUrl()}`);
  }).catch((error) => {
    console.error('Error starting the application:', error);
  });
  
}
bootstrap();
