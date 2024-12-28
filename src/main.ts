//Custom Modules, Packages, Configs, etc.
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerService } from './core/swagger/swagger.service';
import validationOptions from './utils/validate/validation-options';

//pnpm packages
import helmet from 'helmet';
import * as hpp from 'hpp';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { setupGracefulShutdown } from 'nestjs-graceful-shutdown';
import { HttpExceptionFilter } from './core/handler/error/http-exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  setupGracefulShutdown({ app });

  const configService = app.get(ConfigService);

  app.setGlobalPrefix(
    configService.get<string>('API_GLOBAL_PREFIX', { infer: true }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(hpp());
  app.use(compression());
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  const swaggerService = app.get(SwaggerService);
  swaggerService.setupSwagger(app);
  const PORT = configService.get<string>('API_PORT', { infer: true });

  app.enableCors({
    origin: [
      configService.get<string>('CORS_ORIGIN', { infer: true }),
      configService.get<string>('CORS_ORIGIN_LOCAL', { infer: true }),
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(
    configService.get<number>('API_PORT', { infer: true }),
    '0.0.0.0',
  );

  Logger.log(`🚀 Application is running on: http://localhost:${PORT}/`);
}
void bootstrap();