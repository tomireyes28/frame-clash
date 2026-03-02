
import { IsInt, IsString, IsNotEmpty, IsEnum, } from 'class-validator';

export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

export class CreateCardDto {
  @IsInt()
  @IsNotEmpty()
  tmdbId!: number;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  posterPath!: string;

  @IsString()
  @IsNotEmpty()
  releaseDate!: string;

  @IsEnum(Rarity)
  @IsNotEmpty()
  rarity!: Rarity;
}