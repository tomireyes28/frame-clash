// api/src/questions/questions.service.ts
import { Injectable } from '@nestjs/common';
import { TmdbService } from '../tmdb/tmdb.service';
import { GeneratedQuestion, QuestionPools } from './interfaces/question.interface';

import { basicTemplates } from './templates/basic.template';
import { battleTemplates } from './templates/battle.template'; // <-- Importamos los de batalla
import { TmdbMovieDetails } from '../tmdb/interfaces/tmdb.interface';

@Injectable()
export class QuestionsService {
  constructor(private readonly tmdbService: TmdbService) {}

  async generateTestQuestions(): Promise<{ totalGeneradas: number; preguntas: GeneratedQuestion[] }> {
    const popularMovies = await this.tmdbService.getPopularMovies();
    // Aumentamos a 10 películas para tener un buen balde para las peleas
    const testMovies = popularMovies.slice(0, 10); 
    const generatedQuestions: GeneratedQuestion[] = [];

    const pools: QuestionPools = {
      directors: ['Steven Spielberg', 'Quentin Tarantino', 'Martin Scorsese', 'James Cameron', 'David Fincher', 'Ridley Scott', 'Peter Jackson', 'Denis Villeneuve', 'Alfonso Cuarón'],
      actors: ['Brad Pitt', 'Tom Cruise', 'Leonardo DiCaprio', 'Morgan Freeman', 'Robert De Niro', 'Al Pacino', 'Johnny Depp', 'Keanu Reeves', 'Christian Bale'],
      movies: ['El Padrino', 'Matrix', 'Pulp Fiction', 'Forrest Gump', 'Gladiador', 'Jurassic Park', 'Titanic', 'El Señor de los Anillos', 'El Club de la Pelea', 'Duna']
    };

    // 1. Descargamos TODOS los detalles primero y los guardamos en un array (La Mesada de la Cocina)
    const allMovieDetails: TmdbMovieDetails[] = [];
    for (const movieInfo of testMovies) {
      const details = await this.tmdbService.getMovieDetails(movieInfo.id);
      if (details) allMovieDetails.push(details);
    }

    // 2. Ejecutamos las plantillas BÁSICAS (1 a 1)
    for (const movieDetails of allMovieDetails) {
      for (const templateFunction of basicTemplates) {
        const question = templateFunction(movieDetails, pools);
        if (question) generatedQuestions.push(question);
      }
    }

    // 3. Ejecutamos las plantillas de BATALLA (Le pasamos todas las pelis juntas)
    for (const battleFunction of battleTemplates) {
      // Le decimos que invente 3 batallas distintas mezclando esas 10 películas
      for (let i = 0; i < 3; i++) {
        const question = battleFunction(allMovieDetails);
        if (question) generatedQuestions.push(question);
      }
    }

    return {
      totalGeneradas: generatedQuestions.length,
      preguntas: generatedQuestions
    };
  }
}