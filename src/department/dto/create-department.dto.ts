import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty({ message: 'name is required.' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
