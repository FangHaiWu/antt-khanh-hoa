import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ward } from './entities/wards.entity';
import { Province } from './entities/province.entity';
import {
  WardGeoJsonFeature,
  WardGeoJsonFeatureCollection,
} from './types/ward-geojson.type';

import {
  SELECT_SINGLE_WARD_FEATURE,
  SELECT_ALL_WARDS_COLLECTION,
} from '../gis/queries/administrative-geojson.query';

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
      SELECT_SINGLE_WARD_FEATURE,
      [ma_xa],
    );
    return rows[0]?.feature ?? null;
  }

  async findAll(): Promise<WardGeoJsonFeatureCollection | null> {
    const rows: FindAllRow[] = await this.wardsRepository.query(
      SELECT_ALL_WARDS_COLLECTION,
    );
    return rows[0]?.geojson ?? null;
  }
}
