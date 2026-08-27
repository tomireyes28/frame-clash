import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface CategorySeed {
  key: string;
  name: string;
  slug: string;
  icon: string;
  type: 'genre' | 'decade' | 'theme';
  tmdbId?: number;
}

async function main() {
  console.log('🎬 Iniciando la carga de las 31 Categorías Oficiales con Metadatos...');

  const categories: CategorySeed[] = [
    // 14 GÉNEROS
    { key: 'ACTION', name: 'Acción', slug: 'accion', icon: '💥', type: 'genre', tmdbId: 28 },
    { key: 'ADVENTURE', name: 'Aventura', slug: 'aventura', icon: '🗺️', type: 'genre', tmdbId: 12 },
    { key: 'COMEDY', name: 'Comedia', slug: 'comedia', icon: '😂', type: 'genre', tmdbId: 35 },
    { key: 'HORROR', name: 'Terror', slug: 'terror', icon: '👻', type: 'genre', tmdbId: 27 },
    { key: 'SCI_FI', name: 'Ciencia Ficción', slug: 'ciencia-ficcion', icon: '🚀', type: 'genre', tmdbId: 878 },
    { key: 'FANTASY', name: 'Fantasía', slug: 'fantasia', icon: '🧙', type: 'genre', tmdbId: 14 },
    { key: 'ROMANCE', name: 'Romance', slug: 'romance', icon: '💕', type: 'genre', tmdbId: 10749 },
    { key: 'DRAMA', name: 'Drama', slug: 'drama', icon: '🎭', type: 'genre', tmdbId: 18 },
    { key: 'ANIMATION', name: 'Animación', slug: 'animacion', icon: '🎨', type: 'genre', tmdbId: 16 },
    { key: 'MUSICAL', name: 'Musical', slug: 'musical', icon: '🎵', type: 'genre', tmdbId: 10402 },
    { key: 'WESTERN', name: 'Western', slug: 'western', icon: '🤠', type: 'genre', tmdbId: 37 },
    { key: 'WAR', name: 'Bélico', slug: 'belico', icon: '⚔️', type: 'genre', tmdbId: 10752 },
    { key: 'THRILLER_MYSTERY', name: 'Suspenso y Misterio', slug: 'suspenso-misterio', icon: '🔍', type: 'genre', tmdbId: 53 },
    { key: 'CRIME_COP', name: 'Crimen y Policial', slug: 'crimen-policial', icon: '🔫', type: 'genre', tmdbId: 80 },

    // 6 DÉCADAS
    { key: 'ERA_ORIGINS_SILENT', name: 'Orígenes y Cine Mudo (1895 - 1929)', slug: 'cine-mudo', icon: '🎞️', type: 'decade' },
    { key: 'ERA_CLASSIC_STUDIO', name: 'Cine Clásico y de Estudio (1930 - 1959)', slug: 'cine-clasico', icon: '🏛️', type: 'decade' },
    { key: 'ERA_NEW_WAVES_MODERN', name: 'Nuevas Olas y Cine Moderno (1960 - 1979)', slug: 'cine-moderno', icon: '📻', type: 'decade' },
    { key: 'ERA_BLOCKBUSTER_POP', name: 'La Era del Blockbuster y el Pop (1980 - 1999)', slug: 'era-blockbuster', icon: '📼', type: 'decade' },
    { key: 'ERA_NEW_MILLENNIUM', name: 'El Nuevo Milenio (2000 - 2019)', slug: 'nuevo-milenio', icon: '💿', type: 'decade' },
    { key: 'ERA_CONTEMPORARY', name: 'Cine Contemporáneo (2020+)', slug: 'cine-contemporaneo', icon: '📱', type: 'decade' },

    // 11 TEMÁTICAS / REGIONALES
    { key: 'CINEMA_AR', name: 'Cine Argentino', slug: 'cine-argentino', icon: '🇦🇷', type: 'theme' },
    { key: 'CINEMA_LATAM', name: 'Cine Latinoamericano', slug: 'cine-latam', icon: '🌎', type: 'theme' },
    { key: 'CINEMA_EU', name: 'Cine Europeo', slug: 'cine-europeo', icon: '🇪🇺', type: 'theme' },
    { key: 'CINEMA_ASIAN', name: 'Cine Asiático', slug: 'cine-asiatico', icon: '🌏', type: 'theme' },
    { key: 'CAST_DIRECTORS', name: 'Actores, Actrices y Directores/as', slug: 'cast-directores', icon: '🌟', type: 'theme' },
    { key: 'AWARDS_FESTIVALS', name: 'Premios y Festivales del Cine', slug: 'premios-festivales', icon: '🏆', type: 'theme' },
    { key: 'BASED_ON_TRUE_EVENTS', name: 'Basadas en Hechos Reales', slug: 'hechos-reales', icon: '📰', type: 'theme' },
    { key: 'COMIC_BOOK_MOVIES', name: 'Basadas en Cómics', slug: 'comics', icon: '🦸', type: 'theme' },
    { key: 'LITERARY_ADAPTATIONS', name: 'Adaptaciones Literarias', slug: 'adaptaciones-literarias', icon: '📖', type: 'theme' },
    { key: 'FRANCHISES_SAGAS', name: 'Sagas y Franquicias', slug: 'sagas-franquicias', icon: '🔗', type: 'theme' },
    { key: 'SPORTS_COMPETITION', name: 'Deportes y Competición', slug: 'deportes-competicion', icon: '⚽', type: 'theme' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { key: cat.key },
      update: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        type: cat.type,
        tmdbId: cat.tmdbId ?? null,
      },
      create: {
        key: cat.key,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        type: cat.type,
        tmdbId: cat.tmdbId ?? null,
      },
    });
  }

  console.log(`✅ ${categories.length} Categorías Oficiales insertadas con éxito.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });