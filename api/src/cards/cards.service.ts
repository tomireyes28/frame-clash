import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { Prisma, Rarity } from '@prisma/client';
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
        posterPath: data.posterPath || null, // Guardamos null si no hay póster
        year: data.year, // Ya viene parseado como número desde el frontend
        rarity: data.rarity as Rarity, 
        
        // 🔥 MAGIA DE PRISMA: Conectamos la carta con las categorías existentes
        categories: {
          connect: data.categories.map((key) => ({ key })),
        },
      },
      // Le decimos a Prisma que nos devuelva la carta con las categorías incluidas
      include: {
        categories: true, 
      }
    });
  }

  async findAll() {
    // Al traer todas las cartas para las estadísticas, incluimos sus categorías
    return this.prisma.card.findMany({
      include: {
        categories: true,
      }
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

    // Actualizamos en la base de datos
    return this.prisma.card.update({
      where: { id },
      data: updateData, // 👈 Ahora TypeScript sabe perfectamente que esto es seguro
      include: {
        categories: true, 
      },
    });
  }
}