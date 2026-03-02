// api/src/questions/templates/basic.template.ts
import { QuestionTemplate } from '../interfaces/question.interface';
import { getRandomYears, getRandomDistractors } from '../../common/utils/random.util';

// 👷‍♂️ OBRERO 1: Especialista en Años
export const generateYearQuestion: QuestionTemplate = (movie, pools) => {
  const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : null;
  if (!releaseYear) return null; // Si no hay año, este obrero no puede trabajar

  return {
    pelicula: movie.title,
    dificultad: 'NORMAL',
    pregunta: `¿En qué año se estrenó originalmente "${movie.title}"?`,
    respuestaCorrecta: releaseYear,
    opcionesFalsas: getRandomYears(releaseYear),
  };
};

// 👷‍♂️ OBRERO 2: Especialista en Directores
export const generateDirectorQuestion: QuestionTemplate = (movie, pools) => {
  const director = movie.credits?.crew?.find(c => c.job === 'Director')?.name;
  if (!director) return null;

  return {
    pelicula: movie.title,
    dificultad: 'EASY',
    pregunta: `¿Quién fue el director principal de la película "${movie.title}"?`,
    respuestaCorrecta: director,
    opcionesFalsas: getRandomDistractors(director, pools.directors),
  };
};

// 👷‍♂️ OBRERO 3: Especialista en Taglines (Frases promocionales)
export const generateTaglineQuestion: QuestionTemplate = (movie, pools) => {
  const tagline = movie.tagline;
  if (!tagline || tagline.length < 5) return null;

  return {
    pelicula: movie.title,
    dificultad: 'VERY_HARD',
    pregunta: `¿A qué película pertenece esta icónica frase promocional: "${tagline}"?`,
    respuestaCorrecta: movie.title,
    opcionesFalsas: getRandomDistractors(movie.title, pools.movies),
  };
};

// Exportamos la lista de todos los obreros de este archivo
export const basicTemplates = [
  generateYearQuestion,
  generateDirectorQuestion,
  generateTaglineQuestion,
];