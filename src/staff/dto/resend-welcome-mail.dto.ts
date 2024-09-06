import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendWecomeEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
