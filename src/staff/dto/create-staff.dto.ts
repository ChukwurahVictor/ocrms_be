import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateStaffDto {
  @IsEmail()
  @Transform(({ value }) => value && value.trim().toLowerCase())
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsUUID()
  @IsNotEmpty()
  departmentId: string;
}
