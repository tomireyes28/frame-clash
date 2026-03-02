// api/src/cards/cards.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { Card } from '@prisma/client';

@Controller('admin/cards')
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
}