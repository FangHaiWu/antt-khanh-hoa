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
import { HotspotQueryDto } from './dto/hotspot-query.dto';
import { toFeature, toFeatureCollection } from './utils/geojson-response.util';
import { GisLayerDefinition } from './types/gis-layer.type';
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

  // Heatmap, tra ve FeatureCollection chua cac su co, co the loc theo keyword, loai su co, thoi gian, khu vuc (bbox hoac lat/lng/radius), va co the gioi han so luong su co tra ve
  async getIncidentHeatmap(query: HotspotQueryDto) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    qb.where('incident.location IS NOT NULL');

    applyIncidentFilters(qb, query);
    qb.orderBy('incident.incidentTime', 'DESC');

    if (query.limit) {
      qb.take(query.limit);
    }
    const incidents = await qb.getMany();
    return toIncidentFeatureCollection(incidents);
  }

  // Hotspot
  async getIncidentHotspots(query: HotspotQueryDto) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    qb.where('incident.location IS NOT NULL');

    applyIncidentFilters(qb, query);
    const hotspotsRows: {
      ma_xa: string;
      ten_xa: string;
      incident_count: number;
    }[] = await qb
      .select('incident.ma_xa', 'ma_xa')
      .addSelect('COUNT(*)', 'incident_count')
      .groupBy('incident.ma_xa')
      .getRawMany();
    if (!hotspotsRows.length) {
      return {
        type: 'FeatureCollection',
        feature: [],
      };
    }
    const wardCodes = hotspotsRows.map((row) => row.ma_xa);

    const wards = await this.wardsRepository.find({
      where: wardCodes.map((ma_xa) => ({ ma_xa })),
    });

    const countMap = new Map(
      hotspotsRows.map((row) => [row.ma_xa, Number(row.incident_count)]),
    );

    const features = wards.map((ward) =>
      toFeature(
        ward.boundary,
        {
          ma_xa: ward.ma_xa,
          ten_xa: ward.ten_xa,
          loai: ward.loai,
          dtich_km2: ward.dtich_km2,
          dan_so: ward.dan_so,
          matdo_km2: ward.matdo_km2,
          ma_tinh: ward.ma_tinh,
          incident_count: countMap.get(ward.ma_xa) || 0,
        },
        ward.ma_xa,
      ),
    );
    return toFeatureCollection(features);
  }

  getGisLayers(): GisLayerDefinition[] {
    return [
      {
        id: 'province',
        name: 'Tỉnh Khánh Hòa',
        type: 'polygon',
        endpoint: '/gis/province',
        visibleByDefault: true,
        supportsBBox: false,
        supportsTimeFilter: false,
      },
      {
        id: 'wards',
        name: 'Địa giới xã/phường',
        type: 'polygon',
        endpoint: '/gis/wards',
        visibleByDefault: true,
        supportsBBox: false,
        supportsTimeFilter: false,
      },
      {
        id: 'incidents',
        name: 'Vụ việc',
        type: 'point',
        endpoint: '/gis/incidents',
        visibleByDefault: true,
        supportsBBox: true,
        supportsTimeFilter: true,
      },
      {
        id: 'heatmap',
        name: 'Bản đồ nhiệt',
        type: 'heatmap',
        endpoint: '/gis/incidents/heatmap',
        visibleByDefault: false,
        supportsBBox: true,
        supportsTimeFilter: true,
      },
      {
        id: 'hotspots',
        name: 'Điểm nóng',
        type: 'polygon',
        endpoint: '/gis/incidents/hotspots',
        visibleByDefault: false,
        supportsBBox: true,
        supportsTimeFilter: true,
      },
      {
        id: 'cluster',
        name: 'Cụm vụ việc',
        type: 'cluster',
        endpoint: '/gis/incidents/near',
        visibleByDefault: false,
        supportsBBox: true,
        supportsTimeFilter: true,
      },
    ];
  }

  getIncidentMetadata() {
    return {
      id: 'incident',
      name: 'Vụ việc ANTT',
      geometryType: 'Point',
      crs: 'EPSG:4326',
      timeField: 'incidentTime',
      primaryKey: 'id',
      filter: [
        'keyword',
        'title',
        'description',
        'incidentTypeCode',
        'incidentSubtypeCode',
        'incidentCategoryCode',
        'ma_xa',
        'fromDate',
        'toDate',
        'bbox',
        'lat',
        'lng',
        'radius',
        'polygon',
        'intersectsWard',
      ],
      fields: [
        { name: 'id', type: 'uuid', label: 'Mã vụ việc' },
        { name: 'title', type: 'string', label: 'Tiêu đề' },
        { name: 'description', type: 'string', label: 'Mô tả' },
        { name: 'incidentTypeCode', type: 'string', label: 'Mã loại vụ việc' },
        {
          name: 'incidentSubtypeCode',
          type: 'string',
          label: 'Mã phân loại vụ việc',
        },
        {
          name: 'incidentCategoryCode',
          type: 'string',
          label: 'Mã nhóm loại vụ việc',
        },
        { name: 'ma_xa', type: 'string', label: 'Mã xã/phường' },
        {
          name: 'incidentTime',
          type: 'datetime',
          label: 'Thời gian xảy ra vụ việc',
        },
        { name: 'sourceType', type: 'string', label: 'Loại nguồn thông tin' },
        { name: 'sourceUrl', type: 'string', label: 'URL nguồn thông tin' },
      ],
    };
  }
}
