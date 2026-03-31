import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { FeatureCollection, MultiPolygon, Polygon } from 'geojson';

interface WardProperties {
  ten_xa: string;
  ma_xa: string;
  loai: string;
  [key: string]: any;
}

export async function seedAdministrativeUnits(dataSource: DataSource) {
  const filePath = path.join(__dirname, 'data/khanh=hoa-wards.geojson');

  const raw = fs.readFileSync(filePath, 'utf-8');
  const geojson = JSON.parse(raw) as FeatureCollection<
    MultiPolygon | Polygon,
    WardProperties
  >;

  for (const feature of geojson.features) {
    const props = feature.properties;
    const geometry = JSON.stringify(feature.geometry);

    await dataSource.query(
      `
      INSERT INTO administrative_units (
        id, name, code, unit_type, level, geom
      )
      VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        'ward',
        ST_SetSRID(ST_GeomFromGeoJSON($4), 4326)
      )
      `,
      [props.ten_xa, props.ma_xa, props.loai, geometry],
    );
  }

  console.log('Seed admin units DONE');
}
