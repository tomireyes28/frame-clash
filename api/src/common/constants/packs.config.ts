// src/common/constants/packs.config.ts

export const PACK_CONFIGS = {
  STANDARD: {
    price: 100,
    size: 5,
    dropRates: { LEGENDARY: 2, EPIC: 8, RARE: 15, UNCOMMON: 25, COMMON: 50 }
  },
  PREMIUM: {
    price: 500,
    size: 5,
    dropRates: { LEGENDARY: 10, EPIC: 30, RARE: 60, UNCOMMON: 0, COMMON: 0 }
  },
  DIRECTOR: {
    price: 1000,
    size: 5,
    dropRates: { LEGENDARY: 30, EPIC: 70, RARE: 0, UNCOMMON: 0, COMMON: 0 }
  }
} as const;

export type PackType = keyof typeof PACK_CONFIGS;