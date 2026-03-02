import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // NUEVO: Le damos permiso a tu frontend para consumir la API
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Filtra cualquier dato basura que manden extra
      forbidNonWhitelisted: true, // Tira error si mandan datos no definidos en el DTO
      transform: true, // Transforma los tipos automáticamente (ej: strings a números si corresponde)
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();