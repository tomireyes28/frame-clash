// api/src/cards/cards.service.ts
import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { Prisma, Rarity, ActionType } from '@prisma/client';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async createCard(data: CreateCardDto) {
    const existingCard = await this.prisma.card.findUnique({
      where: { tmdbId: data.tmdbId },
    });

    if (existingCard) {
      throw new ConflictException(`La carta de ${data.title} ya existe en la base de datos.`);
    }

    if (!data.categories || data.categories.length === 0) {
      throw new BadRequestException('Debes enviar al menos una categoría.');
    }

    return this.prisma.card.create({
      data: {
        tmdbId: data.tmdbId,
        title: data.title,
        posterPath: data.posterPath || null,
        year: data.year,
        rarity: data.rarity as Rarity,
        powerUpAction: data.powerUpAction ? (data.powerUpAction as ActionType) : null,
        powerUpValue: data.powerUpValue || null,
        categories: {
          connect: data.categories.map((key) => ({ key })),
        },
      },
      include: {
        categories: true,
      },
    });
  }

  async findAll() {
    return this.prisma.card.findMany({
      include: {
        categories: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCard(id: string, data: UpdateCardDto) {
    const updateData: Prisma.CardUpdateInput = {};

    if (data.rarity) {
      updateData.rarity = data.rarity;
    }

    if (data.categories) {
      updateData.categories = {
        set: data.categories.map((key) => ({ key })),
      };
    }

    if (data.powerUpAction !== undefined) {
      updateData.powerUpAction = data.powerUpAction;
    }

    if (data.powerUpValue !== undefined) {
      updateData.powerUpValue = data.powerUpValue;
    }

    return this.prisma.card.update({
      where: { id },
      data: updateData,
      include: {
        categories: true,
      },
    });
  }
}