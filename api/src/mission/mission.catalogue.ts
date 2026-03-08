import { MissionType } from '@prisma/client';

export const DAILY_MISSIONS_CATALOGUE = [
  { type: MissionType.PLAY_GAMES, title: 'Calentando Motores', targetValue: 3, rewardCoins: 50 },
  { type: MissionType.PLAY_GAMES, title: 'Gladiador Incansable', targetValue: 5, rewardCoins: 100 },
  { type: MissionType.EARN_COINS, title: 'Bolsillos Llenos', targetValue: 300, rewardCoins: 50 },
  { type: MissionType.EARN_COINS, title: 'Mercenario de Oro', targetValue: 600, rewardCoins: 120 },
  { type: MissionType.SCORE_POINTS, title: 'Mente Brillante', targetValue: 50000, rewardCoins: 50 },
  { type: MissionType.SCORE_POINTS, title: 'Leyenda Viva', targetValue: 120000, rewardCoins: 150 },
];