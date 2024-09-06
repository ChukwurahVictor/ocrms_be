import { IsOptional, IsString } from 'class-validator';
import { PaginationSearchOptionsDto } from 'src/interfaces/pagination-search-options.dto';

export class FetchComplaintsDto extends PaginationSearchOptionsDto {
  @IsOptional()
  @IsString()
  reference?: string;
}
