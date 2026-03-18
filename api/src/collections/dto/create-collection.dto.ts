// src/collections/dto/create-collection.dto.ts
import { IsString, IsArray, IsEnum, IsOptional, ArrayNotEmpty } from 'class-validator';
import { RewardType } from '@prisma/client';

export class CreateCollectionDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(RewardType)
  rewardType!: RewardType;

  @IsString()
  rewardValue!: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty({ message: 'La colección debe tener al menos una carta.' })
  cardIds!: string[]; // Los IDs de las cartas que tildes en el panel
}