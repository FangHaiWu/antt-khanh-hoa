import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ward } from './entities/wards.entity';
import { Province } from './entities/province.entity';
import {
  WardGeoJsonFeature,
  WardGeoJsonFeatureCollection,
} from './types/ward-geojson.type';

type FindOneRow = { feature: WardGeoJsonFeature };
type FindAllRow = { geojson: WardGeoJsonFeatureCollection };
@Injectable()
export class AdministrativeUnitService {
  constructor(
    @InjectRepository(Ward) private readonly wardsRepository: Repository<Ward>,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
  ) {}

  async findOne(ma_xa: string): Promise<WardGeoJsonFeature | null> {
    const rows: FindOneRow[] = await this.wardsRepository.query(
      `
      SELECT jsonb_build_object(
        'type', 'Feature',
        'geometry', ST_AsGeoJSON(geom)::jsonb,
        'properties', to_jsonb(w) - 'geom' - 'boundary' - 'center') AS feature
      FROM wards w
      WHERE w.ma_xa = $1
      `,
      [ma_xa],
    );
    return rows[0]?.feature ?? null;
  }

  async findAll(): Promise<WardGeoJsonFeatureCollection | null> {
    const rows: FindAllRow[] = await this.wardsRepository.query(
      `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::jsonb,
            'properties', to_jsonb(w) - 'geom' - 'boundary' - 'center'
          )
        ), '[]'::jsonb)
      ) AS  geojson
      FROM wards w
      `,
    );
    return rows[0]?.geojson ?? null;
  }
}
