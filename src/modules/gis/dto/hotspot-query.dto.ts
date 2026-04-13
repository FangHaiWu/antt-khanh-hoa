import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class HotspotQueryDto {
  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsString()
  incidentTypeCode?: string;

  @IsOptional()
  @IsString()
  incidentCategoryCode?: string;

  @IsOptional()
  @IsString()
  incidentSubtypeCode?: string;

  @IsOptional()
  @IsString()
  ma_xa?: string;

  @IsOptional()
  @IsString()
  bbox?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 5000;
}
