// api/src/tmdb/tmdb.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AxiosError } from 'axios';
import 'dotenv/config';
import { 
  TmdbMovie, TmdbSearchResponse, DiscoverQueryParams, 
  TmdbMovieDetails 
} from './interfaces/tmdb.interface';

@Injectable()
export class TmdbService {
  constructor(private readonly httpService: HttpService) {}

  async searchMovie(query: string): Promise<TmdbMovie[]> {
    const url = `${process.env.TMDB_BASE_URL}/search/movie`;
    const config = {
      params: { query, language: 'es-ES', page: 1, include_adult: false },
      headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`, accept: 'application/json' },
    };

    const { data } = await firstValueFrom(
      this.httpService.get<TmdbSearchResponse>(url, config).pipe(
        catchError((error: AxiosError) => {
          console.error('Error conectando con TMDB:', error.response?.data || error.message);
          throw new HttpException('Error al comunicarse con la API de TMDB', HttpStatus.BAD_GATEWAY);
        }),
      ),
    );

    return data.results;
  }

  async getPopularMovies(genreId?: string, minYear?: string, maxYear?: string): Promise<TmdbMovie[]> {
    const url = `${process.env.TMDB_BASE_URL}/discover/movie`;
    const queryParams: DiscoverQueryParams = {
      language: 'es-ES', page: 1, sort_by: 'vote_count.desc', include_adult: false,
    };

    if (genreId) queryParams.with_genres = genreId;
    if (minYear) queryParams['primary_release_date.gte'] = `${minYear}-01-01`;
    if (maxYear) queryParams['primary_release_date.lte'] = `${maxYear}-12-31`;

    const config = {
      params: queryParams,
      headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`, accept: 'application/json' },
    };

    const { data } = await firstValueFrom(
      this.httpService.get<TmdbSearchResponse>(url, config).pipe(
        catchError((error: AxiosError) => {
          console.error('Error conectando con TMDB (Popular):', error.response?.data || error.message);
          throw new HttpException('Error al obtener populares', HttpStatus.BAD_GATEWAY);
        }),
      ),
    );

    return data.results;
  }

  async getMovieDetails(movieId: number): Promise<TmdbMovieDetails | null> {
    const url = `${process.env.TMDB_BASE_URL}/movie/${movieId}?append_to_response=credits&language=es-ES`;
    const config = {
      headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`, accept: 'application/json' },
    };

    try {
      const { data } = await firstValueFrom(this.httpService.get<TmdbMovieDetails>(url, config));
      return data;
    } catch (error) {
      console.error(`Error trayendo detalles de la peli ${movieId}:`, error);
      return null;
    }
  }
}