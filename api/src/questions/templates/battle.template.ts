// api/src/questions/templates/battle.template.ts
import { BattleTemplate } from '../interfaces/question.interface';
import { TmdbMovieDetails } from '../../tmdb/interfaces/tmdb.interface';

// Función auxiliar para sacar 4 películas distintas al azar del balde
const getRandomFour = (movies: TmdbMovieDetails[]) => {
  const shuffled = [...movies].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
};

// 🥊 OBRERO DE BATALLA 1: Mayor Recaudación (Taquilla)
export const generateRevenueBattle: BattleTemplate = (movies) => {
  // 1. Nos aseguramos de usar solo películas que tengan el dato de recaudación cargado (> 0)
  const validMovies = movies.filter(m => m.revenue && m.revenue > 0);
  
  // Si no juntamos al menos 4 películas con datos, cancelamos la pelea
  if (validMovies.length < 4) return null; 

  // 2. Elegimos 4 al azar
  const contenders = getRandomFour(validMovies);

  // 3. Las ordenamos de MAYOR a MENOR recaudación
  contenders.sort((a, b) => b.revenue - a.revenue);

  // 4. El ganador es el índice 0. Los perdedores son el 1, 2 y 3.
  const winner = contenders[0];
  const losers = [contenders[1].title, contenders[2].title, contenders[3].title];

  return {
    pelicula: 'Múltiples (Batalla Taquilla)', // Para que sepas en el JSON de qué trata
    dificultad: 'HARD',
    pregunta: `¿Cuál de estas 4 películas tuvo la mayor recaudación en taquilla a nivel mundial?`,
    respuestaCorrecta: winner.title,
    opcionesFalsas: losers,
  };
};

// Exportamos nuestro batallón
export const battleTemplates = [
  generateRevenueBattle,
];