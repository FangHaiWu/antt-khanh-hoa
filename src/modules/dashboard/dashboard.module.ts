import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incident } from '../incidents/entities/incident.entity';
import { Province } from '../administrative_unit/entities/province.entity';
import { Ward } from '../administrative_unit/entities/wards.entity';
import { DashboardService } from './dashboard.service';
import { IncidentType } from '../incidents/entities/incidentType.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Incident, Ward, Province, IncidentType])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
