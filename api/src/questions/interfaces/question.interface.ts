// api/src/questions/interfaces/question.interface.ts
import { TmdbMovieDetails } from '../../tmdb/interfaces/tmdb.interface';


export interface GeneratedQuestion {
  pelicula: string;
  dificultad: string;
  pregunta: string;
  respuestaCorrecta: string;
  opcionesFalsas: string[];
}

// Los "Pools" que la plantilla necesita para armar distractores
export interface QuestionPools {
  directors: string[];
  actors: string[];
  movies: string[];
}

// El "Contrato": Toda plantilla debe ser una función que reciba una peli y los pools, 
// y devuelva una pregunta (o null si a la peli le faltan datos).
export type QuestionTemplate = (movie: TmdbMovieDetails, pools: QuestionPools) => GeneratedQuestion | null;

// El "Contrato" para las Batallas: Recibe un array de películas
export type BattleTemplate = (movies: TmdbMovieDetails[]) => GeneratedQuestion | null;