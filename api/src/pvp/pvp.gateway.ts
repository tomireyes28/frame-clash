// api/src/pvp/pvp.gateway.ts
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
import { ScoringService } from '../game/scoring.service';
import { hashAnswer } from '../game/utils/hash.util';
import { SafeQuestionPayload } from '../game/interfaces/game.interface';
import { GameMode } from '@prisma/client';

interface QueuePlayer {
  socketId: string;
  userId: string;
  name: string;
  image: string | null;
  eloRating: number;
  categoryKey?: string;
  equippedCards: string[];
}

interface ActiveRoom {
  roomId: string;
  categoryKey: string;
  categoryName: string;
  categoryIcon: string;
  questions: {
    id: string;
    text: string;
    options: string[];
    difficulty: string;
    imageUrl?: string | null;
    correctAnswer: string;
    answerHash: string;
  }[];
  currentQIndex: number;
  questionTimer?: NodeJS.Timeout;
  p1: {
    socketId: string;
    userId: string;
    name: string;
    image: string | null;
    eloRating: number;
    score: number;
    hasAnswered: boolean;
    answers: { questionId: string; selectedAnswer: string; timeSpentMs: number }[];
  };
  p2: {
    socketId: string;
    userId: string;
    name: string;
    image: string | null;
    eloRating: number;
    score: number;
    hasAnswered: boolean;
    answers: { questionId: string; selectedAnswer: string; timeSpentMs: number }[];
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/pvp-live',
})
export class PvpGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(PvpGateway.name);
  private waitingQueue: QueuePlayer[] = [];
  private activeRooms = new Map<string, ActiveRoom>();
  private socketUserMap = new Map<string, string>(); // socketId -> userId

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly scoringService: ScoringService,
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
      this.socketUserMap.set(socket.id, user.id);
      this.logger.log(`Jugador conectado al PvP en Vivo: ${user.name} (${socket.id})`);
    } catch (err) {
      this.logger.warn(`Error de autenticación en WebSocket: ${err}`);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = this.socketUserMap.get(socket.id);
    this.socketUserMap.delete(socket.id);

    // Remover de cola de espera
    this.waitingQueue = this.waitingQueue.filter((p) => p.socketId !== socket.id);

    // Manejar abandono en partidas activas
    for (const [roomId, room] of this.activeRooms.entries()) {
      if (room.p1.socketId === socket.id || room.p2.socketId === socket.id) {
        const isP1 = room.p1.socketId === socket.id;
        const winner = isP1 ? room.p2 : room.p1;
        const loser = isP1 ? room.p1 : room.p2;

        if (room.questionTimer) clearTimeout(room.questionTimer);

        this.server.to(roomId).emit('player_forfeit', {
          winnerId: winner.userId,
          winnerName: winner.name,
          loserId: loser.userId,
          message: `${loser.name} se desconectó de la batalla. ¡Victoria para ${winner.name}!`,
        });

        this.finalizeMatch(room, winner.userId);
        this.activeRooms.delete(roomId);
        break;
      }
    }
  }

  @SubscribeMessage('join_queue')
  async handleJoinQueue(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { categoryKey?: string; equippedCards?: string[] },
  ) {
    const user = socket.data.user;
    if (!user) return;

    // Evitar duplicados en cola
    this.waitingQueue = this.waitingQueue.filter((p) => p.userId !== user.id);

    const newPlayer: QueuePlayer = {
      socketId: socket.id,
      userId: user.id,
      name: user.name || 'Cinéfilo',
      image: user.image || null,
      eloRating: user.eloRating || 1000,
      categoryKey: data?.categoryKey,
      equippedCards: data?.equippedCards || [],
    };

    // Buscar oponente en cola
    const opponentIndex = this.waitingQueue.findIndex((p) => p.userId !== user.id);

    if (opponentIndex !== -1) {
      const opponent = this.waitingQueue.splice(opponentIndex, 1)[0];
      await this.createMatchRoom(opponent, newPlayer);
    } else {
      this.waitingQueue.push(newPlayer);
      socket.emit('queue_joined', { message: 'Buscando oponente en vivo...' });
    }
  }

  @SubscribeMessage('leave_queue')
  handleLeaveQueue(@ConnectedSocket() socket: Socket) {
    this.waitingQueue = this.waitingQueue.filter((p) => p.socketId !== socket.id);
    socket.emit('queue_left', { message: 'Saliste de la cola de emparejamiento.' });
  }

  private async createMatchRoom(p1: QueuePlayer, p2: QueuePlayer) {
    const roomId = `room_pvp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Cargar 10 preguntas
    const catKey = p1.categoryKey || p2.categoryKey;
    let questionsPool = await this.prisma.question.findMany({
      where: catKey ? { categories: { has: catKey } } : {},
      take: 30,
    });

    if (questionsPool.length < 10) {
      questionsPool = await this.prisma.question.findMany({ take: 30 });
    }

    const selectedQ = questionsPool.sort(() => 0.5 - Math.random()).slice(0, 10);
    const questions = selectedQ.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      difficulty: q.difficulty,
      imageUrl: q.imageUrl,
      correctAnswer: q.correctAnswer,
      answerHash: hashAnswer(q.correctAnswer, q.id),
    }));

    const cat = catKey ? await this.prisma.category.findUnique({ where: { key: catKey } }) : null;

    const room: ActiveRoom = {
      roomId,
      categoryKey: catKey || 'MIXED',
      categoryName: cat?.name || 'Trivia Mixta Universal',
      categoryIcon: cat?.icon || '🎬',
      questions,
      currentQIndex: 0,
      p1: {
        socketId: p1.socketId,
        userId: p1.userId,
        name: p1.name,
        image: p1.image,
        eloRating: p1.eloRating,
        score: 0,
        hasAnswered: false,
        answers: [],
      },
      p2: {
        socketId: p2.socketId,
        userId: p2.userId,
        name: p2.name,
        image: p2.image,
        eloRating: p2.eloRating,
        score: 0,
        hasAnswered: false,
        answers: [],
      },
    };

    this.activeRooms.set(roomId, room);

    const s1 = this.server.sockets.sockets.get(p1.socketId);
    const s2 = this.server.sockets.sockets.get(p2.socketId);

    if (s1) s1.join(roomId);
    if (s2) s2.join(roomId);

    // Enviar señal de match encontrado
    this.server.to(roomId).emit('match_start', {
      roomId,
      category: { key: room.categoryKey, name: room.categoryName, icon: room.categoryIcon },
      totalQuestions: 10,
      player1: { userId: p1.userId, name: p1.name, image: p1.image, eloRating: p1.eloRating },
      player2: { userId: p2.userId, name: p2.name, image: p2.image, eloRating: p2.eloRating },
    });

    // Arrancar la primera pregunta tras 2.5s de cuenta regresiva
    setTimeout(() => {
      this.sendNextQuestion(roomId);
    }, 2500);
  }

  private sendNextQuestion(roomId: string) {
    const room = this.activeRooms.get(roomId);
    if (!room) return;

    if (room.currentQIndex >= room.questions.length) {
      this.endMatch(roomId);
      return;
    }

    room.p1.hasAnswered = false;
    room.p2.hasAnswered = false;

    const q = room.questions[room.currentQIndex];
    const safeQ: SafeQuestionPayload = {
      id: q.id,
      text: q.text,
      options: q.options,
      difficulty: q.difficulty as any,
      imageUrl: q.imageUrl || null,
      answerHash: q.answerHash,
    };

    this.server.to(roomId).emit('question_start', {
      questionIndex: room.currentQIndex,
      totalQuestions: room.questions.length,
      question: safeQ,
      timeLimit: 10,
    });

    // Temporizador de 10.5 segundos por pregunta
    room.questionTimer = setTimeout(() => {
      this.handleQuestionTimeout(roomId);
    }, 10500);
  }

  @SubscribeMessage('submit_answer')
  handleSubmitAnswer(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; selectedAnswer: string; timeSpentMs: number },
  ) {
    const room = this.activeRooms.get(data.roomId);
    if (!room) return;

    const isP1 = room.p1.socketId === socket.id;
    const player = isP1 ? room.p1 : room.p2;

    if (player.hasAnswered) return;
    player.hasAnswered = true;

    const q = room.questions[room.currentQIndex];
    const isCorrect = q.correctAnswer === data.selectedAnswer;
    const qScore = isCorrect ? Math.max(1000, 10000 - data.timeSpentMs) : 0;
    player.score += qScore;

    player.answers.push({
      questionId: q.id,
      selectedAnswer: data.selectedAnswer,
      timeSpentMs: data.timeSpentMs,
    });

    // Notificar al oponente en tiempo real
    this.server.to(data.roomId).emit('live_score_update', {
      userId: player.userId,
      isCorrect,
      scoreAdded: qScore,
      totalScore: player.score,
    });

    // Si ambos respondieron, avanzar inmediatamente
    if (room.p1.hasAnswered && room.p2.hasAnswered) {
      if (room.questionTimer) clearTimeout(room.questionTimer);
      this.revealQuestionResult(data.roomId);
    }
  }

  private handleQuestionTimeout(roomId: string) {
    const room = this.activeRooms.get(roomId);
    if (!room) return;

    const q = room.questions[room.currentQIndex];

    if (!room.p1.hasAnswered) {
      room.p1.hasAnswered = true;
      room.p1.answers.push({ questionId: q.id, selectedAnswer: '__TIMEOUT__', timeSpentMs: 10000 });
    }
    if (!room.p2.hasAnswered) {
      room.p2.hasAnswered = true;
      room.p2.answers.push({ questionId: q.id, selectedAnswer: '__TIMEOUT__', timeSpentMs: 10000 });
    }

    this.revealQuestionResult(roomId);
  }

  private revealQuestionResult(roomId: string) {
    const room = this.activeRooms.get(roomId);
    if (!room) return;

    const q = room.questions[room.currentQIndex];

    this.server.to(roomId).emit('question_result', {
      correctAnswer: q.correctAnswer,
      p1Score: room.p1.score,
      p2Score: room.p2.score,
    });

    room.currentQIndex += 1;

    setTimeout(() => {
      this.sendNextQuestion(roomId);
    }, 2000);
  }

  private async endMatch(roomId: string) {
    const room = this.activeRooms.get(roomId);
    if (!room) return;

    let winnerId: string | null = null;
    if (room.p1.score > room.p2.score) winnerId = room.p1.userId;
    else if (room.p2.score > room.p1.score) winnerId = room.p2.userId;

    const finalData = await this.finalizeMatch(room, winnerId);

    this.server.to(roomId).emit('match_end', finalData);
    this.activeRooms.delete(roomId);
  }

  private async finalizeMatch(room: ActiveRoom, winnerId: string | null) {
    let p1Actual = 0.5;
    let p2Actual = 0.5;

    if (winnerId === room.p1.userId) {
      p1Actual = 1;
      p2Actual = 0;
    } else if (winnerId === room.p2.userId) {
      p1Actual = 0;
      p2Actual = 1;
    }

    const calculateElo = (r1: number, r2: number, s: number) => {
      const e = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
      return Math.round(32 * (s - e));
    };

    const p1EloChange = calculateElo(room.p1.eloRating, room.p2.eloRating, p1Actual);
    const p2EloChange = calculateElo(room.p2.eloRating, room.p1.eloRating, p2Actual);

    const newP1Elo = Math.max(100, room.p1.eloRating + p1EloChange);
    const newP2Elo = Math.max(100, room.p2.eloRating + p2EloChange);

    const p1Rewards = p1Actual === 1 ? { coins: 150, xp: 75 } : p1Actual === 0.5 ? { coins: 60, xp: 35 } : { coins: 35, xp: 20 };
    const p2Rewards = p2Actual === 1 ? { coins: 150, xp: 75 } : p2Actual === 0.5 ? { coins: 60, xp: 35 } : { coins: 35, xp: 20 };

    await this.prisma.$transaction([
      this.prisma.pvpMatch.create({
        data: {
          mode: GameMode.PVP_LIVE,
          status: 'FINISHED',
          categoryKey: room.categoryKey,
          questionIds: room.questions.map((q) => q.id),
          player1Id: room.p1.userId,
          player1Score: room.p1.score,
          player1Answers: room.p1.answers as any,
          player2Id: room.p2.userId,
          player2Score: room.p2.score,
          player2Answers: room.p2.answers as any,
          winnerId,
          p1EloChange,
          p2EloChange,
        },
      }),
      this.prisma.user.update({
        where: { id: room.p1.userId },
        data: {
          eloRating: newP1Elo,
          coins: { increment: p1Rewards.coins },
          xp: { increment: p1Rewards.xp },
        },
      }),
      this.prisma.user.update({
        where: { id: room.p2.userId },
        data: {
          eloRating: newP2Elo,
          coins: { increment: p2Rewards.coins },
          xp: { increment: p2Rewards.xp },
        },
      }),
    ]);

    return {
      winnerId,
      player1: {
        userId: room.p1.userId,
        name: room.p1.name,
        score: room.p1.score,
        eloChange: p1EloChange,
        newElo: newP1Elo,
        rewards: p1Rewards,
      },
      player2: {
        userId: room.p2.userId,
        name: room.p2.name,
        score: room.p2.score,
        eloChange: p2EloChange,
        newElo: newP2Elo,
        rewards: p2Rewards,
      },
    };
  }
}
