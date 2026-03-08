import Cookies from 'js-cookie';

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

// 🛠️ Helper de seguridad
const getAuthHeaders = () => {
  const token = Cookies.get('frameclash_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const profileService = {
  // 🧹 Chau parámetro userId
  getProfile: async (): Promise<UserProfileData> => {
    // 🧹 Chau ?userId= de la URL
    const response = await fetch(`${API_URL}/profile`, {
      headers: getAuthHeaders(), // 👈 Inyectamos el Token
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar el perfil del jugador.');
    }
    
    const json: ProfileResponse = await response.json();
    return json.profile;
  }
};