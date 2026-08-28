// api/src/draft/dto/pick-draft-card.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class PickDraftCardDto {
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @IsString()
  @IsNotEmpty()
  cardId!: string;
}
