import type { Feature, FeatureCollection, MultiPolygon } from 'geojson';

export interface WardGeoJsonProperties {
  ma_xa: string;
  ten_xa: string | null;
  cap: number | null;
  loai: string | null;
  dtich_km2: number;
  dan_so: number;
  matdo_km2: number;
  ma_tinh: string;
  metadata: Record<string, unknown> | null;
}

export type WardGeoJsonFeature = Feature<MultiPolygon, WardGeoJsonProperties>;

export type WardGeoJsonFeatureCollection = FeatureCollection<
  MultiPolygon,
  WardGeoJsonProperties
>;
