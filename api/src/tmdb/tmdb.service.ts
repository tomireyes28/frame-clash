// api/src/tmdb/tmdb.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AxiosError } from 'axios';
import 'dotenv/config';



export interface TmdbCast {
  name: string;
  character: string;
}

export interface TmdbCrew {
  name: string;
  job: string;
}

// Así es exactamente como viene la peli cuando pedimos los detalles profundos
export interface TmdbMovieDetails {
  title: string;
  release_date: string;
  tagline: string;
  credits?: {
    cast: TmdbCast[];
    crew: TmdbCrew[];
  };
}

// Nuestra estructura final de pregunta generada
export interface GeneratedQuestion {
  pelicula: string;
  dificultad: string;
  pregunta: string;
  respuestaCorrecta: string;
  opcionesFalsas: string[];
}

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
  'vote_count.gte'?: number;
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
      include_adult: false,
    };

    if (genreId) {
      queryParams.with_genres = genreId;
    }

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

 // 1. Tipamos estrictamente la respuesta (chau any)
  async getMovieDetails(movieId: number): Promise<TmdbMovieDetails | null> {
    const url = `${process.env.TMDB_BASE_URL}/movie/${movieId}?append_to_response=credits&language=es-ES`;
    
    const config = {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        accept: 'application/json',
      },
    };

    try {
      const { data } = await firstValueFrom(this.httpService.get<TmdbMovieDetails>(url, config));
      return data;
    } catch (error) {
      console.error(`Error trayendo detalles de la peli ${movieId}:`, error);
      return null;
    }
  }

  // HELPER 1: Generador de años aleatorios (Para que no sea predecible)
  private getRandomYears(correctYearStr: string): string[] {
    const correctYear = parseInt(correctYearStr);
    if (isNaN(correctYear)) return ['1999', '2005', '2010']; // Fallback por si la peli no tiene año

    const options = new Set<string>();
    
    // Generamos números hasta tener exactamente 3 años distintos
    while (options.size < 3) {
      // Offset aleatorio entre -10 y +10 años
      const offset = Math.floor(Math.random() * 21) - 10;
      
      // Asegurarnos de que no sea el mismo año original
      if (offset !== 0) {
        options.add((correctYear + offset).toString());
      }
    }
    
    return Array.from(options);
  }

  // HELPER 2: Seleccionador de distractores (Evita que la respuesta correcta esté en las falsas)
  private getRandomDistractors(correctAnswer: string, pool: string[]): string[] {
    // 1. Filtramos para sacar la respuesta correcta si justo estaba en la piscina
    const validPool = pool.filter(item => item !== correctAnswer);
    
    // 2. Mezclamos la piscina de forma aleatoria
    const shuffled = validPool.sort(() => 0.5 - Math.random());
    
    // 3. Devolvemos los primeros 3
    return shuffled.slice(0, 3);
  }

  // 2. NUEVO MÉTODO: El motor se muda al servicio.
  async generateTestQuestions(): Promise<{ totalGeneradas: number; preguntas: GeneratedQuestion[] }> {
    const popularMovies = await this.getPopularMovies();
    const testMovies = popularMovies.slice(0, 5); 
    const generatedQuestions: GeneratedQuestion[] = [];

    // PISCINAS DE DATOS (En el futuro, esto lo sacaremos de tu base de datos)
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

      // 1. AÑO DE ESTRENO (Usa la función random que inventaste)
      generatedQuestions.push({
        pelicula: details.title,
        dificultad: 'NORMAL',
        pregunta: `¿En qué año se estrenó originalmente "${details.title}"?`,
        respuestaCorrecta: releaseYear,
        opcionesFalsas: this.getRandomYears(releaseYear) // <-- Magia acá
      });

      // 2. DIRECTOR (Usa la piscina, filtrando duplicados)
      if (director !== 'Desconocido') {
        generatedQuestions.push({
          pelicula: details.title,
          dificultad: 'EASY',
          pregunta: `¿Quién fue el director principal de la película "${details.title}"?`,
          respuestaCorrecta: director,
          opcionesFalsas: this.getRandomDistractors(director, DIRECTORS_POOL) // <-- Magia acá
        });
      }

      // 3. PROTAGONISTA
      if (leadActor !== 'Desconocido') {
        generatedQuestions.push({
          pelicula: details.title,
          dificultad: 'VERY_EASY',
          pregunta: `¿Cuál de estos actores interpretó el papel principal en "${details.title}"?`,
          respuestaCorrecta: leadActor,
          opcionesFalsas: this.getRandomDistractors(leadActor, ACTORS_POOL)
        });
      }

      // 4. PERSONAJE
      if (characterName !== 'Desconocido' && !characterName.includes('uncredited')) {
        generatedQuestions.push({
          pelicula: details.title,
          dificultad: 'HARD',
          pregunta: `¿En qué película aparece el personaje "${characterName}"?`,
          respuestaCorrecta: details.title,
          opcionesFalsas: this.getRandomDistractors(details.title, MOVIES_POOL)
        });
      }

      // 5. TAGLINE
      if (tagline && tagline.length > 5) {
        generatedQuestions.push({
          pelicula: details.title,
          dificultad: 'VERY_HARD',
          pregunta: `¿A qué película pertenece esta icónica frase promocional: "${tagline}"?`,
          respuestaCorrecta: details.title,
          opcionesFalsas: this.getRandomDistractors(details.title, MOVIES_POOL)
        });
      }
    }

    return {
      totalGeneradas: generatedQuestions.length,
      preguntas: generatedQuestions
    };
  }
}