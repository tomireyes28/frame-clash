// api/src/questions/pools/distractor.pool.ts
import { QuestionPools } from '../interfaces/question.interface';

export const defaultQuestionPools: QuestionPools = {
  directors: [
    'Steven Spielberg', 'Christopher Nolan', 'Quentin Tarantino', 'Martin Scorsese',
    'James Cameron', 'David Fincher', 'Ridley Scott', 'Peter Jackson',
    'Denis Villeneuve', 'Alfonso Cuarón', 'Guillermo del Toro', 'Stanley Kubrick',
    'Alfred Hitchcock', 'Francis Ford Coppola', 'Tim Burton', 'George Lucas',
    'Wes Anderson', 'Damien Chazelle', 'Greta Gerwig', 'Bong Joon-ho',
    'Alejandro G. Iñárritu', 'Juan José Campanella', 'Hayao Miyazaki', 'Pedro Almodóvar',
    'Sam Raimi', 'Zack Snyder', 'Guy Ritchie', 'Robert Zemeckis', 'Clint Eastwood'
  ],
  actors: [
    'Leonardo DiCaprio', 'Brad Pitt', 'Tom Cruise', 'Robert Downey Jr.',
    'Christian Bale', 'Johnny Depp', 'Morgan Freeman', 'Tom Hanks',
    'Keanu Reeves', 'Matt Damon', 'Matthew McConaughey', 'Al Pacino',
    'Robert De Niro', 'Joaquin Phoenix', 'Denzel Washington', 'Hugh Jackman',
    'Ryan Gosling', 'Cillian Murphy', 'Harrison Ford', 'Samuel L. Jackson',
    'Scarlett Johansson', 'Emma Stone', 'Margot Robbie', 'Meryl Streep',
    'Anne Hathaway', 'Natalie Portman', 'Cate Blanchett', 'Jennifer Lawrence',
    'Ricardo Darín', 'Guillermo Francella', 'Antonio Banderas', 'Javier Bardem'
  ],
  characters: [
    'Tony Stark', 'Bruce Wayne', 'Luke Skywalker', 'Frodo Baggins',
    'Harry Potter', 'Neo', 'Jack Sparrow', 'James Bond',
    'Indiana Jones', 'Tyler Durden', 'Michael Corleone', 'Forrest Gump',
    'Joker', 'Darth Vader', 'Gollum', 'Walter White',
    'Dominic Toretto', 'John Wick', 'Ethan Hunt', 'Han Solo',
    'Ellen Ripley', 'Sarah Connor', 'Katniss Everdeen', 'Natasha Romanoff'
  ],
  movies: [
    'Inception', 'El Padrino', 'Matrix', 'Pulp Fiction', 'Forrest Gump',
    'Gladiador', 'Jurassic Park', 'Titanic', 'El Señor de los Anillos: La Comunidad del Anillo',
    'El Club de la Pelea', 'Interestelar', 'Batman: El Caballero de la Noche',
    'Avatar', 'Avengers: Endgame', 'Star Wars: Episodio IV', 'Volver al Futuro',
    'Parásitos', 'El Secreto de sus Ojos', 'El Laberinto del Fauno', 'Ciudad de Dios',
    'Alien: El Octavo Pasajero', 'Blade Runner 2049', 'La La Land', 'Whiplash',
    'Oppenheimer', 'Dune', 'Coco', 'Toy Story', 'El Rey León', 'Spirited Away'
  ],
  studios: [
    'Universal Pictures', 'Warner Bros. Pictures', 'Paramount Pictures',
    '20th Century Studios', 'Columbia Pictures', 'Walt Disney Pictures',
    'Sony Pictures', 'Metro-Goldwyn-Mayer (MGM)', 'Lionsgate', 'A24',
    'New Line Cinema', 'DreamWorks Pictures', 'Marvel Studios', 'Pixar'
  ],
  countries: [
    'Estados Unidos', 'Reino Unido', 'Francia', 'España',
    'Alemania', 'Italia', 'Japón', 'Corea del Sur',
    'Argentina', 'México', 'Brasil', 'Canadá',
    'Australia', 'India', 'China', 'Nueva Zelanda'
  ],
  languages: [
    'Inglés', 'Español', 'Francés', 'Alemán',
    'Italiano', 'Japonés', 'Coreano', 'Portugués',
    'Mandarín', 'Ruso', 'Hindi', 'Sueco'
  ],
  sagas: [
    'Star Wars', 'Universo Cinematográfico de Marvel (MCU)', 'El Señor de los Anillos',
    'Harry Potter', 'Indiana Jones', 'Piratas del Caribe', 'El Padrino',
    'Rápido y Furioso', 'Misión Imposible', 'James Bond (007)', 'Matrix',
    'Jurassic Park / Jurassic World', 'Batman (Trilogía de Nolan)', 'Terminator'
  ],
};

/**
 * Mezcla un array (Fisher-Yates)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Obtiene distractores de una lista asegurando que no incluya el valor correcto
 */
export function getDistractors(correctItem: string, pool: string[], count: number = 3): string[] {
  const filtered = pool.filter(item => item.trim().toLowerCase() !== correctItem.trim().toLowerCase());
  return shuffleArray(filtered).slice(0, count);
}

/**
 * Genera 3 años distractores cercanos al año real (+- 2 a 8 años)
 */
export function getYearDistractors(correctYearStr: string): string[] {
  const year = parseInt(correctYearStr, 10);
  if (isNaN(year)) return ['1995', '2001', '2010'];

  const offsets = [-7, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 7, 9];
  const shuffledOffsets = shuffleArray(offsets);
  const years = new Set<string>();

  for (const offset of shuffledOffsets) {
    const candidate = String(year + offset);
    if (candidate !== correctYearStr && parseInt(candidate, 10) >= 1900 && parseInt(candidate, 10) <= 2026) {
      years.add(candidate);
      if (years.size === 3) break;
    }
  }

  while (years.size < 3) {
    years.add(String(year + (years.size + 1) * 3));
  }

  return Array.from(years);
}

/**
 * Genera 3 montos de dinero distractores (para presupuesto / taquilla en millones)
 */
export function getMoneyDistractors(amountInMillions: number): string[] {
  const variations = [0.4, 0.65, 1.35, 1.7, 2.2, 0.5, 1.5];
  const shuffled = shuffleArray(variations);
  const distractors: string[] = [];

  for (const factor of shuffled) {
    const candidate = Math.max(1, Math.round(amountInMillions * factor));
    const formatted = `$${candidate.toLocaleString('es-AR')} millones`;
    if (!distractors.includes(formatted) && candidate !== amountInMillions) {
      distractors.push(formatted);
      if (distractors.length === 3) break;
    }
  }

  return distractors;
}

/**
 * Genera 3 duraciones en minutos distractores (+- 10 a 35 min)
 */
export function getRuntimeDistractors(correctRuntime: number): string[] {
  const offsets = [-28, -18, -12, 14, 22, 32, -8, 16];
  const shuffled = shuffleArray(offsets);
  const distractors: string[] = [];

  for (const offset of shuffled) {
    const candidate = Math.max(70, correctRuntime + offset);
    const formatted = `${candidate} minutos`;
    if (!distractors.includes(formatted) && candidate !== correctRuntime) {
      distractors.push(formatted);
      if (distractors.length === 3) break;
    }
  }

  return distractors;
}
