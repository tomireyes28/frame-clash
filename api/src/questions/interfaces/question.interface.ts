// api/src/questions/interfaces/question.interface.ts
import { Difficulty } from '@prisma/client';
import { TmdbMovieDetails } from '../../tmdb/interfaces/tmdb.interface';

export interface GeneratedQuestion {
  text: string;
  correctAnswer: string;
  options: string[]; // Exactamente 4 opciones (1 correcta + 3 falsas mezcladas)
  difficulty: Difficulty;
  block: number;     // 1: Elenco, 2: Fechas, 3: Economía, 4: Cinéfilo, 5: Visual
  typeNumber: number;// 1 al 24
  imageUrl?: string; // Para fotogramas o posters ciegos
  categories: string[]; // Keys de categorías oficiales
}

export interface QuestionPools {
  directors: string[];
  actors: string[];
  characters: string[];
  movies: string[];
  studios: string[];
  countries: string[];
  languages: string[];
  sagas: string[];
}

export type QuestionBuilder = (
  movie: TmdbMovieDetails,
  pools: QuestionPools,
  movieCategories: string[],
) => GeneratedQuestion[];