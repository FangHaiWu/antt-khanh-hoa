import {
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
  IsEnum,
  IsInt,
  IsUrl,
} from 'class-validator';
import { SourceType } from '../enums/source-type.enum';
export class UpdateIncidentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

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
  incidentLocation?: string;

  @IsOptional()
  @IsEnum(SourceType)
  sourceType?: SourceType;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @IsOptional()
  @IsDateString()
  incidentTime?: Date;

  @IsOptional()
  @IsNumber()
  lat?: number | null;

  @IsOptional()
  @IsNumber()
  lng?: number | null;

  @IsOptional()
  @IsInt()
  incidentTypeId?: number;

  @IsOptional()
  @IsString()
  ma_xa?: string;
}
