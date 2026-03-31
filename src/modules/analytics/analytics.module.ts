import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Incident } from '../incidents/entities/incident.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
@Module({
  imports: [TypeOrmModule.forFeature([Incident])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
