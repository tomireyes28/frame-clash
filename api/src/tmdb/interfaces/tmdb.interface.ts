// api/src/tmdb/interfaces/tmdb.interface.ts

export interface TmdbCast {
  id: number;
  name: string;
  character: string;
  order: number;
}

export interface TmdbCrew {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TmdbProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TmdbCollection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface TmdbKeyword {
  id: number;
  name: string;
}

export interface TmdbImageItem {
  file_path: string;
  width: number;
  height: number;
  iso_639_1: string | null;
}

export interface TmdbMovieDetails {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  tagline: string;
  overview: string;
  revenue: number;
  budget: number;
  runtime: number;
  vote_average: number;
  vote_count: number;
  popularity: number;
  poster_path: string | null;
  backdrop_path: string | null;
  original_language: string;
  genres: TmdbGenre[];
  production_companies: TmdbProductionCompany[];
  production_countries: TmdbProductionCountry[];
  belongs_to_collection: TmdbCollection | null;
  credits?: {
    cast: TmdbCast[];
    crew: TmdbCrew[];
  };
  keywords?: {
    keywords?: TmdbKeyword[];
    results?: TmdbKeyword[];
  };
  images?: {
    backdrops: TmdbImageItem[];
    posters: TmdbImageItem[];
  };
}

export interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  vote_average: number;
  popularity: number;
}

export interface TmdbSearchResponse {
  page: number;
  results: TmdbMovie[];
  total_results: number;
  total_pages: number;
}

export interface DiscoverQueryParams {
  language: string;
  page: number;
  sort_by: string;
  'vote_count.gte'?: number;
  include_adult: boolean;
  with_genres?: string;
  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
}