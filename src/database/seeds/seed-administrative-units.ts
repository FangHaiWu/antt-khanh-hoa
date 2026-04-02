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
  const filePath = path.join(__dirname, 'data/khanh_hoa_wards.geojson');

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
  INSERT INTO wards (
    ma_xa, ten_xa, loai, cap, dtich_km2, dan_so, matdo_km2, ma_tinh, geom, center, metadata
  )
  VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8,
    ST_SetSRID(ST_GeomFromGeoJSON($9), 4326),
    ST_PointOnSurface(ST_SetSRID(ST_GeomFromGeoJSON($9), 4326)),
    $10
  )
  ON CONFLICT (ma_xa) DO UPDATE SET
    ten_xa = EXCLUDED.ten_xa,
    loai = EXCLUDED.loai,
    cap = EXCLUDED.cap,
    dtich_km2 = EXCLUDED.dtich_km2,
    dan_so = EXCLUDED.dan_so,
    matdo_km2 = EXCLUDED.matdo_km2,
    ma_tinh = EXCLUDED.ma_tinh,
    geom = EXCLUDED.geom,
    center = EXCLUDED.center,
    metadata = EXCLUDED.metadata
  `,
      [
        props.ma_xa,
        props.ten_xa,
        props.loai ?? null,
        props.cap ?? null,
        props.dtich_km2 ?? 0,
        props.dan_so ?? 0,
        props.matdo_km2 ?? 0,
        props.ma_tinh,
        geometry,
        JSON.stringify(props),
      ],
    );
  }

  console.log('Seed admin units DONE');
}
