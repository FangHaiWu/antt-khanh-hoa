import type { Geometry } from 'geojson';

// Hai ham toFeature va toFeatureCollection duoc su dung de chuyen doi du lieu tu database thanh dinh dang GeoJSON, voi toFeature chuyen doi mot geometry va properties thanh mot feature, va toFeatureCollection chuyen doi mot array cac feature thanh mot feature collection
export function toFeature<TProperties>(
  geometry: Geometry | null,
  properties: TProperties,
  id?: string | number,
) {
  return {
    type: 'Feature' as const,
    geometry,
    properties,
    ...(id !== undefined ? { id } : {}),
  };
}

export function toFeatureCollection<TProperties>(
  features: Array<{
    type: 'Feature';
    geometry: Geometry | null;
    properties: TProperties;
    id?: string | number;
  }>,
) {
  return {
    type: 'FeatureCollection' as const,
    features,
  };
}
