import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PaginationOptionsDto {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  term?: string;
}
