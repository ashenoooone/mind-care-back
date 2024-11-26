import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('АПИ для записи к психологу')
    .setDescription('')
    .setVersion('1.0')
    .addTag('')
    .build();

  app.enableCors({
    origin: '*',
  });

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(process.env.PORT ?? 8080);
}

bootstrap();
