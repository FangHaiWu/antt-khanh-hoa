import { IsOptional, IsString } from 'class-validator';

export class BboxQueryDto {
  @IsString()
  @IsOptional()
  bbox?: string;
}
