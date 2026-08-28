// api/src/pvp/pvp.service.ts
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../game/scoring.service';
import { hashAnswer } from '../game/utils/hash.util';
import { SafeQuestionPayload, PowerUpPayload } from '../game/interfaces/game.interface';
import {
  PvpMatchSummary,
  PvpStartResponse,
  PvpSubmitResponse,
  PvpPlayerInfo,
} from './interfaces/pvp.interface';
import { CreatePvpChallengeDto } from './dto/create-pvp-challenge.dto';
import { SubmitPvpMatchDto } from './dto/submit-pvp-match.dto';
import { GameMode, Prisma } from '@prisma/client';

@Injectable()
export class PvpService {
  private readonly logger = new Logger(PvpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scoringService: ScoringService,
  ) {}

  /**
   * Helper: Calcula la variación de ELO entre 2 jugadores
   * S = 1 (Victoria), S = 0.5 (Empate), S = 0 (Derrota)
   */
  calculateEloChange(playerRating: number, opponentRating: number, actualScore: number, kFactor: number = 32): number {
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    return Math.round(kFactor * (actualScore - expectedScore));
  }

  /**
   * Helper: Determina el Tier de rango según ELO
   */
  getRankTier(elo: number): string {
    if (elo < 1100) return 'Bronze';
    if (elo < 1400) return 'Silver';
    if (elo < 1700) return 'Gold';
    if (elo < 2000) return 'Platinum';
    return 'Diamond';
  }

  /**
   * 1. Obtiene los duelos activos, pendientes e historial del usuario
   */
  async getMyMatches(userId: string): Promise<{
    userElo: number;
    rankTier: string;
    pendingCount: number;
    activeMatches: PvpMatchSummary[];
    historyMatches: PvpMatchSummary[];
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { eloRating: true, rankTier: true },
    });

    const matches = await this.prisma.pvpMatch.findMany({
      where: {
        OR: [{ player1Id: userId }, { player2Id: userId }],
      },
      include: {
        player1: { select: { id: true, name: true, image: true, eloRating: true } },
        player2: { select: { id: true, name: true, image: true, eloRating: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 30,
    });

    const categories = await this.prisma.category.findMany();
    const categoryMap = new Map(categories.map((c) => [c.key, c]));

    const summaries: PvpMatchSummary[] = matches.map((m) => {
      const cat = m.categoryKey ? categoryMap.get(m.categoryKey) : null;
      const isP1 = m.player1Id === userId;
      const isWinner = m.winnerId === userId;

      const p1Info: PvpPlayerInfo = {
        userId: m.player1.id,
        name: m.player1.name || 'Retador',
        image: m.player1.image || null,
        eloRating: m.player1.eloRating,
        score: m.player1Score,
        eloChange: m.p1EloChange,
      };

      const p2Info: PvpPlayerInfo | null = m.player2
        ? {
            userId: m.player2.id,
            name: m.player2.name || 'Rival',
            image: m.player2.image || null,
            eloRating: m.player2.eloRating,
            score: m.player2Score,
            eloChange: m.p2EloChange,
          }
        : null;

      let status: 'PENDING' | 'WAITING_OPPONENT' | 'FINISHED' = 'PENDING';
      if (m.status === 'FINISHED') status = 'FINISHED';
      else if (isP1 && !m.player2Id) status = 'WAITING_OPPONENT';
      else if (!isP1 && m.player2Score === 0) status = 'PENDING';

      return {
        id: m.id,
        status,
        categoryKey: m.categoryKey,
        categoryName: cat?.name || 'Mixto Cinéfilo',
        categoryIcon: cat?.icon || '🎬',
        player1: p1Info,
        player2: p2Info,
        winnerId: m.winnerId,
        isCurrentUserWinner: isWinner,
        currentUserScore: isP1 ? m.player1Score : m.player2Score,
        opponentScore: isP1 ? m.player2Score : m.player1Score,
        eloChange: isP1 ? m.p1EloChange : m.p2EloChange,
        createdAt: m.createdAt,
      };
    });

    const activeMatches = summaries.filter((s) => s.status !== 'FINISHED');
    const historyMatches = summaries.filter((s) => s.status === 'FINISHED');

    return {
      userElo: user?.eloRating || 1000,
      rankTier: this.getRankTier(user?.eloRating || 1000),
      pendingCount: activeMatches.length,
      activeMatches,
      historyMatches,
    };
  }

  /**
   * 2. Inicia o busca un emparejamiento PvP 1v1 Asincrónico
   */
  async createOrFindMatch(userId: string, dto: CreatePvpChallengeDto): Promise<PvpStartResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, image: true, eloRating: true },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado.');

    // 1. Buscar partida abierta compatible de otro retador
    const openMatch = await this.prisma.pvpMatch.findFirst({
      where: {
        status: 'PENDING',
        player1Id: { not: userId },
        player2Id: null,
        ...(dto.categoryKey ? { categoryKey: dto.categoryKey } : {}),
      },
      include: {
        player1: { select: { id: true, name: true, image: true, eloRating: true } },
      },
    });

    if (openMatch) {
      // Unirse como Player 2
      await this.prisma.pvpMatch.update({
        where: { id: openMatch.id },
        data: {
          player2Id: userId,
          player2PowerUps: dto.equippedCardIds || [],
          status: 'IN_PROGRESS',
        },
      });

      const questions = await this.prisma.question.findMany({
        where: { id: { in: openMatch.questionIds } },
      });

      const safeQuestions: SafeQuestionPayload[] = openMatch.questionIds
        .map((id) => questions.find((q) => q.id === id))
        .filter(Boolean)
        .map((q) => ({
          id: q!.id,
          text: q!.text,
          options: q!.options,
          difficulty: q!.difficulty,
          imageUrl: q!.imageUrl,
          block: q!.block,
          typeNumber: q!.typeNumber,
          answerHash: hashAnswer(q!.correctAnswer, q!.id),
        }));

      const powerUps = await this.getPowerUpsFromCardIds(dto.equippedCardIds || []);
      const category = await this.getCategoryInfo(openMatch.categoryKey);

      return {
        matchId: openMatch.id,
        role: 'PLAYER_2',
        category,
        opponent: {
          userId: openMatch.player1.id,
          name: openMatch.player1.name || 'Retador',
          image: openMatch.player1.image,
          eloRating: openMatch.player1.eloRating,
        },
        questions: safeQuestions,
        powerUps,
      };
    }

    // 2. Crear nueva partida como Player 1
    let questionsPool = await this.prisma.question.findMany({
      where: dto.categoryKey ? { categories: { has: dto.categoryKey } } : {},
      take: 30,
    });

    if (questionsPool.length < 10) {
      questionsPool = await this.prisma.question.findMany({ take: 30 });
    }

    const selectedQuestions = questionsPool.sort(() => 0.5 - Math.random()).slice(0, 10);
    const questionIds = selectedQuestions.map((q) => q.id);

    const newMatch = await this.prisma.pvpMatch.create({
      data: {
        mode: GameMode.PVP_ASYNC,
        status: 'PENDING',
        categoryKey: dto.categoryKey || null,
        questionIds,
        player1Id: userId,
        player1PowerUps: dto.equippedCardIds || [],
      },
    });

    const safeQuestions: SafeQuestionPayload[] = selectedQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      difficulty: q.difficulty,
      imageUrl: q.imageUrl,
      block: q.block,
      typeNumber: q.typeNumber,
      answerHash: hashAnswer(q.correctAnswer, q.id),
    }));

    const powerUps = await this.getPowerUpsFromCardIds(dto.equippedCardIds || []);
    const category = await this.getCategoryInfo(dto.categoryKey);

    return {
      matchId: newMatch.id,
      role: 'PLAYER_1',
      category,
      opponent: null, // Esperando rival
      questions: safeQuestions,
      powerUps,
    };
  }

  /**
   * 3. Envía las respuestas del duelo y calcula el resultado / ELO
   */
  async submitMatch(userId: string, dto: SubmitPvpMatchDto): Promise<PvpSubmitResponse> {
    const match = await this.prisma.pvpMatch.findUnique({
      where: { id: dto.matchId },
      include: {
        player1: true,
        player2: true,
      },
    });

    if (!match) throw new NotFoundException('Duelo no encontrado.');

    const isP1 = match.player1Id === userId;
    const isP2 = match.player2Id === userId;

    if (!isP1 && !isP2) {
      throw new BadRequestException('No formas parte de este duelo.');
    }

    // Validación de puntaje
    const realQuestions = await this.prisma.question.findMany({
      where: { id: { in: match.questionIds } },
      select: { id: true, correctAnswer: true },
    });

    let calculatedScore = 0;
    for (const log of dto.auditLog) {
      this.scoringService.validateTimeIntegrity(log.timeSpentMs);
      const realQ = realQuestions.find((q) => q.id === log.questionId);
      const isCorrect = Boolean(realQ && realQ.correctAnswer === log.selectedAnswer);
      const qScore = this.scoringService.calculateQuestionScore(isCorrect, log.timeSpentMs);
      calculatedScore += qScore.totalPoints;
    }

    const difference = Math.abs(calculatedScore - dto.claimedScore);
    const maxTolerance = calculatedScore * ScoringService.TOLERANCE_PERCENTAGE;
    const finalScore = difference <= maxTolerance ? dto.claimedScore : calculatedScore;

    if (isP1) {
      // Player 1 envía su puntaje
      if (!match.player2Id) {
        // Aún no hay Player 2 -> Generar un Reto Fantasma equilibrado si tarda, o dejar en espera
        await this.prisma.pvpMatch.update({
          where: { id: match.id },
          data: {
            player1Score: finalScore,
            player1Answers: dto.auditLog as unknown as Prisma.InputJsonValue,
          },
        });

        const user = match.player1;
        return {
          matchId: match.id,
          status: 'WAITING_OPPONENT',
          result: 'PENDING',
          myScore: finalScore,
          eloChange: 0,
          newEloRating: user.eloRating,
          rankTier: this.getRankTier(user.eloRating),
          rewards: { coins: 0, xp: 0 },
          message: '¡Puntaje registrado! Tu duelo quedó publicado a la espera de un rival.',
        };
      } else {
        // Player 2 ya existe -> resolver partida
        return this.resolveMatch(match.id, finalScore, match.player2Score, match.player1, match.player2!);
      }
    } else {
      // Player 2 envía su puntaje -> Se resuelve el duelo inmediatamente
      return this.resolveMatch(match.id, match.player1Score, finalScore, match.player1, match.player2!);
    }
  }

  /**
   * Helper: Resuelve el resultado, calcula ELO y acredita recompensas
   */
  private async resolveMatch(
    matchId: string,
    p1Score: number,
    p2Score: number,
    p1: { id: string; name: string | null; eloRating: number; coins: number; xp: number },
    p2: { id: string; name: string | null; eloRating: number; coins: number; xp: number },
  ): Promise<PvpSubmitResponse> {
    let p1Actual = 0.5;
    let p2Actual = 0.5;
    let winnerId: string | null = null;

    if (p1Score > p2Score) {
      p1Actual = 1;
      p2Actual = 0;
      winnerId = p1.id;
    } else if (p2Score > p1Score) {
      p1Actual = 0;
      p2Actual = 1;
      winnerId = p2.id;
    }

    const p1EloChange = this.calculateEloChange(p1.eloRating, p2.eloRating, p1Actual);
    const p2EloChange = this.calculateEloChange(p2.eloRating, p1.eloRating, p2Actual);

    const newP1Elo = Math.max(100, p1.eloRating + p1EloChange);
    const newP2Elo = Math.max(100, p2.eloRating + p2EloChange);

    const p1Rewards = p1Actual === 1 ? { coins: 120, xp: 60 } : p1Actual === 0.5 ? { coins: 50, xp: 30 } : { coins: 30, xp: 15 };
    const p2Rewards = p2Actual === 1 ? { coins: 120, xp: 60 } : p2Actual === 0.5 ? { coins: 50, xp: 30 } : { coins: 30, xp: 15 };

    await this.prisma.$transaction([
      this.prisma.pvpMatch.update({
        where: { id: matchId },
        data: {
          player1Score: p1Score,
          player2Score: p2Score,
          winnerId,
          p1EloChange,
          p2EloChange,
          status: 'FINISHED',
        },
      }),
      this.prisma.user.update({
        where: { id: p1.id },
        data: {
          eloRating: newP1Elo,
          rankTier: this.getRankTier(newP1Elo),
          coins: { increment: p1Rewards.coins },
          xp: { increment: p1Rewards.xp },
        },
      }),
      this.prisma.user.update({
        where: { id: p2.id },
        data: {
          eloRating: newP2Elo,
          rankTier: this.getRankTier(newP2Elo),
          coins: { increment: p2Rewards.coins },
          xp: { increment: p2Rewards.xp },
        },
      }),
      this.prisma.gameSession.create({
        data: {
          userId: p2.id,
          mode: GameMode.PVP_ASYNC,
          score: p2Score,
          coinsEarned: p2Rewards.coins,
          xpEarned: p2Rewards.xp,
          totalQuestions: 10,
        },
      }),
    ]);

    const isP2Winner = winnerId === p2.id;
    const isDraw = winnerId === null;

    return {
      matchId,
      status: 'FINISHED',
      result: isDraw ? 'DRAW' : isP2Winner ? 'VICTORY' : 'DEFEAT',
      myScore: p2Score,
      opponentScore: p1Score,
      opponentName: p1.name || 'Retador',
      eloChange: p2EloChange,
      newEloRating: newP2Elo,
      rankTier: this.getRankTier(newP2Elo),
      rewards: p2Rewards,
      message: isDraw
        ? '¡Empate épico! Ambos gladiadores demostraron su conocimiento.'
        : isP2Winner
        ? '¡Victoria en el Duelo! Sumaste puntos ELO y subiste en el ranking.'
        : 'Derrota en el Duelo. ¡Reintentalo en tu próxima batalla!',
    };
  }

  private async getPowerUpsFromCardIds(cardIds: string[]): Promise<PowerUpPayload[]> {
    if (!cardIds || cardIds.length === 0) return [];
    const cards = await this.prisma.card.findMany({
      where: { id: { in: cardIds }, powerUpAction: { not: null } },
    });
    return cards.map((c) => ({
      id: c.id,
      title: c.title,
      action: c.powerUpAction ? String(c.powerUpAction) : null,
      value: c.powerUpValue,
    }));
  }

  private async getCategoryInfo(categoryKey?: string | null): Promise<{ key: string; name: string; icon: string }> {
    if (!categoryKey) return { key: 'MIXED', name: 'Trivia Mixta Universal', icon: '🎬' };
    const cat = await this.prisma.category.findUnique({ where: { key: categoryKey } });
    return {
      key: categoryKey,
      name: cat?.name || categoryKey,
      icon: cat?.icon || '🎬',
    };
  }
}
