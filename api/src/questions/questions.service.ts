// api/src/questions/questions.service.ts
import { Injectable } from '@nestjs/common';
import { TmdbService } from '../tmdb/tmdb.service';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionPools } from './interfaces/question.interface';
import { basicTemplates } from './templates/basic.template';
import { battleTemplates } from './templates/battle.template';
import { TmdbMovieDetails } from '../tmdb/interfaces/tmdb.interface';
import { Difficulty, Question } from '@prisma/client'; 

@Injectable()
export class QuestionsService {
  constructor(
    private readonly tmdbService: TmdbService, 
    private readonly prisma: PrismaService
  ) {}

  // Actualizamos lo que devuelve la promesa para que coincida con lo que guardamos
  async generateTestQuestions(): Promise<{ totalGeneradas: number; preguntasGuardadas: Question[] }> {
    const savedQuestions: Question[] = [];

    const pools: QuestionPools = {
      directors: ['Steven Spielberg', 'Quentin Tarantino', 'Martin Scorsese', 'James Cameron', 'David Fincher', 'Ridley Scott', 'Peter Jackson', 'Denis Villeneuve', 'Alfonso Cuarón'],
      actors: ['Brad Pitt', 'Tom Cruise', 'Leonardo DiCaprio', 'Morgan Freeman', 'Robert De Niro', 'Al Pacino', 'Johnny Depp', 'Keanu Reeves', 'Christian Bale'],
      movies: ['El Padrino', 'Matrix', 'Pulp Fiction', 'Forrest Gump', 'Gladiador', 'Jurassic Park', 'Titanic', 'El Señor de los Anillos', 'El Club de la Pelea', 'Duna']
    };

    // 🏆 LA LÓGICA DE CATEGORÍAS: Iteramos por Acción (28) y Comedia (35)
    const genresToTest = ['28', '35'];

    for (const genreId of genresToTest) {
      // 1. Buscamos las 10 películas más populares SOLO de ese género
      const popularMovies = await this.tmdbService.getPopularMovies(genreId);
      const testMovies = popularMovies.slice(0, 10); 
      
      const allMovieDetails: TmdbMovieDetails[] = [];
      
      for (const movieInfo of testMovies) {
        const details = await this.tmdbService.getMovieDetails(movieInfo.id);
        if (details) allMovieDetails.push(details);
      }

      // 2. Ejecutamos las plantillas BÁSICAS para cada peli de este género
      for (const movieDetails of allMovieDetails) {
        for (const templateFunction of basicTemplates) {
          const question = templateFunction(movieDetails, pools);
          
          if (question) {
            // Mezclamos la respuesta correcta con las falsas para el array final
            const mixedOptions = [question.respuestaCorrecta, ...question.opcionesFalsas]
              .sort(() => 0.5 - Math.random());

            // GUARDAMOS EN POSTGRESQL
            const saved = await this.prisma.question.create({
              data: {
                text: question.pregunta,
                correctAnswer: question.respuestaCorrecta,
                options: mixedOptions,
                difficulty: question.dificultad as Difficulty,
                categories: [genreId], 
              }
            });
            savedQuestions.push(saved);
          }
        }
      }

      // 3. 🥊 Ejecutamos las BATALLAS (Solo pelean entre películas del MISMO género)
      for (const battleFunction of battleTemplates) {
        for (let i = 0; i < 2; i++) {
          const question = battleFunction(allMovieDetails);
          
          if (question) {
            // Mezclamos la respuesta correcta con las falsas
            const mixedOptions = [question.respuestaCorrecta, ...question.opcionesFalsas]
              .sort(() => 0.5 - Math.random());

            // GUARDAMOS EN POSTGRESQL
            const saved = await this.prisma.question.create({
              data: {
                text: question.pregunta,
                correctAnswer: question.respuestaCorrecta,
                options: mixedOptions,
                difficulty: question.dificultad as Difficulty,
                categories: [genreId]
              }
            });
            savedQuestions.push(saved);
          }
        }
      }
    }

    // Devolvemos lo que acabamos de guardar en la base de datos
    return {
      totalGeneradas: savedQuestions.length,
      preguntasGuardadas: savedQuestions
    };
  }
}