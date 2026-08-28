// api/src/questions/questions.controller.ts
import { Controller, Get, Post, Param, Query, ParseIntPipe } from '@nestjs/common';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get('test-generator')
  async testGenerator() {
    return this.questionsService.generateTestQuestions();
  }

  @Post('movie/:tmdbId')
  async generateForMovie(
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
    @Query('categories') categories?: string,
  ) {
    const extraCategories = categories ? categories.split(',') : [];
    return this.questionsService.generateQuestionsForMovie(tmdbId, extraCategories);
  }

  @Post('category/:categoryKey')
  async generateForCategory(
    @Param('categoryKey') categoryKey: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.questionsService.generateQuestionsForCategory(categoryKey, limitNum);
  }
}