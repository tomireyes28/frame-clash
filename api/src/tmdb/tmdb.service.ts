import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosError } from 'axios'; // 👈 Tipos estrictos de Axios
import 'dotenv/config';
import { 
  TmdbMovie, TmdbSearchResponse, DiscoverQueryParams, 
  TmdbMovieDetails 
} from './interfaces/tmdb.interface';

@Injectable()
export class TmdbService {
  constructor(private readonly httpService: HttpService) {}

  // 🔥 1. Tipamos config como AxiosRequestConfig para quitar el error amarillo
  private async fetchFromTmdb(url: string, config: AxiosRequestConfig): Promise<TmdbMovie[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<TmdbSearchResponse>(url, config)
      );
      return data.results || [];
    } catch (error: unknown) { // 🔥 2. Chau 'any', hola 'unknown'
      // 3. Verificamos el tipo de error para leerlo seguro sin que llore el linter
      if (error instanceof AxiosError) {
        console.error(`Error TMDB (Status ${error.response?.status}):`, error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error('Error interno TMDB:', error.message);
      }
      return [];
    }
  }

 async searchMovie(query: string, chunk: number = 1): Promise<TmdbMovie[]> {
    const url = `${process.env.TMDB_BASE_URL}/search/movie`;
    
    // 🔥 LÓGICA DE BLOQUES: Si chunk=1 (1,2,3), Si chunk=2 (4,5,6)
    const startPage = (chunk - 1) * 3 + 1;
    const pagesToFetch = [startPage, startPage + 1, startPage + 2];

    const requests = pagesToFetch.map(page => {
      const config: AxiosRequestConfig = {
        params: { 
          query, language: 'es-MX', page, include_adult: false, include_image_language: 'es-AR,es-MX,es,en,null' 
        },
        headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`, accept: 'application/json' },
      };
      return this.fetchFromTmdb(url, config);
    });

    const results = await Promise.all(requests);
    const allMovies = results.flat();
    return Array.from(new Map(allMovies.map(m => [m.id, m])).values());
  }

  async getPopularMovies(genreId?: string, minYear?: string, maxYear?: string, chunk: number = 1): Promise<TmdbMovie[]> {
    const url = `${process.env.TMDB_BASE_URL}/discover/movie`;
    
    // 🔥 LÓGICA DE BLOQUES
    const startPage = (chunk - 1) * 3 + 1;
    const pagesToFetch = [startPage, startPage + 1, startPage + 2];

    const requests = pagesToFetch.map(page => {
      const queryParams: DiscoverQueryParams = {
        language: 'es-MX', page, sort_by: 'vote_count.desc', include_adult: false,
      };

      if (genreId) queryParams.with_genres = genreId;
      if (minYear) queryParams['primary_release_date.gte'] = `${minYear}-01-01`;
      if (maxYear) queryParams['primary_release_date.lte'] = `${maxYear}-12-31`;

      const config: AxiosRequestConfig = {
        params: { ...queryParams, include_image_language: 'es-AR,es-MX,es,en,null' },
        headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`, accept: 'application/json' },
      };

      return this.fetchFromTmdb(url, config);
    });

    const results = await Promise.all(requests);
    const allMovies = results.flat();
    return Array.from(new Map(allMovies.map(m => [m.id, m])).values());
  }

  async getMovieDetails(movieId: number): Promise<TmdbMovieDetails | null> {
    const url = `${process.env.TMDB_BASE_URL}/movie/${movieId}?append_to_response=credits&language=es-MX`;
    const config: AxiosRequestConfig = {
      headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`, accept: 'application/json' },
    };

    try {
      const { data } = await firstValueFrom(this.httpService.get<TmdbMovieDetails>(url, config));
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) console.error(`Error peli ${movieId}:`, error.message);
      return null;
    }
  }
}