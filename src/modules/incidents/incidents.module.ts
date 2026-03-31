import { Module } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incident } from './entities/incident.entity';
import { IncidentCategory } from './entities/incidentCategory.entity';
import { IncidentType } from './entities/incidentType.entity';
import { IncidentSubtype } from './entities/incidentSubtype.entity';
import { Province } from '../administrative_unit/entities/province.entity';
import { Ward } from '../administrative_unit/entities/wards.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Incident,
      IncidentCategory,
      IncidentType,
      IncidentSubtype,
      Ward,
      Province,
    ]),
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}
