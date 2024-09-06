import { IsNotEmpty, IsString } from 'class-validator';

export class AssignComplaintDto {
  @IsString()
  @IsNotEmpty()
  departmentId: string;
}
