// api/src/questions/builders/block4-cinephile.builder.ts
import { Difficulty } from '@prisma/client';
import { GeneratedQuestion, QuestionBuilder } from '../interfaces/question.interface';
import { getDistractors, shuffleArray } from '../pools/distractor.pool';

// Mapeo de códigos ISO de idioma a Español
const LANGUAGE_MAP: Record<string, string> = {
  en: 'Inglés',
  es: 'Español',
  fr: 'Francés',
  de: 'Alemán',
  it: 'Italiano',
  ja: 'Japonés',
  ko: 'Coreano',
  pt: 'Portugués',
  zh: 'Mandarín',
  cn: 'Cantonés',
  ru: 'Ruso',
  hi: 'Hindi',
  sv: 'Sueco',
  da: 'Danés',
  no: 'Noruego',
  nl: 'Holandés',
  pl: 'Polaco',
};

export const buildBlock4CinephileQuestions: QuestionBuilder = (movie, pools, movieCategories) => {
  const questions: GeneratedQuestion[] = [];

  // =========================================================================
  // TIPO 14: Estudio Productor (Directa) - Dificultad MEDIUM
  // Ejemplo: "¿Qué gran estudio estuvo detrás de la producción de 'Jurassic Park'?"
  // =========================================================================
  const mainStudio = movie.production_companies?.[0]?.name;
  if (mainStudio && mainStudio.length > 2) {
    const studioDistractors = getDistractors(mainStudio, pools.studios, 3);
    if (studioDistractors.length === 3) {
      questions.push({
        text: `¿Qué reconocido estudio o productora estuvo detrás de "${movie.title}"?`,
        correctAnswer: mainStudio,
        options: shuffleArray([mainStudio, ...studioDistractors]),
        difficulty: Difficulty.MEDIUM,
        block: 4,
        typeNumber: 14,
        categories: movieCategories,
      });
    }
  }

  // =========================================================================
  // TIPO 15: Idioma Original (Directa) - Dificultad EASY / MEDIUM
  // Ejemplo: "¿En qué idioma se filmó originalmente la película 'Parásitos'?"
  // =========================================================================
  const langCode = movie.original_language?.toLowerCase();
  const languageName = langCode && LANGUAGE_MAP[langCode] ? LANGUAGE_MAP[langCode] : null;

  if (languageName) {
    const langDistractors = getDistractors(languageName, pools.languages, 3);
    if (langDistractors.length === 3) {
      questions.push({
        text: `¿En qué idioma se filmó originalmente la película "${movie.title}"?`,
        correctAnswer: languageName,
        options: shuffleArray([languageName, ...langDistractors]),
        difficulty: languageName === 'Inglés' ? Difficulty.EASY : Difficulty.MEDIUM,
        block: 4,
        typeNumber: 15,
        categories: movieCategories,
      });

      // =========================================================================
      // TIPO 16: Idioma Original (Inversa) - Dificultad MEDIUM / HARD
      // Ejemplo: "¿Cuál de estas reconocidas películas se filmó originalmente en idioma Alemán?"
      // =========================================================================
      // Especialmente genial para cine internacional (no inglés)
      if (languageName !== 'Inglés') {
        const movieDistractors = getDistractors(movie.title, pools.movies, 3);
        if (movieDistractors.length === 3) {
          questions.push({
            text: `¿Cuál de estas reconocidas películas se filmó originalmente en idioma ${languageName}?`,
            correctAnswer: movie.title,
            options: shuffleArray([movie.title, ...movieDistractors]),
            difficulty: Difficulty.HARD,
            block: 4,
            typeNumber: 16,
            categories: movieCategories,
          });
        }
      }
    }
  }

  // =========================================================================
  // TIPO 17: País de Producción (Directa) - Dificultad MEDIUM
  // Ejemplo: "¿En qué país fue producida principalmente 'Ciudad de Dios'?"
  // =========================================================================
  const mainCountry = movie.production_countries?.[0]?.name;
  if (mainCountry && mainCountry.length > 2) {
    const countryDistractors = getDistractors(mainCountry, pools.countries, 3);
    if (countryDistractors.length === 3) {
      questions.push({
        text: `¿En qué país se produjo principalmente la película "${movie.title}"?`,
        correctAnswer: mainCountry,
        options: shuffleArray([mainCountry, ...countryDistractors]),
        difficulty: Difficulty.MEDIUM,
        block: 4,
        typeNumber: 17,
        categories: movieCategories,
      });

      // =========================================================================
      // TIPO 18: País de Producción (Inversa) - Dificultad HARD
      // Ejemplo: "¿Cuál de estas películas es una producción oficial de Brasil?"
      // =========================================================================
      if (mainCountry !== 'Estados Unidos') {
        const movieDistractors = getDistractors(movie.title, pools.movies, 3);
        if (movieDistractors.length === 3) {
          questions.push({
            text: `¿Cuál de estas películas es una producción cinematográfica de ${mainCountry}?`,
            correctAnswer: movie.title,
            options: shuffleArray([movie.title, ...movieDistractors]),
            difficulty: Difficulty.HARD,
            block: 4,
            typeNumber: 18,
            categories: movieCategories,
          });
        }
      }
    }
  }

  // =========================================================================
  // TIPO 19: Colección / Saga (Directa) - Dificultad EASY / MEDIUM
  // Ejemplo: "¿A qué gran franquicia o universo cinematográfico pertenece 'Rogue One'?"
  // =========================================================================
  const collectionName = movie.belongs_to_collection?.name;
  if (collectionName && collectionName.length > 3) {
    const sagaDistractors = getDistractors(collectionName, pools.sagas, 3);
    if (sagaDistractors.length === 3) {
      questions.push({
        text: `¿A qué franquicia o colección cinematográfica pertenece "${movie.title}"?`,
        correctAnswer: collectionName,
        options: shuffleArray([collectionName, ...sagaDistractors]),
        difficulty: Difficulty.EASY,
        block: 4,
        typeNumber: 19,
        categories: movieCategories,
      });

      // =========================================================================
      // TIPO 20: Colección / Saga (Inversa) - Dificultad MEDIUM
      // Ejemplo: "¿Cuál de estas películas forma parte de la colección 'Indiana Jones'?"
      // =========================================================================
      const movieDistractors = getDistractors(movie.title, pools.movies, 3);
      if (movieDistractors.length === 3) {
        questions.push({
          text: `¿Cuál de estas películas forma parte oficial de "${collectionName}"?`,
          correctAnswer: movie.title,
          options: shuffleArray([movie.title, ...movieDistractors]),
          difficulty: Difficulty.MEDIUM,
          block: 4,
          typeNumber: 20,
          categories: movieCategories,
        });
      }
    }
  }

  // =========================================================================
  // TIPO 21: Frase Promocional / Tagline (Directa) - Dificultad HARD
  // Ejemplo: "¿A qué película pertenece esta icónica frase: 'En el espacio nadie puede oírte gritar'?"
  // =========================================================================
  if (movie.tagline && movie.tagline.trim().length >= 8) {
    const movieDistractors = getDistractors(movie.title, pools.movies, 3);
    if (movieDistractors.length === 3) {
      questions.push({
        text: `¿A qué película pertenece esta frase promocional: "${movie.tagline.trim()}"?`,
        correctAnswer: movie.title,
        options: shuffleArray([movie.title, ...movieDistractors]),
        difficulty: Difficulty.HARD,
        block: 4,
        typeNumber: 21,
        categories: movieCategories,
      });
    }
  }

  // =========================================================================
  // TIPO 22: Palabras Clave / Keywords (Directa) - Dificultad HARD
  // Ejemplo: "¿A qué película corresponden estas palabras clave: 'sueño', 'subconsciente', 'ladrón'?"
  // =========================================================================
  const keywordsList = movie.keywords?.keywords || movie.keywords?.results || [];
  if (keywordsList.length >= 3) {
    const topKeywords = keywordsList.slice(0, 4).map(k => `"${k.name}"`).join(', ');
    const movieDistractors = getDistractors(movie.title, pools.movies, 3);

    if (movieDistractors.length === 3) {
      questions.push({
        text: `¿A qué película corresponden estas palabras clave de trama: ${topKeywords}?`,
        correctAnswer: movie.title,
        options: shuffleArray([movie.title, ...movieDistractors]),
        difficulty: Difficulty.HARD,
        block: 4,
        typeNumber: 22,
        categories: movieCategories,
      });
    }
  }

  return questions;
};
