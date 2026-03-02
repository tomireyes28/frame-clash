// api/src/tmdb/tmdb.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AxiosError } from 'axios';
import 'dotenv/config';
import { 
  TmdbMovie, TmdbSearchResponse, DiscoverQueryParams, 
  TmdbMovieDetails, GeneratedQuestion 
} from './interfaces/tmdb.interface';

import { getRandomYears, getRandomDistractors } from '../common/utils/random.util';

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

  async generateTestQuestions(): Promise<{ totalGeneradas: number; preguntas: GeneratedQuestion[] }> {
    const popularMovies = await this.getPopularMovies();
    const testMovies = popularMovies.slice(0, 5); 
    const generatedQuestions: GeneratedQuestion[] = [];

    const DIRECTORS_POOL = ['Steven Spielberg', 'Quentin Tarantino', 'Martin Scorsese', 'James Cameron', 'David Fincher', 'Ridley Scott', 'Peter Jackson', 'Denis Villeneuve', 'Alfonso Cuarón'];
    const ACTORS_POOL = ['Brad Pitt', 'Tom Cruise', 'Leonardo DiCaprio', 'Morgan Freeman', 'Robert De Niro', 'Al Pacino', 'Johnny Depp', 'Keanu Reeves', 'Christian Bale', 'Cillian Murphy'];
    const MOVIES_POOL = ['El Padrino', 'Matrix', 'Pulp Fiction', 'Forrest Gump', 'Gladiador', 'Jurassic Park', 'Titanic', 'El Señor de los Anillos', 'El Club de la Pelea', 'Duna'];

    for (const movie of testMovies) {
      const details = await this.getMovieDetails(movie.id);
      if (!details) continue;

      const releaseYear = details.release_date ? details.release_date.substring(0, 4) : 'Desconocido';
      const director = details.credits?.crew?.find(c => c.job === 'Director')?.name || 'Desconocido';
      const leadActor = details.credits?.cast?.[0]?.name || 'Desconocido';
      const characterName = details.credits?.cast?.[0]?.character || 'Desconocido';
      const tagline = details.tagline; 

      generatedQuestions.push({
        pelicula: details.title,
        dificultad: 'NORMAL',
        pregunta: `¿En qué año se estrenó originalmente "${details.title}"?`,
        respuestaCorrecta: releaseYear,
        // Usamos la función importada
        opcionesFalsas: getRandomYears(releaseYear) 
      });

      if (director !== 'Desconocido') {
        generatedQuestions.push({
          pelicula: details.title,
          dificultad: 'EASY',
          pregunta: `¿Quién fue el director principal de la película "${details.title}"?`,
          respuestaCorrecta: director,
          // Usamos la función importada
          opcionesFalsas: getRandomDistractors(director, DIRECTORS_POOL) 
        });
      }

      if (leadActor !== 'Desconocido') {
        generatedQuestions.push({
          pelicula: details.title,
          dificultad: 'VERY_EASY',
          pregunta: `¿Cuál de estos actores interpretó el papel principal en "${details.title}"?`,
          respuestaCorrecta: leadActor,
          opcionesFalsas: getRandomDistractors(leadActor, ACTORS_POOL)
        });
      }

      if (characterName !== 'Desconocido' && !characterName.includes('uncredited')) {
        generatedQuestions.push({
          pelicula: details.title,
          dificultad: 'HARD',
          pregunta: `¿En qué película aparece el personaje "${characterName}"?`,
          respuestaCorrecta: details.title,
          opcionesFalsas: getRandomDistractors(details.title, MOVIES_POOL)
        });
      }

      if (tagline && tagline.length > 5) {
        generatedQuestions.push({
          pelicula: details.title,
          dificultad: 'VERY_HARD',
          pregunta: `¿A qué película pertenece esta icónica frase promocional: "${tagline}"?`,
          respuestaCorrecta: details.title,
          opcionesFalsas: getRandomDistractors(details.title, MOVIES_POOL)
        });
      }
    }

    return {
      totalGeneradas: generatedQuestions.length,
      preguntas: generatedQuestions
    };
  }
}