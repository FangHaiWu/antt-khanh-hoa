import { Injectable } from '@nestjs/common';
import { Incident } from '../incidents/entities/incident.entity';
import { Province } from '../administrative_unit/entities/province.entity';
import { Ward } from '../administrative_unit/entities/wards.entity';
import { DashboardQueryDto } from './dto/Dashboard-query.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { applyIncidentFilters } from 'src/common/query-builders/incident-query.builder';
import { IncidentType } from '../incidents/entities/incidentType.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
    @InjectRepository(IncidentType)
    private readonly incidentTypeRepository: Repository<IncidentType>,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
  ) {}

  // Lấy dữ liệu tổng hợp cho dashboard
  async getSummary(query: DashboardQueryDto) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    qb.where('1=1');

    applyIncidentFilters(qb, query);

    // Tổng số vụ việc
    const totalIncidents = await qb.getCount();

    // So xa co vu viec xay ra
    const countWardsOccurred = await qb
      .select('DISTINCT incident.ma_xa')
      .getCount();

    // Lay ra ten, so luong loai vu viec xay ra nhieu nhat

    const topIncidentTypes = await qb
      .leftJoinAndSelect('incident.incidentType', 'incidentType')
      .select('incident.incidentTypeId', 'incidentTypeId')
      .addSelect('incidentType.name', 'name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.incidentTypeId')
      .addGroupBy('incidentType.name')
      .orderBy('COUNT(*)', 'DESC')
      .limit(1)
      .getRawMany();
    return {
      totalIncidents,
      countWardsOccurred,
      topIncidentTypes,
    };
  }

  async getTrend(query: DashboardQueryDto) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    qb.where('1=1');
    applyIncidentFilters(qb, query);

    // dynamic group theo thoi gian
    const timeGroup =
      query.groupByTime === 'week'
        ? `DATE_TRUNC('week', incident.incidentTime AT TIME ZONE 'Asia/Ho_Chi_Minh')`
        : query.groupByTime === 'month'
          ? `DATE_TRUNC('month', incident.incidentTime AT TIME ZONE 'Asia/Ho_Chi_Minh')`
          : query.groupByTime === 'year'
            ? `DATE_TRUNC('year', incident.incidentTime AT TIME ZONE 'Asia/Ho_Chi_Minh')`
            : `DATE(incident.incidentTime AT TIME ZONE 'Asia/Ho_Chi_Minh')`;

    return qb
      .select(`TO_CHAR(${timeGroup}, 'YYYY-MM-DD')`, 'time') // dinh dang lai thoi gian ve chuoi de de so sanh va hien thi
      .addSelect('COUNT(*)::int', 'count')
      .groupBy(`${timeGroup}`)
      .orderBy('time', 'ASC')
      .getRawMany();
  }
}
