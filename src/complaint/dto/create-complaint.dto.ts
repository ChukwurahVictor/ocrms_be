import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  // IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  // IsAtLeastOneFileUploaded,
} from 'class-validator';

export class CreateComplaintDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsUUID()
  categoryId: string;

  // @ApiPropertyOptional({
  //   type: 'array',
  //   items: { type: 'string', format: 'binary' },
  // })
  // @IsArray()
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  image?: Express.Multer.File;
  // image?: Express.Multer.File[];
}
