// api/src/domination/dto/submit-node.dto.ts
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AnswerLogDto } from '../../game/dto/submit-game.dto';

export class SubmitNodeDto {
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsInt()
  @Min(1)
  @Max(10)
  nodeNumber!: number;

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
