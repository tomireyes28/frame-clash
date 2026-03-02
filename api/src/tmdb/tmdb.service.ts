// api/src/tmdb/tmdb.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AxiosError } from 'axios';
import 'dotenv/config';

// 1. Tipado estricto: Lo que nos importa de cada película
export interface TmdbMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  genre_ids: number[];
}

// 2. Tipado estricto: La respuesta cruda de la API de TMDB
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
  'vote_count.gte': number;
  include_adult: boolean;
  with_genres?: string;
  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
}

@Injectable()
export class TmdbService {
  constructor(private readonly httpService: HttpService) {}

  async searchMovie(query: string): Promise<TmdbMovie[]> {
    const url = `${process.env.TMDB_BASE_URL}/search/movie`;
    
    // Configuramos la petición con tu Token de seguridad y el idioma español
    const config = {
      params: {
        query,
        language: 'es-ES',
        page: 1,
        include_adult: false,
      },
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        accept: 'application/json',
      },
    };

    // Hacemos la petición y transformamos el Observable de Axios en una Promesa
    const { data } = await firstValueFrom(
      this.httpService.get<TmdbSearchResponse>(url, config).pipe(
        catchError((error: AxiosError) => {
          console.error('Error conectando con TMDB:', error.response?.data || error.message);
          throw new HttpException(
            'Error al comunicarse con la API de TMDB',
            HttpStatus.BAD_GATEWAY,
          );
        }),
      ),
    );

    // Devolvemos solo la lista de películas para no arrastrar la paginación a otros servicios
    return data.results;
  }

  // NUEVO: Ahora acepta un genreId opcional
  async getPopularMovies(genreId?: string, minYear?: string, maxYear?: string): Promise<TmdbMovie[]> {
    const url = `${process.env.TMDB_BASE_URL}/discover/movie`;
    
    // Usamos nuestra interfaz estricta en lugar de 'any'
    const queryParams: DiscoverQueryParams = {
      language: 'es-ES',
      page: 1,
      sort_by: 'vote_count.desc', 
      'vote_count.gte': 3000,
      include_adult: false,
    };

    if (genreId) {
      queryParams.with_genres = genreId;
    }

    // TMDB pide formato YYYY-MM-DD. Si nos pasan "1980", armamos "1980-01-01"
    if (minYear) {
      queryParams['primary_release_date.gte'] = `${minYear}-01-01`;
    }

    if (maxYear) {
      queryParams['primary_release_date.lte'] = `${maxYear}-12-31`;
    }

    const config = {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        accept: 'application/json',
      },
    };

    const { data } = await firstValueFrom(
      this.httpService.get<TmdbSearchResponse>(url, config).pipe(
        catchError((error: AxiosError) => {
          console.error('Error conectando con TMDB (Popular):', error.response?.data || error.message);
          throw new HttpException(
            'Error al obtener películas populares de TMDB',
            HttpStatus.BAD_GATEWAY,
          );
        }),
      ),
    );

    return data.results;
  }
}