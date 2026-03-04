import CryptoJS from 'crypto-js';

export const validateAnswerHash = (
  guessedOption: string, 
  questionId: string, 
  validHash: string
): boolean => {
  const secretToken = process.env.NEXT_PUBLIC_GAME_SECRET || 'FrameClashUltraSecret2026';
  const textToHash = `${guessedOption}-${questionId}-${secretToken}`;
  
  // Convertimos a UTF-8 para soportar tildes, eñes y caracteres especiales
  const words = CryptoJS.enc.Utf8.parse(textToHash);
  const hashedGuess = CryptoJS.SHA256(words).toString(CryptoJS.enc.Hex);
  
  return hashedGuess === validHash;
};