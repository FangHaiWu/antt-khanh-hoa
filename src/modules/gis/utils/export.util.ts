import { Incident } from '../../incidents/entities/incident.entity';

export function incidentsToGeoJSON(incidents: Incident[]) {
  const header = [
    'id',
    'title',
    'incidentTime',
    'incidentLocation',
    'incidentypeCode',
    'incidentSubtypeCode',
    'incidentCategoryCode',
    'wardCode',
    'sourceType',
    'lng',
    'lat',
  ].join(',');

  const rows = incidents.map((incident) =>
    [
      incident.id,
      `"${(incident.title ?? '').replace(/"/g, '""')}"`,
      incident.incidentTime?.toISOString?.() ?? '',
      `"${(incident.incidentLocation ?? '').replace(/"/g, '""')}"`,
      incident.sourceType ?? '',
      incident.incidentTypeCode ?? '',
      incident.incidentCategoryCode ?? '',
      incident.incidentSubtypeCode ?? '',
      incident.ma_xa ?? '',
      incident.location?.coordinates?.[0] ?? '',
      incident.location?.coordinates?.[1] ?? '',
    ].join(','),
  );

  return [header, ...rows].join('\n');
}
