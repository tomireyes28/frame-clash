// src/collections/collections.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createCollection(dto: CreateCollectionDto) {
    // 1. Verificamos que no exista otra colección con el mismo nombre
    const existing = await this.prisma.collection.findUnique({
      where: { name: dto.name }
    });

    if (existing) {
      throw new BadRequestException('Ya existe una colección con ese nombre.');
    }

    // 2. Creamos la colección y conectamos las cartas en una sola transacción
    const newCollection = await this.prisma.collection.create({
      data: {
        name: dto.name,
        description: dto.description,
        rewardType: dto.rewardType,
        rewardValue: dto.rewardValue,
        cards: {
          connect: dto.cardIds.map(id => ({ id })) // Magia pura de Prisma
        }
      },
      include: {
        cards: true // Devolvemos las cartas para confirmar que se linkearon bien
      }
    });

    return {
      success: true,
      message: '¡Colección curada creada con éxito!',
      collection: newCollection
    };
  }
}