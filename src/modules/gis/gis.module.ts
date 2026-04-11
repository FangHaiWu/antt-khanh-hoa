import { Module } from '@nestjs/common';
import { GisService } from './gis.service';
import { GisController } from './gis.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ward } from '../administrative_unit/entities/wards.entity';
import { Province } from '../administrative_unit/entities/province.entity';
import { Incident } from '../incidents/entities/incident.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Ward, Province, Incident])],
  controllers: [GisController],
  providers: [GisService],
  exports: [GisService],
})
export class GisModule {}
