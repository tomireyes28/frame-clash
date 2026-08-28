// api/src/roguelite/dto/start-run.dto.ts
import { IsArray, IsOptional, IsString } from 'class-validator';

export class StartRunDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equippedCardIds?: string[];
}
