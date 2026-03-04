// api/src/game/utils/hash.util.ts
import * as crypto from 'crypto';

export const hashAnswer = (answer: string, questionId: string): string => {
  // Usamos una palabra secreta global + el ID de la pregunta. 
  // Esto hace que el código sea único e irrepetible.
  const secretToken = process.env.GAME_SECRET || 'FrameClashUltraSecret2026';
  
  return crypto
    .createHash('sha256')
    .update(`${answer}-${questionId}-${secretToken}`)
    .digest('hex');
};