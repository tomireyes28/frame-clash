// src/services/profile.service.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface UserProfileData {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    coins: number;
    xp: number;
    createdAt: string;
    level: number;
    currentLevelProgress: number;
    xpForNextLevel: number;
  };
  stats: {
    totalGames: number;
    highestScore: number;
    averageScore: number;
    uniqueCardsCount: number;
  };
  recentActivity: Array<{
    score: number;
    createdAt: string;
  }>;
}

export interface ProfileResponse {
  success: boolean;
  profile: UserProfileData;
}

export const profileService = {
  getProfile: async (userId: string = 'cmm8bj5pr0000n49toufqk6gd'): Promise<UserProfileData> => {
    const response = await fetch(`${API_URL}/profile?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar el perfil del jugador.');
    }
    
    const json: ProfileResponse = await response.json();
    return json.profile;
  }
};