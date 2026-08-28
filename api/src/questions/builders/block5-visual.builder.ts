// api/src/questions/builders/block5-visual.builder.ts
import { Difficulty } from '@prisma/client';
import { GeneratedQuestion, QuestionBuilder } from '../interfaces/question.interface';
import { getDistractors, shuffleArray } from '../pools/distractor.pool';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w780';

export const buildBlock5VisualQuestions: QuestionBuilder = (movie, pools, movieCategories) => {
  const questions: GeneratedQuestion[] = [];

  // =========================================================================
  // TIPO 23: El Fotograma / Frame (Directa) - Dificultad MEDIUM / HARD
  // Ejemplo: [Imagen de una escena icónica de la película sin texto] "¿A qué película corresponde esta escena?"
  // =========================================================================
  const backdropPath = movie.backdrop_path || movie.images?.backdrops?.[0]?.file_path;
  if (backdropPath) {
    const movieDistractors = getDistractors(movie.title, pools.movies, 3);
    if (movieDistractors.length === 3) {
      questions.push({
        text: '¿A qué película corresponde esta escena / fotograma?',
        correctAnswer: movie.title,
        options: shuffleArray([movie.title, ...movieDistractors]),
        difficulty: Difficulty.MEDIUM,
        block: 5,
        typeNumber: 23,
        imageUrl: `${TMDB_IMAGE_BASE}${backdropPath}`,
        categories: movieCategories,
      });
    }
  }

  // =========================================================================
  // TIPO 24: El Póster Ciego / Textless Poster (Directa) - Dificultad HARD
  // Ejemplo: [Arte del póster sin título o póster limpio] "¿A qué película pertenece este póster oficial?"
  // =========================================================================
  // Buscamos un póster sin texto en images.posters (iso_639_1 === null) o el poster_path principal
  const textlessPoster = movie.images?.posters?.find(p => p.iso_639_1 === null)?.file_path || movie.poster_path;
  if (textlessPoster) {
    const movieDistractors = getDistractors(movie.title, pools.movies, 3);
    if (movieDistractors.length === 3) {
      questions.push({
        text: '¿A qué película pertenece este póster oficial?',
        correctAnswer: movie.title,
        options: shuffleArray([movie.title, ...movieDistractors]),
        difficulty: Difficulty.HARD,
        block: 5,
        typeNumber: 24,
        imageUrl: `${TMDB_IMAGE_BASE}${textlessPoster}`,
        categories: movieCategories,
      });
    }
  }

  return questions;
};
