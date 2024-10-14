import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { TransformInterceptor } from './core/transform.interceptor';
import { JwtAuthGuard } from './module/auth/guard/jwt-auth.guard';
import { RolesGuard } from './module/auth/guard/roles.guard';
import helmet from 'helmet';
import { join } from 'path';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );
  const reflector = app.get(Reflector);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalGuards(new RolesGuard(reflector));
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
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
  app.use(helmet());
  await app.listen(port || 3000).then(async () => {
    console.log(`Application is running on: ${await app.getUrl()}`);
  }).catch((error) => {
    console.error('Error starting the application:', error);
  });

}
bootstrap();
