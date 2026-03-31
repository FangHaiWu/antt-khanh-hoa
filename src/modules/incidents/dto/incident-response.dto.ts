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
  ma_xa: string;
  createdAt: Date;
}
