import { IsString, IsInt, IsArray, ValidateNested, Min, IsNotEmpty, IsOptional } from 'class-validator';
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
  userId!: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsInt()
  @Min(0)
  claimedScore!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerLogDto)
  auditLog!: AnswerLogDto[];

  // NUEVO: Array con los IDs de los poderes que usó en la partida
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  usedPowerUps?: string[];
}