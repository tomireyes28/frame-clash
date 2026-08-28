// api/src/cards/dto/update-card.dto.ts
import { IsEnum, IsArray, IsString, IsOptional, IsInt } from 'class-validator';
import { Rarity, ActionType } from '@prisma/client';

export class UpdateCardDto {
  @IsOptional()
  @IsEnum(Rarity)
  rarity?: Rarity;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsEnum(ActionType)
  powerUpAction?: ActionType;

  @IsOptional()
  @IsInt()
  powerUpValue?: number;
}