// api/src/common/utils/random.util.ts

// Generador de años aleatorios
export function getRandomYears(correctYearStr: string): string[] {
  const correctYear = parseInt(correctYearStr);
  if (isNaN(correctYear)) return ['1999', '2005', '2010']; 

  const options = new Set<string>();
  
  while (options.size < 3) {
    const offset = Math.floor(Math.random() * 21) - 10;
    if (offset !== 0) {
      options.add((correctYear + offset).toString());
    }
  }
  
  return Array.from(options);
}

// Seleccionador de distractores
export function getRandomDistractors(correctAnswer: string, pool: string[]): string[] {
  const validPool = pool.filter(item => item !== correctAnswer);
  const shuffled = validPool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}