import type { Feature, FeatureCollection, Geometry } from 'geojson';

// Dung generic de co the su dung cho nhieu loai properties khac nhau, mac dinh la mot object voi key la string va value la unknown
//type GisFeature co tac dung la mo ta mot feature trong geojson, voi geometry la Geometry va properties la TProperties
// GisFeature dung cho route de tra 1 object: ward, province, incident va co properties la cac truong du lieu cua object do
export type GisFeature<TProperties = Record<string, unknown>> = Feature<
  Geometry,
  TProperties
>;
//type GisFeatureCollection co tac dung la mo ta mot collection cac feature trong geojson, voi geometry la Geometry va properties la TProperties
// GisFeatureCollection dung cho route de tra 1 array cac object: ward, province, incident va co properties la cac truong du lieu cua object do
export type GisFeatureCollection<TProperties = Record<string, unknown>> =
  FeatureCollection<Geometry, TProperties>;

// FeatureRow va FeatureCollectionRow la 2 type de mo ta kieu du lieu tra ve tu database, voi FeatureRow tra ve 1 object co truong feature la GisFeature, va FeatureCollectionRow tra ve 1 object co truong geojson la GisFeatureCollection
// FeatureRow dung khi SQL  SELECT ... AS feature, va FeatureCollectionRow dung khi SQL SELECT ... AS geojson
export type FeatureRow<TProperties = Record<string, unknown>> = {
  feature: GisFeature<TProperties>;
};

export type FeatureCollectionRow<TProperties = Record<string, unknown>> = {
  geojson: GisFeatureCollection<TProperties>;
};
