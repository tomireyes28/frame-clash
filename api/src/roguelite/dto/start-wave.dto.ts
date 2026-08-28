// api/src/roguelite/dto/start-wave.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class StartWaveDto {
  @IsString()
  @IsNotEmpty()
  runId!: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;
}
