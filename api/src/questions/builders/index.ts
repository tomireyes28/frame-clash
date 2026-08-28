// api/src/questions/builders/index.ts
import { GeneratedQuestion, QuestionBuilder, QuestionPools } from '../interfaces/question.interface';
import { TmdbMovieDetails } from '../../tmdb/interfaces/tmdb.interface';
import { defaultQuestionPools } from '../pools/distractor.pool';
import { buildBlock1CastQuestions } from './block1-cast.builder';
import { buildBlock2DateQuestions } from './block2-dates.builder';
import { buildBlock3EconomyQuestions } from './block3-economy.builder';
import { buildBlock4CinephileQuestions } from './block4-cinephile.builder';
import { buildBlock5VisualQuestions } from './block5-visual.builder';

export {
  buildBlock1CastQuestions,
  buildBlock2DateQuestions,
  buildBlock3EconomyQuestions,
  buildBlock4CinephileQuestions,
  buildBlock5VisualQuestions,
};

export const ALL_QUESTION_BUILDERS: QuestionBuilder[] = [
  buildBlock1CastQuestions,
  buildBlock2DateQuestions,
  buildBlock3EconomyQuestions,
  buildBlock4CinephileQuestions,
  buildBlock5VisualQuestions,
];

/**
 * Ejecuta los 5 bloques (24 tipos de preguntas) para una película determinada
 * utilizando los datos enriquecidos de TMDB y los pools de distractores.
 */
export function generateAllQuestionsForMovie(
  movie: TmdbMovieDetails,
  movieCategories: string[],
  customPools?: Partial<QuestionPools>,
): GeneratedQuestion[] {
  const pools: QuestionPools = {
    ...defaultQuestionPools,
    ...(customPools || {}),
  };

  const allQuestions: GeneratedQuestion[] = [];

  for (const builder of ALL_QUESTION_BUILDERS) {
    try {
      const questionsFromBlock = builder(movie, pools, movieCategories);
      if (questionsFromBlock && questionsFromBlock.length > 0) {
        allQuestions.push(...questionsFromBlock);
      }
    } catch (error) {
      console.error(`Error al ejecutar builder para la película "${movie.title}":`, error);
    }
  }

  return allQuestions;
}
