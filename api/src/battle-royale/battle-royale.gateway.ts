// api/src/battle-royale/battle-royale.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { hashAnswer } from '../game/utils/hash.util';
import { SafeQuestionPayload } from '../game/interfaces/game.interface';
import { GameMode, Difficulty, Question } from '@prisma/client';

interface BRPlayer {
  socketId?: string;
  userId: string;
  name: string;
  image: string | null;
  eloRating: number;
  score: number;
  isEliminated: boolean;
  eliminatedInRound?: number;
  finalRank?: number;
  isBot: boolean;
  hasAnswered: boolean;
}

interface BRRoom {
  roomId: string;
  players: BRPlayer[];
  currentRound: number; // 1 to 5
  questionInRound: number; // 1 to 3
  currentQuestion?: {
    id: string;
    text: string;
    options: string[];
    difficulty: Difficulty;
    imageUrl?: string | null;
    correctAnswer: string;
    answerHash: string;
  };
  questionsPool: Question[];
  questionTimer?: NodeJS.Timeout;
  status: 'WAITING' | 'IN_PROGRESS' | 'ROUND_INTERMISSION' | 'FINISHED';
}

const BOT_NAMES = [
  'Cinephile99',
  'TarantinoFan',
  'NolanMaster',
  'KubrickGhost',
  'ScorseseAdept',
  'HitchcockShadow',
  'SpielbergPro',
  'FincherVibe',
  'VilleneuveZone',
];

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/battle-royale',
})
export class BattleRoyaleGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(BattleRoyaleGateway.name);
  private waitingLobby: BRPlayer[] = [];
  private activeRooms = new Map<string, BRRoom>();
  private lobbyTimer?: NodeJS.Timeout;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        socket.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub || payload.id },
        select: { id: true, name: true, image: true, eloRating: true },
      });

      if (!user) {
        socket.disconnect();
        return;
      }

      socket.data.user = user;
    } catch (err) {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    this.waitingLobby = this.waitingLobby.filter((p) => p.socketId !== socket.id);
    this.broadcastLobbyCount();
  }

  @SubscribeMessage('join_br_lobby')
  async handleJoinLobby(@ConnectedSocket() socket: Socket) {
    const user = socket.data.user;
    if (!user) return;

    this.waitingLobby = this.waitingLobby.filter((p) => p.userId !== user.id);

    const player: BRPlayer = {
      socketId: socket.id,
      userId: user.id,
      name: user.name || 'Cinéfilo',
      image: user.image || null,
      eloRating: user.eloRating || 1000,
      score: 0,
      isEliminated: false,
      isBot: false,
      hasAnswered: false,
    };

    this.waitingLobby.push(player);
    this.broadcastLobbyCount();

    if (this.waitingLobby.length >= 10) {
      this.startRoomImmediately();
    } else if (!this.lobbyTimer) {
      // Iniciar temporizador de 6 segundos para no dejar esperando al jugador
      this.lobbyTimer = setTimeout(() => {
        this.fillWithBotsAndStart();
      }, 6000);
    }
  }

  @SubscribeMessage('leave_br_lobby')
  handleLeaveLobby(@ConnectedSocket() socket: Socket) {
    this.waitingLobby = this.waitingLobby.filter((p) => p.socketId !== socket.id);
    this.broadcastLobbyCount();
  }

  private broadcastLobbyCount() {
    this.server.emit('lobby_update', {
      playerCount: this.waitingLobby.length,
      players: this.waitingLobby.map((p) => ({ name: p.name, image: p.image })),
    });
  }

  private async fillWithBotsAndStart() {
    if (this.lobbyTimer) clearTimeout(this.lobbyTimer);
    this.lobbyTimer = undefined;

    if (this.waitingLobby.length === 0) return;

    const neededBots = 10 - this.waitingLobby.length;
    for (let i = 0; i < neededBots; i++) {
      const botName = BOT_NAMES[i % BOT_NAMES.length] + `_${Math.floor(Math.random() * 80 + 10)}`;
      this.waitingLobby.push({
        userId: `bot_${Date.now()}_${i}`,
        name: botName,
        image: null,
        eloRating: Math.floor(Math.random() * 400 + 900),
        score: 0,
        isEliminated: false,
        isBot: true,
        hasAnswered: false,
      });
    }

    await this.startRoomImmediately();
  }

  private async startRoomImmediately() {
    if (this.lobbyTimer) clearTimeout(this.lobbyTimer);
    this.lobbyTimer = undefined;

    const players = this.waitingLobby.splice(0, 10);
    const roomId = `br_room_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Cargar 15 preguntas variadas para las 5 rondas
    const questionsPool = await this.prisma.question.findMany({ take: 35 });
    const selectedQ = questionsPool.sort(() => 0.5 - Math.random()).slice(0, 15);

    const room: BRRoom = {
      roomId,
      players,
      currentRound: 1,
      questionInRound: 1,
      questionsPool: selectedQ,
      status: 'IN_PROGRESS',
    };

    this.activeRooms.set(roomId, room);

    // Unir sockets a la sala
    for (const p of players) {
      if (!p.isBot && p.socketId) {
        const s = this.server.sockets.sockets.get(p.socketId);
        if (s) s.join(roomId);
      }
    }

    this.server.to(roomId).emit('br_match_start', {
      roomId,
      totalPlayers: 10,
      players: players.map((p) => ({
        userId: p.userId,
        name: p.name,
        image: p.image,
        eloRating: p.eloRating,
        isBot: p.isBot,
      })),
    });

    // Iniciar Ronda 1 tras 3s de intro
    setTimeout(() => {
      this.sendNextBRQuestion(roomId);
    }, 3000);
  }

  private sendNextBRQuestion(roomId: string) {
    const room = this.activeRooms.get(roomId);
    if (!room) return;

    const qIndex = (room.currentRound - 1) * 3 + (room.questionInRound - 1);
    const rawQ = room.questionsPool[qIndex];

    if (!rawQ) {
      this.finishBRMatch(roomId);
      return;
    }

    room.currentQuestion = {
      id: rawQ.id,
      text: rawQ.text,
      options: rawQ.options,
      difficulty: rawQ.difficulty,
      imageUrl: rawQ.imageUrl || null,
      correctAnswer: rawQ.correctAnswer,
      answerHash: hashAnswer(rawQ.correctAnswer, rawQ.id),
    };

    // Resetear respuestas de jugadores activos
    for (const p of room.players) {
      p.hasAnswered = false;
    }

    const safeQ: SafeQuestionPayload = {
      id: rawQ.id,
      text: rawQ.text,
      options: rawQ.options,
      difficulty: rawQ.difficulty,
      imageUrl: rawQ.imageUrl || null,
      answerHash: room.currentQuestion.answerHash,
    };

    const activePlayers = room.players.filter((p) => !p.isEliminated);

    this.server.to(roomId).emit('br_question_start', {
      round: room.currentRound,
      questionNumber: room.questionInRound,
      totalRounds: 5,
      activePlayerCount: activePlayers.length,
      question: safeQ,
      timeLimit: 10,
      leaderboard: this.getRoomLeaderboard(room),
    });

    // Simular respuestas de los bots
    this.simulateBotAnswers(room, rawQ.correctAnswer);

    // Temporizador de 10.5 segundos por pregunta
    room.questionTimer = setTimeout(() => {
      this.handleBRQuestionTimeout(roomId);
    }, 10500);
  }

  private simulateBotAnswers(room: BRRoom, correctAnswer: string) {
    const activeBots = room.players.filter((p) => !p.isEliminated && p.isBot);
    activeBots.forEach((bot) => {
      const responseTimeMs = Math.floor(Math.random() * 6000 + 2000);
      const isCorrect = Math.random() > 0.35; // 65% tasa de acierto en bots

      setTimeout(() => {
        if (!bot.hasAnswered && room.status === 'IN_PROGRESS') {
          bot.hasAnswered = true;
          if (isCorrect) {
            const score = Math.max(1000, 10000 - responseTimeMs);
            bot.score += score;
          }
          this.broadcastLiveScoreUpdate(room);
        }
      }, responseTimeMs);
    });
  }

  @SubscribeMessage('submit_br_answer')
  handleSubmitBRAnswer(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; selectedAnswer: string; timeSpentMs: number },
  ) {
    const room = this.activeRooms.get(data.roomId);
    if (!room || !room.currentQuestion) return;

    const player = room.players.find((p) => p.socketId === socket.id && !p.isEliminated);
    if (!player || player.hasAnswered) return;

    player.hasAnswered = true;
    const isCorrect = room.currentQuestion.correctAnswer === data.selectedAnswer;
    if (isCorrect) {
      player.score += Math.max(1000, 10000 - data.timeSpentMs);
    }

    this.broadcastLiveScoreUpdate(room);

    // Si todos los jugadores activos ya respondieron, avanzar de inmediato
    const allActiveAnswered = room.players
      .filter((p) => !p.isEliminated)
      .every((p) => p.hasAnswered);

    if (allActiveAnswered) {
      if (room.questionTimer) clearTimeout(room.questionTimer);
      this.revealBRQuestionResult(data.roomId);
    }
  }

  private handleBRQuestionTimeout(roomId: string) {
    this.revealBRQuestionResult(roomId);
  }

  private revealBRQuestionResult(roomId: string) {
    const room = this.activeRooms.get(roomId);
    if (!room || !room.currentQuestion) return;

    const leaderboard = this.getRoomLeaderboard(room);

    this.server.to(roomId).emit('br_question_result', {
      correctAnswer: room.currentQuestion.correctAnswer,
      leaderboard,
    });

    if (room.questionInRound < 3) {
      // Siguiente pregunta de la misma ronda
      room.questionInRound += 1;
      setTimeout(() => {
        this.sendNextBRQuestion(roomId);
      }, 2000);
    } else {
      // Fin de la ronda -> Ejecutar Eliminación
      this.executeRoundEliminations(roomId);
    }
  }

  private executeRoundEliminations(roomId: string) {
    const room = this.activeRooms.get(roomId);
    if (!room) return;

    const activePlayers = room.players
      .filter((p) => !p.isEliminated)
      .sort((a, b) => b.score - a.score);

    if (room.currentRound === 5 || activePlayers.length <= 2) {
      // Fin de la Gran Final
      this.finishBRMatch(roomId);
      return;
    }

    // Eliminar a los 2 últimos de la ronda
    const eliminated = activePlayers.slice(-2);
    for (const p of eliminated) {
      p.isEliminated = true;
      p.eliminatedInRound = room.currentRound;
    }

    const surviving = activePlayers.slice(0, -2);

    this.server.to(roomId).emit('br_round_elimination', {
      roundEnded: room.currentRound,
      eliminatedPlayers: eliminated.map((p) => ({ userId: p.userId, name: p.name, score: p.score })),
      survivingPlayers: surviving.map((p) => ({ userId: p.userId, name: p.name, score: p.score })),
      nextRound: room.currentRound + 1,
    });

    room.currentRound += 1;
    room.questionInRound = 1;

    setTimeout(() => {
      this.sendNextBRQuestion(roomId);
    }, 3500);
  }

  private async finishBRMatch(roomId: string) {
    const room = this.activeRooms.get(roomId);
    if (!room) return;

    const finalRanking = [...room.players].sort((a, b) => b.score - a.score);
    finalRanking.forEach((p, index) => {
      p.finalRank = index + 1;
    });

    const champion = finalRanking[0];

    // Recompensas para jugadores reales
    for (const p of finalRanking) {
      if (!p.isBot) {
        const rewards =
          p.finalRank === 1
            ? { coins: 350, xp: 150, eloChange: 50 }
            : p.finalRank === 2
            ? { coins: 200, xp: 100, eloChange: 30 }
            : p.finalRank! <= 4
            ? { coins: 100, xp: 50, eloChange: 15 }
            : p.finalRank! <= 8
            ? { coins: 40, xp: 20, eloChange: -10 }
            : { coins: 10, xp: 5, eloChange: -25 };

        await this.prisma.user.update({
          where: { id: p.userId },
          data: {
            coins: { increment: rewards.coins },
            xp: { increment: rewards.xp },
            eloRating: { increment: rewards.eloChange },
          },
        });

        await this.prisma.gameSession.create({
          data: {
            userId: p.userId,
            mode: GameMode.BATTLE_ROYALE,
            score: p.score,
            coinsEarned: rewards.coins,
            xpEarned: rewards.xp,
            totalQuestions: 15,
          },
        });
      }
    }

    this.server.to(roomId).emit('br_match_end', {
      champion: { name: champion.name, score: champion.score },
      podium: finalRanking.slice(0, 4).map((p) => ({
        rank: p.finalRank,
        name: p.name,
        score: p.score,
        isBot: p.isBot,
      })),
      allPlayers: finalRanking.map((p) => ({
        rank: p.finalRank,
        name: p.name,
        score: p.score,
        isBot: p.isBot,
      })),
    });

    this.activeRooms.delete(roomId);
  }

  private broadcastLiveScoreUpdate(room: BRRoom) {
    this.server.to(room.roomId).emit('br_leaderboard_update', {
      leaderboard: this.getRoomLeaderboard(room),
    });
  }

  private getRoomLeaderboard(room: BRRoom) {
    return [...room.players]
      .sort((a, b) => b.score - a.score)
      .map((p, idx) => ({
        rank: idx + 1,
        userId: p.userId,
        name: p.name,
        image: p.image,
        score: p.score,
        isEliminated: p.isEliminated,
        hasAnswered: p.hasAnswered,
      }));
  }
}
