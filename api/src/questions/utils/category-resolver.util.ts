// api/src/questions/utils/category-resolver.util.ts
import { TmdbMovieDetails } from '../../tmdb/interfaces/tmdb.interface';

const GENRE_TMDB_TO_KEY: Record<number, string> = {
  28: 'ACTION',
  12: 'ADVENTURE',
  35: 'COMEDY',
  27: 'HORROR',
  878: 'SCI_FI',
  14: 'FANTASY',
  10749: 'ROMANCE',
  18: 'DRAMA',
  16: 'ANIMATION',
  10402: 'MUSICAL',
  37: 'WESTERN',
  10752: 'WAR',
  53: 'THRILLER_MYSTERY',
  80: 'CRIME_COP',
};

export function resolveCategoriesForMovie(movie: TmdbMovieDetails, extraCategories: string[] = []): string[] {
  const categoryKeys = new Set<string>(extraCategories);

  // 1. DÉCADA OBLIGATORIA
  if (movie.release_date) {
    const year = parseInt(movie.release_date.substring(0, 4), 10);
    if (!isNaN(year)) {
      if (year < 1930) {
        categoryKeys.add('ERA_ORIGINS_SILENT');
      } else if (year >= 1930 && year <= 1959) {
        categoryKeys.add('ERA_CLASSIC_STUDIO');
      } else if (year >= 1960 && year <= 1979) {
        categoryKeys.add('ERA_NEW_WAVES_MODERN');
      } else if (year >= 1980 && year <= 1999) {
        categoryKeys.add('ERA_BLOCKBUSTER_POP');
      } else if (year >= 2000 && year <= 2019) {
        categoryKeys.add('ERA_NEW_MILLENNIUM');
      } else if (year >= 2020) {
        categoryKeys.add('ERA_CONTEMPORARY');
      }
    }
  }

  // 2. GÉNEROS (de TMDB)
  if (movie.genres && Array.isArray(movie.genres)) {
    for (const g of movie.genres) {
      const key = GENRE_TMDB_TO_KEY[g.id];
      if (key) {
        categoryKeys.add(key);
      }
    }
  }

  // 3. SAGAS Y FRANQUICIAS
  if (movie.belongs_to_collection) {
    categoryKeys.add('FRANCHISES_SAGAS');
  }

  // 4. REGIONAL / PAÍSES
  const countries = movie.production_countries?.map(c => c.iso_3166_1?.toUpperCase() || c.name?.toLowerCase()) || [];
  if (countries.includes('AR') || countries.some(c => c.includes('argentina'))) {
    categoryKeys.add('CINEMA_AR');
    categoryKeys.add('CINEMA_LATAM');
  } else if (['MX', 'BR', 'CO', 'CL', 'UY', 'PE'].some(code => countries.includes(code))) {
    categoryKeys.add('CINEMA_LATAM');
  }

  if (['FR', 'GB', 'ES', 'DE', 'IT', 'SE', 'DK'].some(code => countries.includes(code))) {
    categoryKeys.add('CINEMA_EU');
  }

  if (['JP', 'KR', 'CN', 'HK', 'IN'].some(code => countries.includes(code))) {
    categoryKeys.add('CINEMA_ASIAN');
  }

  // 5. KEYWORDS TEMÁTICAS
  const keywordsList = (movie.keywords?.keywords || movie.keywords?.results || []).map(k => k.name.toLowerCase());
  const hasKeyword = (terms: string[]) => keywordsList.some(k => terms.some(t => k.includes(t)));

  if (hasKeyword(['superhero', 'comic', 'marvel', 'dc comics', 'batman', 'avengers', 'superman', 'spider-man'])) {
    categoryKeys.add('COMIC_BOOK_MOVIES');
  }

  if (hasKeyword(['biography', 'based on true story', 'historical', 'true events', 'real life'])) {
    categoryKeys.add('BASED_ON_TRUE_EVENTS');
  }

  if (hasKeyword(['based on novel', 'based on book', 'adaptation', 'literary'])) {
    categoryKeys.add('LITERARY_ADAPTATIONS');
  }

  if (hasKeyword(['sport', 'football', 'soccer', 'boxing', 'basketball', 'baseball', 'racing', 'olympics'])) {
    categoryKeys.add('SPORTS_COMPETITION');
  }

  return Array.from(categoryKeys);
}
