import { IsOptional, IsString, IsIn } from 'class-validator';

export class StatsQueryDto {
  @IsOptional()
  @IsString()
  keyword?: string;

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
  ma_xa?: string;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsIn(['day', 'week', 'month', 'year'])
  groupByTime?: 'day' | 'week' | 'month' | 'year';

  @IsOptional()
  @IsIn([
    'incidentTypeCode',
    'incidentCategoryCode',
    'incidentSubtypeCode',
    'ma_xa',
  ])
  groupBy?: string;
}
