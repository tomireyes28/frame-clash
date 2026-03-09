import { IsEnum, IsArray, IsString, IsOptional } from 'class-validator';
import { Rarity } from '@prisma/client';

export class UpdateCardDto {
  @IsOptional()
  @IsEnum(Rarity)
  rarity?: Rarity;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];
}