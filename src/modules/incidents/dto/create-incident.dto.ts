import {
  IsString,
  Length,
  IsDateString,
  IsOptional,
  IsUrl,
  IsInt,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { SourceType } from '../enums/source-type.enum';

export class CreateIncidentDto {
  @Length(1, 255)
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  incidentTime?: Date;

  @IsString()
  incidentLocation: string;

  @IsEnum(SourceType)
  sourceType: SourceType;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @IsInt()
  incidentTypeId: number;

  @IsString()
  ma_xa: string;

  @IsOptional()
  @IsString()
  incidentSubtypeCode?: string;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsNumber()
  lat?: number;
}
