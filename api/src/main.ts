import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // NUEVO: Le damos permiso a tu frontend para consumir la API
  app.enableCors({
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      // Comenta esta línea solo para probar:
      // forbidNonWhitelisted: true, 
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();