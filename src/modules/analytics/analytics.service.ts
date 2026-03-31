import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident } from '../incidents/entities/incident.entity';
import { buildDateRange } from '../../common/utils/date.util';
import { StatsQueryDto } from './dto/stats-query.dto';
import { applyIncidentFilters } from 'src/common/query-builders/incident-query.builder';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
  ) {}

  // STATISTICS

  async getTrend(query: StatsQueryDto) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    qb.where('1=1');
    applyIncidentFilters(qb, query);

    // dynamic group theo thoi gian
    const timeGroup =
      query.groupByTime === 'week'
        ? "DATE_TRUNC('week', incident.incidentTime)"
        : query.groupByTime === 'month'
          ? "DATE_TRUNC('month', incident.incidentTime)"
          : query.groupByTime === 'year'
            ? "DATE_TRUNC('year', incident.incidentTime)"
            : 'DATE(incident.incidentTime)';

    return qb
      .select(`${timeGroup}`, 'time')
      .addSelect('COUNT(*)', 'count')
      .groupBy(`${timeGroup}`)
      .orderBy('time', 'ASC')
      .getRawMany();
  }

  async statByType(fromDate?: string, toDate?: string) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    const dateRange = buildDateRange(fromDate, toDate);
    if (dateRange) {
      qb.where('incident.incidentTime BETWEEN :from AND :to', dateRange);
    }
    return qb
      .select('incident.incidentTypeCode', 'typeCode')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.incidentTypeCode')
      .getRawMany();
  }

  async statBySubtype(fromDate?: string, toDate?: string) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    const dateRange = buildDateRange(fromDate, toDate);
    qb.where('incident.incidentSubtypeCode IS NOT NULL');
    if (dateRange) {
      qb.andWhere('incident.incidentTime BETWEEN :from AND :to', dateRange);
    }

    return qb
      .select('incident.incidentSubtypeCode', 'subtypeCode')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.incidentSubtypeCode')
      .getRawMany();
  }

  async statByDate(fromDate?: string, toDate?: string) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    const dateRange = buildDateRange(fromDate, toDate);
    if (dateRange) {
      qb.where('incident.incidentTime BETWEEN :from AND :to', dateRange);
    }
    return qb
      .select('DATE(incident.incidentTime)', 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy('DATE(incident.incidentTime)')
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  async statByWard(fromDate?: string, toDate?: string) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    const dateRange = buildDateRange(fromDate, toDate);
    if (dateRange) {
      qb.where('incident.incidentTime BETWEEN :from AND :to', dateRange);
    }
    return qb
      .select('incident.ma_xa ', 'ma_xa')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.ma_xa')
      .getRawMany();
  }

  // Diem nong
  async statsTopWard(fromDate?: string, toDate?: string, limit: number = 10) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    const dateRange = buildDateRange(fromDate, toDate);
    if (dateRange) {
      qb.where('incident.incidentTime BETWEEN :from AND :to', dateRange);
    }
    return qb
      .select('incident.ma_xa ', 'ma_xa')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.ma_xa')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async heatmap(query: StatsQueryDto) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    qb.where('1=1');
    applyIncidentFilters(qb, query);

    return qb
      .select('incident.ma_xa', 'ma_xa')
      .addSelect('DATE(incident.incidentTime)', 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.ma_xa')
      .addGroupBy('DATE(incident.incidentTime)')
      .getRawMany();
  }

  // So sánh động

  async compare(query: StatsQueryDto) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    qb.where('1=1');
    applyIncidentFilters(qb, query);

    // dynamic group
    const groupByField = query.groupBy || 'incidentTypeCode';
    return qb
      .select(`incident.${groupByField}`, 'group')
      .addSelect('COUNT(*)', 'count')
      .groupBy(`incident.${groupByField}`)
      .orderBy('group', 'ASC')
      .getRawMany();
  }
}
