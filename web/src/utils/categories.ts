// web/src/utils/categories.ts

export interface CategoryInfo {
  key: string;
  label: string;
  slug: string;
  icon: string;
  type: 'genre' | 'decade' | 'theme';
}

export const OFFICIAL_CATEGORIES: CategoryInfo[] = [
  // 14 GÉNEROS
  { key: 'ACTION', label: 'Acción', slug: 'accion', icon: '💥', type: 'genre' },
  { key: 'ADVENTURE', label: 'Aventura', slug: 'aventura', icon: '🗺️', type: 'genre' },
  { key: 'COMEDY', label: 'Comedia', slug: 'comedia', icon: '😂', type: 'genre' },
  { key: 'HORROR', label: 'Terror', slug: 'terror', icon: '👻', type: 'genre' },
  { key: 'SCI_FI', label: 'Ciencia Ficción', slug: 'ciencia-ficcion', icon: '🚀', type: 'genre' },
  { key: 'FANTASY', label: 'Fantasía', slug: 'fantasia', icon: '🧙', type: 'genre' },
  { key: 'ROMANCE', label: 'Romance', slug: 'romance', icon: '💕', type: 'genre' },
  { key: 'DRAMA', label: 'Drama', slug: 'drama', icon: '🎭', type: 'genre' },
  { key: 'ANIMATION', label: 'Animación', slug: 'animacion', icon: '🎨', type: 'genre' },
  { key: 'MUSICAL', label: 'Musical', slug: 'musical', icon: '🎵', type: 'genre' },
  { key: 'WESTERN', label: 'Western', slug: 'western', icon: '🤠', type: 'genre' },
  { key: 'WAR', label: 'Bélico', slug: 'belico', icon: '⚔️', type: 'genre' },
  { key: 'THRILLER_MYSTERY', label: 'Suspenso y Misterio', slug: 'suspenso-misterio', icon: '🔍', type: 'genre' },
  { key: 'CRIME_COP', label: 'Crimen y Policial', slug: 'crimen-policial', icon: '🔫', type: 'genre' },

  // 6 DÉCADAS
  { key: 'ERA_ORIGINS_SILENT', label: 'Orígenes y Cine Mudo (1895 - 1929)', slug: 'cine-mudo', icon: '🎞️', type: 'decade' },
  { key: 'ERA_CLASSIC_STUDIO', label: 'Cine Clásico (1930 - 1959)', slug: 'cine-clasico', icon: '🏛️', type: 'decade' },
  { key: 'ERA_NEW_WAVES_MODERN', label: 'Cine Moderno (1960 - 1979)', slug: 'cine-moderno', icon: '📻', type: 'decade' },
  { key: 'ERA_BLOCKBUSTER_POP', label: 'Era Blockbuster (1980 - 1999)', slug: 'era-blockbuster', icon: '📼', type: 'decade' },
  { key: 'ERA_NEW_MILLENNIUM', label: 'Nuevo Milenio (2000 - 2019)', slug: 'nuevo-milenio', icon: '💿', type: 'decade' },
  { key: 'ERA_CONTEMPORARY', label: 'Cine Contemporáneo (2020+)', slug: 'cine-contemporaneo', icon: '📱', type: 'decade' },

  // 11 TEMÁTICAS / REGIONALES
  { key: 'CINEMA_AR', label: 'Cine Argentino', slug: 'cine-argentino', icon: '🇦🇷', type: 'theme' },
  { key: 'CINEMA_LATAM', label: 'Cine Latinoamericano', slug: 'cine-latam', icon: '🌎', type: 'theme' },
  { key: 'CINEMA_EU', label: 'Cine Europeo', slug: 'cine-europeo', icon: '🇪🇺', type: 'theme' },
  { key: 'CINEMA_ASIAN', label: 'Cine Asiático', slug: 'cine-asiatico', icon: '🌏', type: 'theme' },
  { key: 'CAST_DIRECTORS', label: 'Actores y Directores', slug: 'cast-directores', icon: '🌟', type: 'theme' },
  { key: 'AWARDS_FESTIVALS', label: 'Premios y Festivales', slug: 'premios-festivales', icon: '🏆', type: 'theme' },
  { key: 'BASED_ON_TRUE_EVENTS', label: 'Basadas en Hechos Reales', slug: 'hechos-reales', icon: '📰', type: 'theme' },
  { key: 'COMIC_BOOK_MOVIES', label: 'Basadas en Cómics', slug: 'comics', icon: '🦸', type: 'theme' },
  { key: 'LITERARY_ADAPTATIONS', label: 'Adaptaciones Literarias', slug: 'adaptaciones-literarias', icon: '📖', type: 'theme' },
  { key: 'FRANCHISES_SAGAS', label: 'Sagas y Franquicias', slug: 'sagas-franquicias', icon: '🔗', type: 'theme' },
  { key: 'SPORTS_COMPETITION', label: 'Deportes y Competición', slug: 'deportes-competicion', icon: '⚽', type: 'theme' },
];