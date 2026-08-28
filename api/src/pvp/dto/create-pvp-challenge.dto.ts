// api/src/pvp/dto/create-pvp-challenge.dto.ts
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreatePvpChallengeDto {
  @IsOptional()
  @IsString()
  categoryKey?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equippedCardIds?: string[];
}
