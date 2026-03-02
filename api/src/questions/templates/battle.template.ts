// api/src/questions/templates/battle.template.ts
import { BattleTemplate } from '../interfaces/question.interface';
import { TmdbMovieDetails } from '../../tmdb/interfaces/tmdb.interface';

const getRandomFour = (movies: TmdbMovieDetails[]) => {
  const shuffled = [...movies].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
};

// 💰 BATALLA 1: Recaudación (Ya la teníamos)
export const generateRevenueBattle: BattleTemplate = (movies) => {
  const validMovies = movies.filter(m => m.revenue && m.revenue > 0);
  if (validMovies.length < 4) return null; 

  const contenders = getRandomFour(validMovies);
  contenders.sort((a, b) => b.revenue - a.revenue);

  return {
    pelicula: 'Batalla (Taquilla)',
    dificultad: 'HARD',
    pregunta: `¿Cuál de estas 4 películas tuvo la mayor recaudación en taquilla a nivel mundial?`,
    respuestaCorrecta: contenders[0].title,
    opcionesFalsas: [contenders[1].title, contenders[2].title, contenders[3].title],
  };
};

// 💸 BATALLA 2: Mayor Presupuesto
export const generateBudgetBattle: BattleTemplate = (movies) => {
  const validMovies = movies.filter(m => m.budget && m.budget > 0);
  if (validMovies.length < 4) return null; 

  const contenders = getRandomFour(validMovies);
  contenders.sort((a, b) => b.budget - a.budget); // Ordenamos de mayor a menor presupuesto

  return {
    pelicula: 'Batalla (Presupuesto)',
    dificultad: 'HARD',
    pregunta: `¿Cuál de estas 4 películas tuvo el presupuesto de producción más alto?`,
    respuestaCorrecta: contenders[0].title,
    opcionesFalsas: [contenders[1].title, contenders[2].title, contenders[3].title],
  };
};

// ⏳ BATALLA 3: Mayor Duración (Runtime)
export const generateRuntimeBattle: BattleTemplate = (movies) => {
  const validMovies = movies.filter(m => m.runtime && m.runtime > 0);
  if (validMovies.length < 4) return null; 

  const contenders = getRandomFour(validMovies);
  contenders.sort((a, b) => b.runtime - a.runtime); // De mayor a menor duración

  return {
    pelicula: 'Batalla (Duración)',
    dificultad: 'NORMAL',
    pregunta: `¿Cuál de estas 4 películas tiene la mayor duración (más minutos de metraje)?`,
    respuestaCorrecta: contenders[0].title,
    opcionesFalsas: [contenders[1].title, contenders[2].title, contenders[3].title],
  };
};

// 📅 BATALLA 4: Cuál salió primero (Antigüedad)
export const generateOldestBattle: BattleTemplate = (movies) => {
  const validMovies = movies.filter(m => m.release_date);
  if (validMovies.length < 4) return null; 

  const contenders = getRandomFour(validMovies);
  
  // Ordenamos por fecha convirtiendo el string 'YYYY-MM-DD' a milisegundos
  contenders.sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());

  return {
    pelicula: 'Batalla (Año)',
    dificultad: 'HARD',
    pregunta: `¿Cuál de estas 4 películas se estrenó primero en cines?`,
    respuestaCorrecta: contenders[0].title,
    opcionesFalsas: [contenders[1].title, contenders[2].title, contenders[3].title],
  };
};

// Exportamos nuestro batallón completo
export const battleTemplates = [
  generateRevenueBattle,
  generateBudgetBattle,
  generateRuntimeBattle,
  generateOldestBattle
];