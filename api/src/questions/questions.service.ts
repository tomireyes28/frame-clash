// api/src/questions/questions.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { TmdbService } from '../tmdb/tmdb.service';
import { PrismaService } from '../prisma/prisma.service';
import { generateAllQuestionsForMovie } from './builders';
import { resolveCategoriesForMovie } from './utils/category-resolver.util';
import { Difficulty, Question, Rarity } from '@prisma/client';
import { TmdbMovieDetails } from '../tmdb/interfaces/tmdb.interface';

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);

  constructor(
    private readonly tmdbService: TmdbService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Genera hasta ~20 preguntas determinísticas (los 5 bloques / 24 tipos)
   * para una película específica y las guarda en la base de datos.
   */
  async generateQuestionsForMovie(
    tmdbId: number,
    extraCategories: string[] = [],
  ): Promise<{ movieTitle: string; cardId: string; totalQuestions: number; questions: Question[] }> {
    const movieDetails = await this.tmdbService.getMovieDetails(tmdbId);
    if (!movieDetails) {
      throw new NotFoundException(`No se pudo obtener información de TMDB para la película con ID ${tmdbId}`);
    }

    const categoryKeys = resolveCategoriesForMovie(movieDetails, extraCategories);

    // 1. Crear o actualizar la Carta de la Película con stats calculados
    const card = await this.upsertCardForMovie(movieDetails, categoryKeys);

    // 2. Ejecutar los 5 bloques determinísticos
    const generated = generateAllQuestionsForMovie(movieDetails, categoryKeys);

    const savedQuestions: Question[] = [];

    for (const q of generated) {
      // Evitamos duplicados exactos en texto
      const existing = await this.prisma.question.findFirst({
        where: { text: q.text },
      });

      if (!existing) {
        const saved = await this.prisma.question.create({
          data: {
            text: q.text,
            correctAnswer: q.correctAnswer,
            options: q.options,
            difficulty: q.difficulty,
            block: q.block,
            typeNumber: q.typeNumber,
            imageUrl: q.imageUrl || null,
            cardId: card.id,
            categories: q.categories,
          },
        });
        savedQuestions.push(saved);
      } else {
        savedQuestions.push(existing);
      }
    }

    this.logger.log(`Película "${movieDetails.title}": ${savedQuestions.length} preguntas sincronizadas.`);

    return {
      movieTitle: movieDetails.title,
      cardId: card.id,
      totalQuestions: savedQuestions.length,
      questions: savedQuestions,
    };
  }

  /**
   * Genera preguntas para las películas más populares de una categoría específica
   */
  async generateQuestionsForCategory(
    categoryKey: string,
    limitMovies: number = 5,
  ): Promise<{ category: string; moviesProcessed: number; totalQuestions: number }> {
    const category = await this.prisma.category.findUnique({
      where: { key: categoryKey },
    });

    if (!category) {
      throw new NotFoundException(`Categoría "${categoryKey}" no encontrada.`);
    }

    let minYear: string | undefined;
    let maxYear: string | undefined;

    if (category.type === 'decade') {
      if (category.key === 'ERA_ORIGINS_SILENT') { minYear = '1895'; maxYear = '1929'; }
      else if (category.key === 'ERA_CLASSIC_STUDIO') { minYear = '1930'; maxYear = '1959'; }
      else if (category.key === 'ERA_NEW_WAVES_MODERN') { minYear = '1960'; maxYear = '1979'; }
      else if (category.key === 'ERA_BLOCKBUSTER_POP') { minYear = '1980'; maxYear = '1999'; }
      else if (category.key === 'ERA_NEW_MILLENNIUM') { minYear = '2000'; maxYear = '2019'; }
      else if (category.key === 'ERA_CONTEMPORARY') { minYear = '2020'; maxYear = '2026'; }
    }

    const popularMovies = await this.tmdbService.getPopularMovies(
      category.tmdbId ? String(category.tmdbId) : undefined,
      minYear,
      maxYear,
      1,
    );

    const moviesToProcess = popularMovies.slice(0, limitMovies);
    let totalQuestionsCount = 0;

    for (const movie of moviesToProcess) {
      try {
        const result = await this.generateQuestionsForMovie(movie.id, [category.key]);
        totalQuestionsCount += result.totalQuestions;
      } catch (err) {
        this.logger.error(`Error generando preguntas para ${movie.title} (${movie.id}):`, err);
      }
    }

    return {
      category: category.name || category.key,
      moviesProcessed: moviesToProcess.length,
      totalQuestions: totalQuestionsCount,
    };
  }

  /**
   * Endpoint de prueba / inicialización rápida con películas icónicas
   */
  async generateTestQuestions(): Promise<{ totalGeneradas: number; resumen: Record<string, number> }> {
    // Lista de películas icónicas de diversos géneros y décadas
    const iconicMovieIds = [
      155,    // The Dark Knight (Acción / Crimen)
      27205,  // Inception (Sci-Fi / Suspense)
      680,    // Pulp Fiction (Crimen / 90s)
      550,    // Fight Club (Drama / Culto)
      19995,  // Avatar (Sci-Fi / Blockbuster)
      603,    // Matrix (Sci-Fi / 90s)
      13,     // Forrest Gump (Drama / Romance)
      8587,   // El Rey León (Animación / Familia)
      496243, // Parásitos (Drama / Cine Asiático)
      314365, // El Secreto de sus Ojos (Cine Argentino / Crimen)
    ];

    const summary: Record<string, number> = {};
    let total = 0;

    for (const id of iconicMovieIds) {
      try {
        const res = await this.generateQuestionsForMovie(id);
        summary[res.movieTitle] = res.totalQuestions;
        total += res.totalQuestions;
      } catch (error) {
        this.logger.error(`Error en test generator para ID ${id}:`, error);
      }
    }

    return {
      totalGeneradas: total,
      resumen: summary,
    };
  }

  /**
   * Crea o actualiza una carta en la base de datos con atributos balanceados
   */
  private async upsertCardForMovie(movie: TmdbMovieDetails, categoryKeys: string[]) {
    const year = movie.release_date ? parseInt(movie.release_date.substring(0, 4), 10) : 2000;
    
    // Rating (0 a 10) -> ATK (30 a 95)
    const atk = Math.min(99, Math.max(30, Math.round((movie.vote_average || 6.5) * 9.5)));
    
    // Popularity -> DEF (30 a 95)
    const def = Math.min(99, Math.max(30, Math.round(Math.min(100, (movie.popularity || 20) * 1.5))));
    
    // Runtime (más corta o dinámica -> mayor velocidad SPD)
    const runtime = movie.runtime || 110;
    const spd = Math.min(99, Math.max(30, Math.round(Math.max(30, 150 - runtime))));
    
    // Revenue (Taquilla) -> BOX
    const revenueM = (movie.revenue || 0) / 1_000_000;
    const box = Math.min(99, Math.max(30, Math.round(30 + Math.min(65, revenueM / 20))));
    
    // CRT (Stat Cinéfilo Compuesto)
    const crt = Math.round((atk + def + spd + box) / 4);

    // Determinar Rareza según rating y taquilla
    let rarity: Rarity = Rarity.COMMON;
    if (atk >= 85 && (revenueM > 800 || movie.vote_count > 15000)) {
      rarity = Rarity.LEGENDARY;
    } else if (atk >= 78 || revenueM > 400) {
      rarity = Rarity.EPIC;
    } else if (atk >= 70 || revenueM > 100) {
      rarity = Rarity.RARE;
    } else if (atk >= 60) {
      rarity = Rarity.UNCOMMON;
    }

    // Buscamos las categorías existentes en la DB para conectarlas
    const dbCategories = await this.prisma.category.findMany({
      where: { key: { in: categoryKeys } },
    });

    const card = await this.prisma.card.upsert({
      where: { tmdbId: movie.id },
      update: {
        title: movie.title,
        originalTitle: movie.original_title || movie.title,
        year: isNaN(year) ? 2000 : year,
        posterPath: movie.poster_path || null,
        backdropPath: movie.backdrop_path || null,
        rarity,
        atk,
        def,
        spd,
        box,
        crt,
        categories: {
          set: dbCategories.map(c => ({ id: c.id })),
        },
      },
      create: {
        tmdbId: movie.id,
        title: movie.title,
        originalTitle: movie.original_title || movie.title,
        year: isNaN(year) ? 2000 : year,
        posterPath: movie.poster_path || null,
        backdropPath: movie.backdrop_path || null,
        rarity,
        atk,
        def,
        spd,
        box,
        crt,
        categories: {
          connect: dbCategories.map(c => ({ id: c.id })),
        },
      },
    });

    return card;
  }
}