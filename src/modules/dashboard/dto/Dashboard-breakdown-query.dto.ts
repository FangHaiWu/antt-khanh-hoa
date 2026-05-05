import { IsIn, IsOptional, IsString } from 'class-validator';

export type DashboardBreakdownGroupBy =
  | 'incidentTypeCode'
  | 'incidentCategoryCode'
  | 'incidentSubtypeCode'
  | 'ma_xa';

export class DashboardBreakdownQueryDto {
  @IsOptional()
  @IsString()
  keyword?: string;

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

  // Dùng để so sánh với khoảng thời gian trước đó
  @IsOptional()
  @IsString()
  currentFromDate?: string;

  @IsOptional()
  @IsString()
  currentToDate?: string;

  @IsOptional()
  @IsString()
  compareFromDate?: string;

  @IsOptional()
  @IsString()
  compareToDate?: string;

  @IsOptional()
  @IsIn([
    'incidentTypeCode',
    'incidentCategoryCode',
    'incidentSubtypeCode',
    'ma_xa',
  ])
  groupBy?: DashboardBreakdownGroupBy;

  @IsOptional()
  @IsIn([
    'incidentTypeCode',
    'incidentCategoryCode',
    'incidentSubtypeCode',
    'ma_xa',
  ])
  groupByField?: DashboardBreakdownGroupBy;
}
