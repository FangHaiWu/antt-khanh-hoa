import { IsIn, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
export class DashboardQueryDto {
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
  @IsIn(['day', 'week', 'month', 'year'])
  groupByTime?: 'day' | 'week' | 'month' | 'year';

  @IsOptional()
  @IsIn([
    'incidentTypeCode',
    'incidentCategoryCode',
    'incidentSubtypeCode',
    'ma_xa',
  ])
  groupByField?:
    | 'incidentTypeCode'
    | 'incidentCategoryCode'
    | 'incidentSubtypeCode'
    | 'ma_xa';

  // Dùng cho phân trang kết quả nếu cần thiết

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  // Dùng để lọc theo vị trí địa lý (bbox hoặc lat/lng/radius)

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

  @IsOptional()
  polygon?: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };

  @IsOptional()
  @IsString()
  intersectWard?: string;
}
