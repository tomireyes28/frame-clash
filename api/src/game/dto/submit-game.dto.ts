// api/src/game/dto/submit-game.dto.ts
import { IsString, IsInt, IsArray, ValidateNested, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

// 1. Validamos cada "renglón" del log de respuestas
export class AnswerLogDto {
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @IsString()
  @IsNotEmpty()
  selectedAnswer!: string;

  @IsInt()
  @Min(0) // El tiempo no puede ser negativo
  timeSpentMs!: number;
}

// 2. Validamos el paquete completo que llega del frontend
export class SubmitGameDto {
  @IsString()
  @IsNotEmpty()
  userId!: string; // Por ahora lo pedimos así, luego lo sacaremos del Token seguro de NextAuth

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsInt()
  @Min(0)
  claimedScore!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerLogDto) // Le avisa a NestJS que valide el array usando la clase de arriba
  auditLog!: AnswerLogDto[];
}