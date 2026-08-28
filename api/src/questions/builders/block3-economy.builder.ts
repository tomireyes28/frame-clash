// api/src/questions/builders/block3-economy.builder.ts
import { Difficulty } from '@prisma/client';
import { GeneratedQuestion, QuestionBuilder } from '../interfaces/question.interface';
import { getDistractors, getMoneyDistractors, shuffleArray } from '../pools/distractor.pool';

function formatMillions(amount: number): string {
  const inMillions = Math.round(amount / 1_000_000);
  if (inMillions >= 1000) {
    const inBillions = (amount / 1_000_000_000).toFixed(2);
    return `$${inBillions} mil millones de dólares`;
  }
  return `$${inMillions.toLocaleString('es-AR')} millones de dólares`;
}

export const buildBlock3EconomyQuestions: QuestionBuilder = (movie, pools, movieCategories) => {
  const questions: GeneratedQuestion[] = [];

  // =========================================================================
  // TIPO 10: Recaudación (Directa) - Dificultad MEDIUM / HARD
  // Ejemplo: "¿Cuál fue la recaudación mundial aproximada de 'Avengers: Endgame'?"
  // =========================================================================
  if (movie.revenue && movie.revenue >= 10_000_000) {
    const revenueMillions = Math.round(movie.revenue / 1_000_000);
    const correctRevenue = formatMillions(movie.revenue);
    const moneyDistractors = getMoneyDistractors(revenueMillions);

    if (moneyDistractors.length === 3) {
      questions.push({
        text: `¿Cuál fue la recaudación mundial aproximada en taquilla de "${movie.title}"?`,
        correctAnswer: correctRevenue,
        options: shuffleArray([correctRevenue, ...moneyDistractors]),
        difficulty: Difficulty.MEDIUM,
        block: 3,
        typeNumber: 10,
        categories: movieCategories,
      });

      // =========================================================================
      // TIPO 11: Recaudación (Inversa) - Dificultad HARD
      // Ejemplo: "¿Qué película rompió la taquilla con una recaudación aproximada de $2.923 millones de dólares?"
      // =========================================================================
      const movieDistractors = getDistractors(movie.title, pools.movies, 3);
      if (movieDistractors.length === 3) {
        questions.push({
          text: `¿Qué película alcanzó una recaudación en taquilla de aproximadamente ${correctRevenue}?`,
          correctAnswer: movie.title,
          options: shuffleArray([movie.title, ...movieDistractors]),
          difficulty: Difficulty.HARD,
          block: 3,
          typeNumber: 11,
          categories: movieCategories,
        });
      }
    }
  }

  // =========================================================================
  // TIPO 12: Presupuesto (Directa) - Dificultad MEDIUM / HARD
  // Ejemplo: "¿De cuánto fue el presupuesto oficial de producción de 'Piratas del Caribe 3'?"
  // =========================================================================
  if (movie.budget && movie.budget >= 100_000) {
    const budgetMillions = Math.round(movie.budget / 1_000_000);
    const correctBudget = formatMillions(movie.budget);
    const budgetDistractors = getMoneyDistractors(Math.max(1, budgetMillions));

    if (budgetDistractors.length === 3) {
      questions.push({
        text: `¿De cuánto fue el presupuesto estimado de producción para la película "${movie.title}"?`,
        correctAnswer: correctBudget,
        options: shuffleArray([correctBudget, ...budgetDistractors]),
        difficulty: Difficulty.MEDIUM,
        block: 3,
        typeNumber: 12,
        categories: movieCategories,
      });

      // =========================================================================
      // TIPO 13: Presupuesto (Inversa) - Dificultad HARD
      // Ejemplo: "¿Cuál de estas películas se filmó con un presupuesto de apenas $60.000 dólares?"
      // =========================================================================
      const movieDistractors = getDistractors(movie.title, pools.movies, 3);
      if (movieDistractors.length === 3) {
        questions.push({
          text: `¿Cuál de estas películas contó con un presupuesto de producción de aproximadamente ${correctBudget}?`,
          correctAnswer: movie.title,
          options: shuffleArray([movie.title, ...movieDistractors]),
          difficulty: Difficulty.HARD,
          block: 3,
          typeNumber: 13,
          categories: movieCategories,
        });
      }
    }
  }

  return questions;
};
