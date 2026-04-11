import { IsOptional, IsString } from 'class-validator';

export class WithinPolygonQueryDto {
  polygon: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsString()
  bbox?: string;

  @IsOptional()
  @IsString()
  incidentTypeCode?: string;
}
