import { Controller, Post, Body, Get, UseGuards, Patch, Param } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto'; // 👈 Importamos el nuevo DTO
import { Card } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin/cards')
@UseGuards(JwtAuthGuard, AdminGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  async createCard(@Body() createCardDto: CreateCardDto): Promise<Card> {
    return this.cardsService.createCard(createCardDto);
  }

  @Get()
  async findAll(): Promise<Card[]> {
    return this.cardsService.findAll();
  }

  @Patch(':id')
  async updateCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
  ): Promise<Card> {
    return this.cardsService.updateCard(id, updateCardDto);
  }
}