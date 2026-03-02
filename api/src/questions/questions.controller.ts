// api/src/questions/questions.controller.ts
import { Controller, Get } from '@nestjs/common';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get('test-generator')
  async testGenerator() {
    return this.questionsService.generateTestQuestions();
  }
}