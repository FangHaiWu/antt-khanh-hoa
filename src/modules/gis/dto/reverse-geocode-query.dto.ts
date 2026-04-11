import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

// @Type duoc su dung de chuyen doi du lieu tu string thanh number khi nhan du lieu tu query parameters, va @IsNumber de validate rang gia tri sau khi chuyen doi la mot so
export class ReverseGeocodeQueryDto {
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @Type(() => Number)
  @IsNumber()
  lng?: number;
}
