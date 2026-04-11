import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ward } from '../administrative_unit/entities/wards.entity';
import { Province } from '../administrative_unit/entities/province.entity';
import { Incident } from '../incidents/entities/incident.entity';
import { SearchIncidentDto } from '../incidents/dto/search-incident.dto';
import { WithinPolygonQueryDto } from './dto/within-polygon.query';
import { applyIncidentFilters } from 'src/common/query-builders/incident-query.builder';
import {
  SELECT_PROVINCE_FEATURE,
  SELECT_SINGLE_WARD_FEATURE,
  SELECT_ALL_WARDS_COLLECTION,
} from './queries/administrative-geojson.query';
import { SELECT_REVERSE_GEOCODE } from './queries/gis-spatial.query';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { buildIncidentExtentQuery } from './queries/gis-incident-extend.query';
import {
  toIncidentFeatureCollection,
  toIncidentFeature,
} from './mappers/incident-geojson.mapper';
import { ReverseGeocodeQueryDto } from './dto/reverse-geocode-query.dto';
@Injectable()
export class GisService {
  constructor(
    @InjectRepository(Ward) private readonly wardsRepository: Repository<Ward>,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
  ) {}

  // Lay geojson cua tinh
  async getProvinceGeoJson(): Promise<Feature<Geometry> | null> {
    const rows: { feature: Feature<Geometry> }[] =
      await this.provinceRepository.query(SELECT_PROVINCE_FEATURE);

    return rows[0]?.feature ?? null;
  }

  // Lay geojson cua cac xa trong tinh
  async getAllWardsGeoJson(): Promise<FeatureCollection | null> {
    const rows: { geojson: FeatureCollection }[] =
      await this.wardsRepository.query(SELECT_ALL_WARDS_COLLECTION);

    return rows[0]?.geojson ?? null;
  }
  // Lay geojson cua mot xa, duoc xac dinh boi ma_xa
  async getWardGeoJson(ma_xa: string): Promise<Feature<Geometry> | null> {
    const rows: { feature: Feature<Geometry> }[] =
      await this.wardsRepository.query(SELECT_SINGLE_WARD_FEATURE, [ma_xa]);

    return rows[0]?.feature ?? null;
  }

  // Lay danh sach cac su co lien quan den mot xa, duoc xac dinh boi ma_xa, va co the loc theo thoi gian, loai su co va khu vuc (bbox)
  async getIncidentsByWard(ma_xa: string, query: SearchIncidentDto) {
    const normalizedQuery = {
      ...query,
      ma_xa,
    };
    const qb = this.incidentRepository.createQueryBuilder('incident');
    qb.leftJoinAndSelect('incident.incidentType', 'incidentType');
    qb.leftJoinAndSelect('incident.ward', 'ward');
    qb.where('incident.location IS NOT NULL');
    applyIncidentFilters(qb, normalizedQuery);
    qb.orderBy('incident.incidentTime', 'DESC');
    const incidents = await qb.getMany();
    return toIncidentFeatureCollection(incidents);
  }

  // Lay geojson cua mot su co, duoc xac dinh boi id
  async getIncidentGeoJson(id: string) {
    const incident = await this.incidentRepository.findOne({
      where: { id },
      relations: ['incidentType', 'ward'],
    });
    if (!incident) {
      throw new NotFoundException(`Incident with id ${id} not found`);
    }
    if (!incident.location) {
      throw new NotFoundException(
        `Incident with id ${id} has no GIS location data`,
      );
    }
    return toIncidentFeature(incident);
  }

  // Tra ve danh sach cac su co gan mot diem, duoc xac dinh boi lat/lng va radius, va co the loc theo keyword, loai su co, thoi gian, khu vuc (bbox hoac lat/lng/radius)
  async getIncidentNear(query: SearchIncidentDto) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    qb.leftJoinAndSelect('incident.incidentType', 'incidentType');
    qb.leftJoinAndSelect('incident.ward', 'ward');
    qb.where('incident.location IS NOT NULL');

    applyIncidentFilters(qb, query);
    qb.setParameters({
      lat: query.lat,
      lng: query.lng,
    });
    qb.orderBy(
      'ST_Distance(incident.location::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography)',
      'ASC',
    );

    const incidents = await qb.getMany();
    return toIncidentFeatureCollection(incidents);
  }

  async getIncidentExtent(query: SearchIncidentDto) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    qb.select('incident.location', 'location');
    qb.where('incident.location IS NOT NULL');

    applyIncidentFilters(qb, query);

    const [sql, params] = qb.getQueryAndParameters();

    const rows: {
      minLng: number | null;
      minLat: number | null;
      maxLng: number | null;
      maxLat: number | null;
      count: number;
    }[] = await this.incidentRepository.query(
      buildIncidentExtentQuery(sql),
      params,
    );
    const row = rows[0];
    if (!row || row.minLng == null) {
      return null;
    }
    return {
      bbox: {
        minLng: row.minLng,
        minLat: row.minLat,
        maxLng: row.maxLng,
        maxLat: row.maxLat,
      },
      count: Number(row.count),
    };
  }
  async getIncidentsWithinPolygon(body: WithinPolygonQueryDto) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    qb.leftJoinAndSelect('incident.incidentType', 'incidentType');
    qb.leftJoinAndSelect('incident.ward', 'ward');
    qb.where('incident.location IS NOT NULL');

    applyIncidentFilters(qb, {
      polygon: body.polygon,
      fromDate: body.fromDate,
      toDate: body.toDate,
      incidentTypeCode: body.incidentTypeCode,
    });
    qb.orderBy('incident.incidentTime', 'DESC');

    const incidents = await qb.getMany();
    return toIncidentFeatureCollection(incidents);
  }
  // Cac chuc nang phan tich
  // 1. Tra ve dia chi gan nhat voi mot diem, duoc xac dinh boi lat/lng
  async reverseGeocode(query: ReverseGeocodeQueryDto) {
    const rows: {
      ma_xa: string;
      ten_xa: string;
      ma_tinh: string;
      ten_tinh: string;
    }[] = await this.wardsRepository.query(SELECT_REVERSE_GEOCODE, [
      query.lng,
      query.lat,
    ]);
    const row = rows[0];
    if (!row) {
      return {
        point: { lng: query.lng, lat: query.lat },
        ward: null,
        province: null,
      };
    }
    return {
      point: { lng: query.lng, lat: query.lat },
      ward: { code: row.ma_xa, name: row.ten_xa },
      province: { code: row.ma_tinh, name: row.ten_tinh },
    };
  }
}
