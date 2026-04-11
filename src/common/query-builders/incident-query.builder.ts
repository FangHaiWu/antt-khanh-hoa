import { SelectQueryBuilder } from 'typeorm';
import { Incident } from 'src/modules/incidents/entities/incident.entity';
import { SearchIncidentDto } from 'src/modules/incidents/dto/search-incident.dto';
import { buildDateRange } from '../utils/date.util';

export function applyIncidentFilters(
  qb: SelectQueryBuilder<Incident>,
  query: SearchIncidentDto,
) {
  if (query.keyword) {
    qb.andWhere(
      'incident.title ILIKE :keyword OR incident.description ILIKE :keyword',
      {
        keyword: `%${query.keyword}%`,
      },
    );
  }
  if (query.incidentCategoryCode) {
    qb.andWhere('incident.incidentCategoryCode = :categoryCode', {
      categoryCode: query.incidentCategoryCode,
    });
  }
  if (query.incidentTypeCode) {
    qb.andWhere('incident.incidentTypeCode = :typeCode', {
      typeCode: query.incidentTypeCode,
    });
  }
  if (query.incidentSubtypeCode) {
    qb.andWhere('incident.incidentSubtypeCode = :subtypeCode', {
      subtypeCode: query.incidentSubtypeCode,
    });
  }
  if (query.ma_xa) {
    qb.andWhere('incident.wardCode = :ma_xa', { ma_xa: query.ma_xa });
  }
  const dateRange = buildDateRange(query.fromDate, query.toDate);
  if (dateRange) {
    qb.andWhere('incident.incidentTime BETWEEN :from AND :to', dateRange);
  }

  // FILTER PostGIS
  // Hỗ trợ lọc theo bounding box (bbox) - định dạng: "minLng,minLat,maxLng,maxLat"
  if (query.bbox) {
    const [minLng, minLat, maxLng, maxLat] = query.bbox.split(',').map(Number);
    qb.andWhere(
      `
      incident.location && ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326)
    `,
      { minLng, minLat, maxLng, maxLat },
    );
  }
  // Hỗ trợ lọc theo khoảng cách từ một điểm (lat, lng) với bán kính (radius)
  if (query.lat != null && query.lng != null && query.radius != null) {
    qb.andWhere(
      `
      ST_DWithin(
        incident.location::geography,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
        :radius
      )
    `,
      { lat: query.lat, lng: query.lng, radius: query.radius },
    );
  }
  // Hỗ trợ lọc theo polygon (định dạng GeoJSON)
  if (query.polygon) {
    qb.andWhere(
      `
      ST_Intersects(
        incident.location,
        ST_SetSRID(ST_GeomFromGeoJSON(:polygon), 4326)
      )
    `,
      { polygon: JSON.stringify(query.polygon) }, // Chuyển đối tượng polygon thành chuỗi JSON để truyền vào query
    );
  }

  if (query.intersectsWard) {
    qb.andWhere(
      `
      EXISTS (
        SELECT 1
        FROM wards
        WHERE wards.ma_xa = :wardCode
          AND ST_Intersects(
            incident.location,
            wards.geom
          )
      )
      `,
      { wardCode: query.intersectsWard },
    );
  }
}
