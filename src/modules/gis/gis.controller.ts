import { Controller, Get, Param, Post, Query, Body } from '@nestjs/common';
import { GisService } from './gis.service';
import { SearchIncidentDto } from '../incidents/dto/search-incident.dto';
import { ReverseGeocodeQueryDto } from './dto/reverse-geocode-query.dto';
import { WithinPolygonQueryDto } from './dto/within-polygon.query';

@Controller('gis')
export class GisController {
  constructor(private readonly gisService: GisService) {}

  // Các endpoint của controller này cho phép người dùng truy cập dữ liệu GIS dưới dạng GeoJSON, bao gồm thông tin về các tỉnh, xã và các sự cố liên quan đến các xã đó. Các endpoint này sử dụng các phương thức HTTP GET để lấy dữ liệu từ service và trả về cho client.
  // Tra ve geojson cua tinh Khanh Hoa
  @Get('province')
  async getProvinceGeoJson() {
    return this.gisService.getProvinceGeoJson();
  }

  // Tra ve geojson cua tat ca cac xa trong tinh Khanh Hoa
  @Get('/wards')
  async getAllWardsGeoJson() {
    return this.gisService.getAllWardsGeoJson();
  }

  // Tra ve geojson cua mot xa, duoc xac dinh boi ma_xa
  @Get('wards/:ma_xa')
  async getWardGeoJson(@Param('ma_xa') ma_xa: string) {
    return this.gisService.getWardGeoJson(ma_xa);
  }

  // Tra ve danh sach cac su co lien quan den mot xa, duoc xac dinh boi ma_xa, va co the loc theo thoi gian, loai su co va khu vuc (bbox)
  @Get('wards/:ma_xa/incidents')
  async getIncidentsByWard(
    @Param('ma_xa') ma_xa: string,
    @Query() query: SearchIncidentDto,
  ) {
    return this.gisService.getIncidentsByWard(ma_xa, query);
  }

  // Tra ve extent (bounding box) chua tat ca cac su co, co the loc theo keyword, loai su co, thoi gian, khu vuc (bbox hoac lat/lng/radius)
  @Get('incidents/extent')
  async getIncidentExtent(@Query() query: SearchIncidentDto) {
    return this.gisService.getIncidentExtent(query);
  }

  // Tra ve danh sach cac su co gan mot diem, duoc xac dinh boi lat/lng va radius, va co the loc theo keyword, loai su co, thoi gian, khu vuc (bbox hoac lat/lng/radius)
  @Get('incidents/near')
  async getIncidentNear(@Query() query: SearchIncidentDto) {
    return this.gisService.getIncidentNear(query);
  }

  // Tra ve danh sach cac su co nam trong mot polygon, duoc xac dinh boi mot array cac diem (lat/lng), va co the loc theo keyword, loai su co, thoi gian, khu vuc (bbox hoac lat/lng/radius)
  @Post('incidents/within-polygon')
  async getIncidentsWithinPolygon(@Body() query: WithinPolygonQueryDto) {
    return this.gisService.getIncidentsWithinPolygon(query);
  }

  // Tra ve geojson cua mot su co, duoc xac dinh boi id
  @Get('incidents/:id')
  async getIncidentGeoJson(@Param('id') id: string) {
    return this.gisService.getIncidentGeoJson(id);
  }
  // Tra ve dia chi gan nhat voi mot diem, duoc xac dinh boi lat/lng
  @Get('reverse-geocode')
  async reverseGeocode(@Query() query: ReverseGeocodeQueryDto) {
    return this.gisService.reverseGeocode(query);
  }
}
