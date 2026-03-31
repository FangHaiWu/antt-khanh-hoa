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
    qb.andWhere('incident.ma_xa = :ma_xa', { ma_xa: query.ma_xa });
  }
  const dateRange = buildDateRange(query.fromDate, query.toDate);
  if (dateRange) {
    qb.andWhere('incident.incidentTime BETWEEN :from AND :to', dateRange);
  }
}
