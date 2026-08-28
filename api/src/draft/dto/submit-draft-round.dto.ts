// api/src/draft/dto/submit-draft-round.dto.ts
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AnswerLogDto } from '../../game/dto/submit-game.dto';

export class SubmitDraftRoundDto {
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @IsInt()
  @Min(1)
  @Max(3)
  roundNumber!: number;

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
