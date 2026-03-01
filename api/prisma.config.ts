// api/prisma.config.ts
import { defineConfig } from '@prisma/config';
import 'dotenv/config'; // Asegura que lea tu archivo .env local

export default defineConfig({
  migrations: {
    seed: 'npx ts-node prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
