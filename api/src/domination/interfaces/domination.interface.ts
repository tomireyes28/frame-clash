// api/src/domination/interfaces/domination.interface.ts
import { SafeQuestionPayload, PowerUpPayload } from '../../game/interfaces/game.interface';

export interface NodeThresholds {
  oneStar: number;
  twoStars: number;
  threeStars: number;
}

export interface DominationNodeInfo {
  nodeNumber: number;
  title: string;
  status: 'LOCKED' | 'UNLOCKED' | 'COMPLETED';
  stars: number;
  bestScore: number;
  thresholds: NodeThresholds;
  rewardCoins: number;
  rewardXp: number;
  isBossNode: boolean;
}

export interface CategoryDominationMap {
  categoryId: string;
  categoryKey: string;
  categoryName: string;
  categoryIcon: string;
  totalStars: number;
  maxStars: number; // 30
  isMastered: boolean; // 10 nodos completados
  nodes: DominationNodeInfo[];
}

export interface CategoryOverview {
  categoryId: string;
  key: string;
  name: string;
  icon: string;
  type: string;
  totalStars: number;
  maxStars: number;
  completedNodes: number;
  isMastered: boolean;
}

export interface StartNodeResponse {
  categoryId: string;
  categoryName: string;
  nodeNumber: number;
  thresholds: NodeThresholds;
  questions: SafeQuestionPayload[];
  powerUps: PowerUpPayload[];
}

export interface SubmitNodeResponse {
  nodeNumber: number;
  score: number;
  stars: number;
  passed: boolean;
  isNewBest: boolean;
  unlockedNextNode: boolean;
  rewards: {
    coins: number;
    xp: number;
    masteryBonus?: boolean;
  };
  message: string;
}
