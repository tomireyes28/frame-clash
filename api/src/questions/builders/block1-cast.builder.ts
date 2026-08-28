// api/src/questions/builders/block1-cast.builder.ts
import { Difficulty } from '@prisma/client';
import { GeneratedQuestion, QuestionBuilder } from '../interfaces/question.interface';
import { getDistractors, shuffleArray } from '../pools/distractor.pool';

export const buildBlock1CastQuestions: QuestionBuilder = (movie, pools, movieCategories) => {
  const questions: GeneratedQuestion[] = [];

  // =========================================================================
  // TIPO 1: Director (Directa) - Dificultad EASY
  // Ejemplo: "¿Quién es el director de la película 'Avatar'?"
  // =========================================================================
  const director = movie.credits?.crew?.find(c => c.job === 'Director')?.name;
  if (director) {
    const distractors = getDistractors(director, pools.directors, 3);
    if (distractors.length === 3) {
      questions.push({
        text: `¿Quién es el director de la película "${movie.title}"?`,
        correctAnswer: director,
        options: shuffleArray([director, ...distractors]),
        difficulty: Difficulty.EASY,
        block: 1,
        typeNumber: 1,
        categories: movieCategories,
      });
    }
  }

  // =========================================================================
  // TIPO 2: Actor a Personaje (Directa) - Dificultad EASY / MEDIUM
  // Ejemplo: "¿Qué actor interpreta a 'Tony Stark' en 'Iron Man'?"
  // 👉 Si la peli tiene varios actores principales, generamos hasta 4 preguntas!
  // =========================================================================
  const topCast = (movie.credits?.cast || [])
    .filter(c => c.name && c.character && c.character.trim().length > 0)
    .slice(0, 4); // Tomamos hasta los 4 actores principales

  for (let i = 0; i < topCast.length; i++) {
    const castMember = topCast[i];
    const characterClean = castMember.character.split('/')[0].trim(); // Limpia "Tony Stark / Iron Man" a "Tony Stark"
    
    // Distractores de actores
    const actorDistractors = getDistractors(castMember.name, pools.actors, 3);
    if (actorDistractors.length === 3) {
      questions.push({
        text: `¿Qué actor/actriz interpreta a "${characterClean}" en la película "${movie.title}"?`,
        correctAnswer: castMember.name,
        options: shuffleArray([castMember.name, ...actorDistractors]),
        difficulty: i === 0 ? Difficulty.EASY : Difficulty.MEDIUM,
        block: 1,
        typeNumber: 2,
        categories: movieCategories,
      });
    }

    // =========================================================================
    // TIPO 3: Personaje a Actor (Inversa) - Dificultad MEDIUM
    // Ejemplo: "En 'El Caballero de la Noche', ¿a qué personaje interpreta 'Heath Ledger'?"
    // =========================================================================
    // Buscamos 3 personajes distractores (de la bolsa o de otros personajes)
    const otherCharactersInMovie = topCast
      .filter((_, idx) => idx !== i)
      .map(c => c.character.split('/')[0].trim());

    let charDistractors = otherCharactersInMovie.slice(0, 3);
    if (charDistractors.length < 3) {
      const extraDistractors = getDistractors(characterClean, pools.characters, 3 - charDistractors.length);
      charDistractors = [...charDistractors, ...extraDistractors];
    }

    if (charDistractors.length === 3) {
      questions.push({
        text: `En "${movie.title}", ¿a qué personaje interpreta "${castMember.name}"?`,
        correctAnswer: characterClean,
        options: shuffleArray([characterClean, ...charDistractors]),
        difficulty: Difficulty.MEDIUM,
        block: 1,
        typeNumber: 3,
        categories: movieCategories,
      });
    }
  }

  return questions;
};
