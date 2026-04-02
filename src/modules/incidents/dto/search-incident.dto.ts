import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt } from 'class-validator';

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
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  radius?: number; // in meters

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bbox?: string; // format: "minLng,minLat,maxLng,maxLat"

  @IsOptional()
  polygon?: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][]; // GeoJSON format
  };

  @IsOptional()
  @IsString()
  intersectWard?: string; // ma_xa of the ward to intersect with
}
