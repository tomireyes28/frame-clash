import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🎬 Iniciando la carga de las 30 Categorías Oficiales (i18n Keys)...');

  const categoryKeys = [
    'ACTION',                    // 1. Acción
    'ADVENTURE',                 // 2. Aventura
    'COMEDY',                    // 3. Comedia
    'HORROR',                    // 4. Terror
    'SCI_FI',                    // 5. Ciencia Ficción
    'FANTASY',                   // 6. Fantasía
    'ROMANCE',                   // 7. Romance
    'DRAMA',                     // 8. Drama
    'ANIMATION',                 // 9. Animación
    'MUSICAL',                   // 10. Musical
    'WESTERN',                   // 11. Western
    'WAR',                       // 12. Bélico
    'THRILLER_MYSTERY',          // 13. Suspenso y Misterio
    'CRIME_COP',                 // 14. Crimen y Policial
    'ERA_ORIGINS_SILENT',        // 15. Orígenes y Cine Mudo (1895 - 1929)
    'ERA_CLASSIC_STUDIO',        // 16. Cine Clásico y de Estudio (1930 - 1959)
    'ERA_NEW_WAVES_MODERN',      // 17. Nuevas Olas y Cine Moderno (1960 - 1979)
    'ERA_BLOCKBUSTER_POP',       // 18. La Era del Blockbuster y el Pop (1980 - 1999)
    'ERA_NEW_MILLENNIUM',        // 19. El Nuevo Milenio (2000 - 2019)
    'ERA_CONTEMPORARY',          // 20. Cine Contemporáneo (2020+)
    'CINEMA_AR',                 // 21. Cine argentino
    'CINEMA_LATAM',              // 22. Cine latinoamericano
    'CINEMA_EU',                 // 23. Cine europeo
    'CINEMA_ASIAN',              // 24. Cine asiático
    'CAST_DIRECTORS',            // 25. Actores, Actrices y Directores/as
    'AWARDS_FESTIVALS',          // 26. Premios y Festivales del Cine
    'BASED_ON_TRUE_EVENTS',      // 27. Basadas en hechos reales
    'COMIC_BOOK_MOVIES',         // 28. Basadas en cómics
    'LITERARY_ADAPTATIONS',      // 29. Adaptaciones literarias
    'FRANCHISES_SAGAS',          // 30. Sagas y Franquicias
  ];

  for (const key of categoryKeys) {
    await prisma.category.upsert({
      where: { key },
      update: {}, 
      create: { key },
    });
  }

  console.log(`✅ ${categoryKeys.length} Categorías (Keys) insertadas con éxito.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });