// api/src/cards/dto/create-card.dto.ts
import { IsInt, IsString, IsNotEmpty, IsEnum, IsArray, IsOptional } from 'class-validator';
import { Rarity } from '@prisma/client';

export class CreateCardDto {
  @IsInt()
  @IsNotEmpty()
  tmdbId!: number;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  posterPath?: string;

  @IsInt()
  @IsNotEmpty()
  year!: number;

  @IsEnum(Rarity)
  @IsNotEmpty()
  rarity!: Rarity;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  categories!: string[];

  @IsOptional()
  @IsString()
  powerUpAction?: string;

  @IsOptional()
  @IsInt()
  powerUpValue?: number;
}