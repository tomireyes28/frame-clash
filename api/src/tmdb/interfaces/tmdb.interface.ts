// api/src/tmdb/interfaces/tmdb.interface.ts

export interface TmdbCast {
  name: string;
  character: string;
}

export interface TmdbCrew {
  name: string;
  job: string;
}

export interface TmdbMovieDetails {
  title: string;
  release_date: string;
  tagline: string;
  revenue: number;  
  budget: number;  
  runtime: number;  
  credits?: {
    cast: TmdbCast[];
    crew: TmdbCrew[];
  };
}

export interface TmdbMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  genre_ids: number[];
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