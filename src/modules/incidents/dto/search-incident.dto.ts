import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsNumber } from 'class-validator';

export class SearchIncidentDto {
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
  @IsString()
  sourceType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;

  // Properties for GIS
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radius?: number; // in meters

  @IsOptional()
  @IsString()
  bbox?: string; // format: "minLng,minLat,maxLng,maxLat"

  @IsOptional()
  polygon?: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][]; // GeoJSON format
  };

  @IsOptional()
  @IsString()
  intersectsWard?: string; // ma_xa of the ward to intersect with
}
