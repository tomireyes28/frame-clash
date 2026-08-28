// web/src/services/profile.service.ts
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'GAMES' | 'COLLECTION' | 'ROGUELITE' | 'DOMINATION' | 'DRAFT';
  currentProgress: number;
  maxProgress: number;
  isUnlocked: boolean;
  rewardCoins: number;
  rewardStardust: number;
  unlockedTitle?: string;
}

export interface UserProfileData {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    coins: number;
    stardust: number;
    xp: number;
    eloRating?: number;
    rankTier?: string;
    createdAt: string;
    level: number;
    currentLevelProgress: number;
    xpForNextLevel: number;
    unlockedTitles: string[];
    defaultTitle: string;
  };
  stats: {
    totalGames: number;
    highestScore: number;
    averageScore: number;
    uniqueCardsCount: number;
    legendaryCardsCount: number;
    epicCardsCount: number;
    completedSetsCount: number;
    rogueliteMaxWave: number;
    rogueliteHighScore: number;
    totalDominationStars: number;
    masteredCategoriesCount: number;
    draftWinsCount: number;
  };
  achievements: AchievementItem[];
  recentActivity: Array<{
    score: number;
    createdAt: string;
  }>;
}

export interface ProfileResponse {
  success: boolean;
  profile: UserProfileData;
}

const getAuthHeaders = () => {
  const token = Cookies.get('frameclash_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const profileService = {
  getProfile: async (): Promise<UserProfileData> => {
    const response = await fetch(`${API_URL}/profile`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al cargar el perfil del jugador.');
    }

    const json: ProfileResponse = await response.json();
    return json.profile;
  },
};