import { IsInt, IsString, IsNotEmpty, IsEnum, IsArray, IsOptional } from 'class-validator';

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

  @IsOptional() // Lo hacemos opcional por si TMDB no tiene póster
  @IsString()
  posterPath?: string;

  @IsInt() // Cambiamos releaseDate por year (como lo manda el frontend)
  @IsNotEmpty()
  year!: number;

  @IsEnum(Rarity)
  @IsNotEmpty()
  rarity!: Rarity;

  // 🔥 NUEVO: Validamos el array de categorías
  @IsArray()
  @IsString({ each: true }) // Cada elemento del array debe ser un string
  @IsNotEmpty()
  categories!: string[]; 
}