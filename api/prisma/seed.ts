import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config'; // Esto carga tu .env

// 1. Configuramos el adaptador con tu URL segura
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// 2. Inicializamos Prisma pasándole el adaptador
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🎬 Iniciando la carga de categorías (i18n Keys)...');

  const categoryKeys = [
    'ACTION',
    'ADVENTURE',
    'COMEDY',
    'HORROR',
    'SCI_FI',
    'FANTASY',
    'ROMANCE',
    'DRAMA',
    'ANIMATION',
    'MUSICAL',
    'WESTERN',
    'WAR',
    'THRILLER_MYSTERY',
    'CRIME_COP',
    'DECADE_20_30',
    'DECADE_40_50',
    'DECADE_60',
    'DECADE_70',
    'DECADE_80',
    'DECADE_90',
    'DECADE_2000',
    'DECADE_2010',
    'DECADE_2020_PLUS',
    'AR_CINEMA',
    'LATAM_CINEMA',
    'US_CINEMA',
    'EU_CINEMA',
    'ASIAN_CINEMA',
    'CAST_DIRECTORS',
    'AWARDS_FESTIVALS',
    'BASED_ON_TRUE_EVENTS',
    'COMIC_BOOK_MOVIES',
    'LITERARY_ADAPTATIONS',
  ];

  for (const key of categoryKeys) {
    await prisma.category.upsert({
      where: { key },
      update: {},
      create: { key },
    });
  }

  console.log('✅ 33 Categorías (Keys) insertadas con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
