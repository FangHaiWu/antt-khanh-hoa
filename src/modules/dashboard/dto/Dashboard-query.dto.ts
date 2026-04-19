import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
export class DashboardQueryDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsString()
  ma_xa?: string;

  @IsOptional()
  @IsString()
  incidentCategoryCode?: string;

  @IsOptional()
  @IsString()
  incidentTypeCode?: string;

  @IsOptional()
  @IsString()
  incidentSubtypeCode?: string;

  @IsOptional()
  @IsString()
  groupByTime?: 'day' | 'week' | 'month' | 'year';

  @IsOptional()
  @IsString()
  groupByField?:
    | 'incidentTypeCode'
    | 'incidentCategoryCode'
    | 'incidentSubtypeCode'
    | 'ma_xa';

  @IsOptional()
  @IsString()
  bbox?: string;

  @IsOptional()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  radius?: number;
}
