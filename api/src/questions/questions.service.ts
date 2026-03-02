// api/src/questions/questions.service.ts
import { Injectable } from '@nestjs/common';
import { TmdbService } from '../tmdb/tmdb.service';
import { GeneratedQuestion } from './interfaces/question.interface';
import { getRandomYears, getRandomDistractors } from '../common/utils/random.util';

@Injectable()
export class QuestionsService {
  constructor(private readonly tmdbService: TmdbService) {}

  async generateTestQuestions(): Promise<{ totalGeneradas: number; preguntas: GeneratedQuestion[] }> {
    const popularMovies = await this.tmdbService.getPopularMovies();
    const testMovies = popularMovies.slice(0, 5); 
    const generatedQuestions: GeneratedQuestion[] = [];

    const DIRECTORS_POOL = ['Steven Spielberg', 'Quentin Tarantino', 'Martin Scorsese', 'James Cameron', 'David Fincher', 'Ridley Scott', 'Peter Jackson', 'Denis Villeneuve', 'Alfonso Cuarón'];
    const ACTORS_POOL = ['Brad Pitt', 'Tom Cruise', 'Leonardo DiCaprio', 'Morgan Freeman', 'Robert De Niro', 'Al Pacino', 'Johnny Depp', 'Keanu Reeves', 'Christian Bale', 'Cillian Murphy'];
    const MOVIES_POOL = ['El Padrino', 'Matrix', 'Pulp Fiction', 'Forrest Gump', 'Gladiador', 'Jurassic Park', 'Titanic', 'El Señor de los Anillos', 'El Club de la Pelea', 'Duna'];

    for (const movie of testMovies) {
      const details = await this.tmdbService.getMovieDetails(movie.id);
      if (!details) continue;

      const releaseYear = details.release_date ? details.release_date.substring(0, 4) : 'Desconocido';
      const director = details.credits?.crew?.find(c => c.job === 'Director')?.name || 'Desconocido';
      const leadActor = details.credits?.cast?.[0]?.name || 'Desconocido';
      const characterName = details.credits?.cast?.[0]?.character || 'Desconocido';
      const tagline = details.tagline; 

      generatedQuestions.push({
        pelicula: details.title,
        dificultad: 'NORMAL',
        pregunta: `¿En qué año se estrenó originalmente "${details.title}"?`,
        respuestaCorrecta: releaseYear,
        opcionesFalsas: getRandomYears(releaseYear) 
      });

      if (director !== 'Desconocido') {
        generatedQuestions.push({
          pelicula: details.title,
          dificultad: 'EASY',
          pregunta: `¿Quién fue el director principal de la película "${details.title}"?`,
          respuestaCorrecta: director,
          opcionesFalsas: getRandomDistractors(director, DIRECTORS_POOL) 
        });
      }

      if (leadActor !== 'Desconocido') {
        generatedQuestions.push({
          pelicula: details.title,
          dificultad: 'VERY_EASY',
          pregunta: `¿Cuál de estos actores interpretó el papel principal en "${details.title}"?`,
          respuestaCorrecta: leadActor,
          opcionesFalsas: getRandomDistractors(leadActor, ACTORS_POOL)
        });
      }

      if (characterName !== 'Desconocido' && !characterName.includes('uncredited')) {
        generatedQuestions.push({
          pelicula: details.title,
          dificultad: 'HARD',
          pregunta: `¿En qué película aparece el personaje "${characterName}"?`,
          respuestaCorrecta: details.title,
          opcionesFalsas: getRandomDistractors(details.title, MOVIES_POOL)
        });
      }

      if (tagline && tagline.length > 5) {
        generatedQuestions.push({
          pelicula: details.title,
          dificultad: 'VERY_HARD',
          pregunta: `¿A qué película pertenece esta icónica frase promocional: "${tagline}"?`,
          respuestaCorrecta: details.title,
          opcionesFalsas: getRandomDistractors(details.title, MOVIES_POOL)
        });
      }
    }

    return {
      totalGeneradas: generatedQuestions.length,
      preguntas: generatedQuestions
    };
  }
}