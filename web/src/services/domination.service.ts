// web/src/services/domination.service.ts
import { Question, AuditLogEntry, PowerUp } from '@/store/useGameStore';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
  maxStars: number;
  isMastered: boolean;
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
  questions: Question[];
  powerUps: PowerUp[];
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

const getAuthHeaders = () => {
  const token = Cookies.get('frameclash_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const dominationService = {
  getCategoriesOverview: async (): Promise<CategoryOverview[]> => {
    const response = await fetch(`${API_URL}/domination/categories`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al cargar las categorías de Dominio.');
    return response.json();
  },

  getCategoryMap: async (categoryId: string): Promise<CategoryDominationMap> => {
    const response = await fetch(`${API_URL}/domination/category/${categoryId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al cargar el mapa de la categoría.');
    return response.json();
  },

  startNode: async (
    categoryId: string,
    nodeNumber: number,
    equippedCardIds: string[] = [],
  ): Promise<StartNodeResponse> => {
    const response = await fetch(`${API_URL}/domination/start-node`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ categoryId, nodeNumber, equippedCardIds }),
    });
    if (!response.ok) throw new Error('Error al iniciar el nodo de Dominio.');
    return response.json();
  },

  submitNode: async (
    categoryId: string,
    nodeNumber: number,
    claimedScore: number,
    auditLog: AuditLogEntry[],
    usedPowerUps?: string[],
  ): Promise<SubmitNodeResponse> => {
    const response = await fetch(`${API_URL}/domination/submit-node`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        categoryId,
        nodeNumber,
        claimedScore,
        auditLog,
        usedPowerUps,
      }),
    });
    if (!response.ok) throw new Error('Error al enviar los resultados del nodo.');
    return response.json();
  },
};
