import { Incident } from 'src/modules/incidents/entities/incident.entity';
import { toFeature } from '../utils/geojson-response.util';
import { toFeatureCollection } from '../utils/geojson-response.util';
export function toIncidentFeature(incident: Incident) {
  return toFeature(
    incident.location,
    {
      id: incident.id,
      title: incident.title,
      description: incident.description,
      incidentTime: incident.incidentTime,
      incidentLocation: incident.incidentLocation,
      sourceType: incident.sourceType,
      sourceUrl: incident.sourceUrl,
      incidentTypeId: incident.incidentTypeId,
      incidentCategoryCode: incident.incidentCategoryCode,
      incidentTypeCode: incident.incidentTypeCode,
      incidentSubtypeCode: incident.incidentSubtypeCode,
      ma_xa: incident.ma_xa,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
    },
    incident.id, // Sử dụng ID của sự cố làm ID của feature
  );
}

export function toIncidentFeatureCollection(incidents: Incident[]) {
  return toFeatureCollection(
    incidents.map((incident) => toIncidentFeature(incident)),
  );
}
