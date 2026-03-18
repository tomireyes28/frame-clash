// src/shop/dto/buy-pack.dto.ts
import { IsString, IsIn } from 'class-validator';
import { PACK_CONFIGS } from '../../common/constants/packs.config';

export class BuyPackDto {
  @IsString()
  @IsIn(Object.keys(PACK_CONFIGS), {
    message: 'El tipo de sobre no existe en el Mercado Negro.'
  })
  packId!: string;
}