// api/src/questions/interfaces/question.interface.ts

export interface GeneratedQuestion {
  pelicula: string;
  dificultad: string;
  pregunta: string;
  respuestaCorrecta: string;
  opcionesFalsas: string[];
}