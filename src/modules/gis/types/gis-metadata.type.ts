export interface GisFieldMetadata {
  name: string;
  type: string;
  label: string;
}

export interface GisDatasetMetadata {
  id: string;
  name: string;
  geometryType:
    | 'Point'
    | 'Polygon'
    | 'MultiPolygon'
    | 'LineString'
    | 'MultiLineString';
  crs: string; // Coordinate Reference System, e.g., "EPSG:4326"
  timeField?: string; // Thuoc tinh tuy chon de loc theo thoi gian, neu co
  primaryKey: string; // Thuoc tinh de xac dinh khoa chinh
  filter: string[]; // Danh sach cac truong du lieu (khong bao gom geometry)
  fields: GisFieldMetadata[]; // Danh sach cac truong du lieu, bao gom ten truong, kieu du lieu va label de hien thi
}
