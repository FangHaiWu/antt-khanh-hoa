import { IsOptional, IsString } from 'class-validator';
import { SearchIncidentDto } from './search-incident.dto';

export class ExportIncidentQueryDto extends SearchIncidentDto {
  @IsOptional()
  @IsString()
  format?: 'csv' | 'json' | 'geojson';
}
