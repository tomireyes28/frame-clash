// api/src/roguelite/dto/submit-wave.dto.ts
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AnswerLogDto } from '../../game/dto/submit-game.dto';

export class SubmitWaveDto {
  @IsString()
  @IsNotEmpty()
  runId!: string;

  @IsInt()
  @Min(0)
  claimedScore!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerLogDto)
  auditLog!: AnswerLogDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  usedPowerUps?: string[];
}
