// api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configuramos CORS de forma profesional
  // Esto permite que tu frontend en el puerto 3001 hable con el backend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // 2. Restauramos el Validador Global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Borra cualquier dato que no esté en el DTO
      forbidNonWhitelisted: true, // Tira error si mandan datos extraños
      transform: true, // Convierte tipos automáticamente (ej: string a number)
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 El Coliseo de Frame Clash está vivo en: http://localhost:${port}`);
}

// 3. Solución al error de ESLint (Floating Promises)
// Al agregar el .catch(), le estamos dando un "paracaídas" a la promesa de arranque
bootstrap().catch((err) => {
  console.error('❌ Error crítico al iniciar la API:', err);
  process.exit(1);
});