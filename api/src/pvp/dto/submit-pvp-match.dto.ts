// api/src/pvp/dto/submit-pvp-match.dto.ts
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AnswerLogDto } from '../../game/dto/submit-game.dto';

export class SubmitPvpMatchDto {
  @IsString()
  @IsNotEmpty()
  matchId!: string;

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
