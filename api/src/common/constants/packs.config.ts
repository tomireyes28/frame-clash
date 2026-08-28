// api/src/common/constants/packs.config.ts
import { DropRates } from '../utils/rarity.util';

export interface PackDefinition {
  id: string;
  name: string;
  description: string;
  price: number;
  size: number;
  icon: string;
  badgeColor: string;
  dropRates: DropRates;
}

export const PACK_CONFIGS: Record<string, PackDefinition> = {
  BRONZE: {
    id: 'BRONZE',
    name: 'Sobre de Bronce',
    description: 'Sobre estándar accesible con alta probabilidad de cartas Comunes e Inusuales.',
    price: 100,
    size: 5,
    icon: '🥉',
    badgeColor: 'bg-amber-800 text-amber-100',
    dropRates: {
      COMMON: 50,
      UNCOMMON: 30,
      RARE: 15,
      EPIC: 4,
      LEGENDARY: 1,
    },
  },
  SILVER: {
    id: 'SILVER',
    name: 'Sobre de Plata',
    description: 'Sobre mejorado con probabilidad incrementada de cartas Inusuales y Raras.',
    price: 250,
    size: 5,
    icon: '🥈',
    badgeColor: 'bg-zinc-400 text-zinc-900',
    dropRates: {
      COMMON: 20,
      UNCOMMON: 40,
      RARE: 28,
      EPIC: 10,
      LEGENDARY: 2,
    },
  },
  GOLD: {
    id: 'GOLD',
    name: 'Sobre de Oro',
    description: 'Sobre premium sin cartas comunes. Raras y Épicas garantizadas.',
    price: 500,
    size: 5,
    icon: '🥇',
    badgeColor: 'bg-amber-400 text-amber-950',
    dropRates: {
      COMMON: 0,
      UNCOMMON: 20,
      RARE: 45,
      EPIC: 27,
      LEGENDARY: 8,
    },
  },
  PLATINUM: {
    id: 'PLATINUM',
    name: 'Sobre de Platino',
    description: 'Sobre de alto nivel con gran presencia de Épicas y Legendarias.',
    price: 1000,
    size: 5,
    icon: '💠',
    badgeColor: 'bg-cyan-300 text-cyan-950',
    dropRates: {
      COMMON: 0,
      UNCOMMON: 0,
      RARE: 30,
      EPIC: 50,
      LEGENDARY: 20,
    },
  },
  DIAMOND: {
    id: 'DIAMOND',
    name: 'Sobre Diamante',
    description: 'El sobre definitivo. Solo Épicas y Legendarias de primer nivel.',
    price: 2500,
    size: 5,
    icon: '💎',
    badgeColor: 'bg-indigo-300 text-indigo-950',
    dropRates: {
      COMMON: 0,
      UNCOMMON: 0,
      RARE: 0,
      EPIC: 60,
      LEGENDARY: 40,
    },
  },
};

export type PackType = keyof typeof PACK_CONFIGS;

// Polvo estelar otorgado al conseguir la 4ª copia o superior
export const STARDUST_REWARDS_BY_RARITY = {
  COMMON: 5,
  UNCOMMON: 15,
  RARE: 50,
  EPIC: 150,
  LEGENDARY: 500,
} as const;