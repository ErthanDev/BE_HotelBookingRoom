import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { TransformInterceptor } from './core/transform.interceptor';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { RolesGuard } from './auth/guard/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );
  const reflector = app.get(Reflector);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor(reflector)); 
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalGuards(new RolesGuard(reflector));
  app.setGlobalPrefix('/api/');
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI
  });
  app.use(cookieParser());
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
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
