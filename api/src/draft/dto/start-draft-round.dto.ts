// api/src/draft/dto/start-draft-round.dto.ts
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class StartDraftRoundDto {
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @IsInt()
  @Min(1)
  @Max(3)
  roundNumber!: number;
}
