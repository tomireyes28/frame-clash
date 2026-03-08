import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Mission {
  id: string;
  type: string;
  title: string;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  rewardCoins: number;
  expiresAt: string;
}

export interface MissionsResponse {
  success: boolean;
  data: Mission[];
}

// 🛠️ Helper de seguridad
const getAuthHeaders = () => {
  const token = Cookies.get('frameclash_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const missionService = {
  // 🧹 Borramos el comentario viejo y el parámetro userId
  getDailyMissions: async (): Promise<Mission[]> => {
    // 🧹 Chau ?userId= de la URL
    const response = await fetch(`${API_URL}/mission`, {
      headers: getAuthHeaders(), // 👈 Inyectamos el Token
      cache: 'no-store' // Mantenemos tu configuración para evitar el caché de Next.js
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar las misiones del servidor.');
    }
    
    const json: MissionsResponse = await response.json();
    return json.data;
  }
};