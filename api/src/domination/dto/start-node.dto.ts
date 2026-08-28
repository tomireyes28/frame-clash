// api/src/domination/dto/start-node.dto.ts
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class StartNodeDto {
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsInt()
  @Min(1)
  @Max(10)
  nodeNumber!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equippedCardIds?: string[];
}
