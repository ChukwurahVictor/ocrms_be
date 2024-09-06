import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateStaffDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsUUID()
  @IsNotEmpty()
  departmentId: string;
}
