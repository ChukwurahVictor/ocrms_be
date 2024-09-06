import { Rating } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddFeedbackDto {
  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsEnum(Rating)
  @IsOptional()
  rating?: Rating;
}
