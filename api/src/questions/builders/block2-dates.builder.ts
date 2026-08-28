// api/src/questions/builders/block2-dates.builder.ts
import { Difficulty } from '@prisma/client';
import { GeneratedQuestion, QuestionBuilder } from '../interfaces/question.interface';
import { getDistractors, getYearDistractors, getRuntimeDistractors, shuffleArray } from '../pools/distractor.pool';

// Meses en español
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function formatDateSpanish(dateStr: string): string | null {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = parts[0];
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day) || month < 1 || month > 12) return null;

  return `${day} de ${MONTH_NAMES[month - 1]} de ${year}`;
}

export const buildBlock2DateQuestions: QuestionBuilder = (movie, pools, movieCategories) => {
  const questions: GeneratedQuestion[] = [];
  const releaseDate = movie.release_date;
  const releaseYear = releaseDate ? releaseDate.substring(0, 4) : null;

  // =========================================================================
  // TIPO 4: Año (Directa) - Dificultad EASY
  // Ejemplo: "¿En qué año se estrenó originalmente 'Volver al Futuro'?"
  // =========================================================================
  if (releaseYear && releaseYear.length === 4) {
    const yearDistractors = getYearDistractors(releaseYear);
    if (yearDistractors.length === 3) {
      questions.push({
        text: `¿En qué año se estrenó originalmente "${movie.title}"?`,
        correctAnswer: releaseYear,
        options: shuffleArray([releaseYear, ...yearDistractors]),
        difficulty: Difficulty.EASY,
        block: 2,
        typeNumber: 4,
        categories: movieCategories,
      });
    }

    // =========================================================================
    // TIPO 5: Año (Inversa) - Dificultad MEDIUM
    // Ejemplo: "¿Cuál de estas películas se estrenó en el año 1999?"
    // =========================================================================
    const movieDistractors = getDistractors(movie.title, pools.movies, 3);
    if (movieDistractors.length === 3) {
      questions.push({
        text: `¿Cuál de estas películas se estrenó originalmente en el año ${releaseYear}?`,
        correctAnswer: movie.title,
        options: shuffleArray([movie.title, ...movieDistractors]),
        difficulty: Difficulty.MEDIUM,
        block: 2,
        typeNumber: 5,
        categories: movieCategories,
      });
    }
  }

  // =========================================================================
  // TIPO 6: Fecha Exacta (Directa) - Dificultad HARD
  // Ejemplo: "¿Cuál fue la fecha exacta de estreno de 'Star Wars: Ep. IV'?"
  // =========================================================================
  const formattedDate = releaseDate ? formatDateSpanish(releaseDate) : null;
  if (formattedDate && releaseDate) {
    const parts = releaseDate.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    // Generamos 3 fechas falsas verosímiles (mismo año o +-1 año, días y meses variados)
    const fakeDates = [
      `${Math.max(1, (day + 11) % 28)} de ${MONTH_NAMES[(month + 2) % 12]} de ${year}`,
      `${Math.max(1, (day + 18) % 28)} de ${MONTH_NAMES[(month + 5) % 12]} de ${year}`,
      `${Math.max(1, (day + 5) % 28)} de ${MONTH_NAMES[(month + 8) % 12]} de ${year - 1}`,
    ];

    questions.push({
      text: `¿Cuál fue la fecha exacta de estreno en cines de "${movie.title}"?`,
      correctAnswer: formattedDate,
      options: shuffleArray([formattedDate, ...fakeDates]),
      difficulty: Difficulty.HARD,
      block: 2,
      typeNumber: 6,
      categories: movieCategories,
    });

    // =========================================================================
    // TIPO 7: Fecha Exacta (Inversa) - Dificultad HARD
    // Ejemplo: "¿Qué exitosa película llegó a los cines exactamente el 19 de Diciembre de 1997?"
    // =========================================================================
    const movieDistractors = getDistractors(movie.title, pools.movies, 3);
    if (movieDistractors.length === 3) {
      questions.push({
        text: `¿Qué película llegó a las salas de cine exactamente el ${formattedDate}?`,
        correctAnswer: movie.title,
        options: shuffleArray([movie.title, ...movieDistractors]),
        difficulty: Difficulty.HARD,
        block: 2,
        typeNumber: 7,
        categories: movieCategories,
      });
    }
  }

  // =========================================================================
  // TIPO 8: Duración (Directa) - Dificultad MEDIUM
  // Ejemplo: "¿Cuántos minutos dura exactamente la versión de cines de 'El Padrino'?"
  // =========================================================================
  if (movie.runtime && movie.runtime >= 50) {
    const correctRuntime = `${movie.runtime} minutos`;
    const runtimeDistractors = getRuntimeDistractors(movie.runtime);

    if (runtimeDistractors.length === 3) {
      questions.push({
        text: `¿Cuántos minutos dura exactamente la película "${movie.title}"?`,
        correctAnswer: correctRuntime,
        options: shuffleArray([correctRuntime, ...runtimeDistractors]),
        difficulty: Difficulty.MEDIUM,
        block: 2,
        typeNumber: 8,
        categories: movieCategories,
      });

      // =========================================================================
      // TIPO 9: Duración (Inversa) - Dificultad HARD
      // Ejemplo: "¿Cuál de estas películas tiene una duración exacta de 142 minutos?"
      // =========================================================================
      const movieDistractors = getDistractors(movie.title, pools.movies, 3);
      if (movieDistractors.length === 3) {
        questions.push({
          text: `¿Cuál de estas películas tiene una duración exacta de ${movie.runtime} minutos?`,
          correctAnswer: movie.title,
          options: shuffleArray([movie.title, ...movieDistractors]),
          difficulty: Difficulty.HARD,
          block: 2,
          typeNumber: 9,
          categories: movieCategories,
        });
      }
    }
  }

  return questions;
};
