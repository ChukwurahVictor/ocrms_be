import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAdminDto {
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
}
