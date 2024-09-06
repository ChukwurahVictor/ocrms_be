import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RequestInterceptor } from './common/interceptors/request.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ErrorsInterceptor } from './common/interceptors/error.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const appHost = configService.get('app.host');
  const appPort = configService.get('app.port');
  console.log('🚀 ~ file: main.ts:15 ~ bootstrap ~ appHost:', appHost);

  const initSwagger = (app: INestApplication, serverUrl: string) => {
    const config = new DocumentBuilder()
      .setTitle('Online Complaint Registration and Management System')
      .setDescription(
        'An online application for reporting and managing complaints.',
      )
      .addServer(serverUrl)
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/swagger', app, document);
  };

  initSwagger(app, appHost);

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  app.useGlobalInterceptors(
    new RequestInterceptor(),
    new ResponseInterceptor(),
    new ErrorsInterceptor(),
  );

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // app.useGlobalFilters(new ValidationExceptionFilter());

  await app.listen(appPort);
}
bootstrap();
