export class IncidentResponseDto {
  id: number;
  title: string;
  description?: string;
  incidentTime: Date;
  incidentLocation: string;
  sourceType: string;
  sourceUrl?: string;
  incidentTypeId: number;
  incidentTypeName: string;
  wardCode: string;
  createdAt: Date;
}
