import { ComplaintStatus, PriorityLevel } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateComplaintDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsEnum(ComplaintStatus)
  @IsOptional()
  status?: any;

  @IsEnum(PriorityLevel)
  @IsOptional()
  priorityLevel?: any;
}
