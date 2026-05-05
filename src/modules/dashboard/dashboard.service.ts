import { Injectable } from '@nestjs/common';
import { Incident } from '../incidents/entities/incident.entity';
import { DashboardQueryDto } from './dto/Dashboard-query.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  applyIncidentFilters,
  applyIncidentDateRange,
} from 'src/common/query-builders/incident-query.builder';
import {
  DashboardBreakdownGroupBy,
  DashboardBreakdownQueryDto,
} from './dto/Dashboard-breakdown-query.dto';
import { SelectQueryBuilder } from 'typeorm/browser';
import { IncidentType } from '../incidents/entities/incidentType.entity';
import { IncidentCategory } from '../incidents/entities/incidentCategory.entity';
import { IncidentSubtype } from '../incidents/entities/incidentSubtype.entity';
import { Ward } from '../administrative_unit/entities/wards.entity';

type DashboardCountRow = {
  totalIncidents: string | number;
};

type ActiveWardsRow = {
  activeWards: string | number;
};

type TopTypeRow = {
  topTypeId: string | number;
  topTypeName: string;
  topTypeCount: string | number;
};

type TrendRow = {
  time: string | Date;
  count: string | number;
};

type TrendPoint = {
  time: string | Date;
  count: string | number;
};

// type Breakdown
type BreakdownRawRow = {
  key: string | null;
  label: string | null;
  count: string | number;
};

type BreakdownItem = {
  key: string | null;
  label: string | null;
  count: number;
  percentage: number;
};

type BreakdownSeries = {
  total: number;
  items: BreakdownItem[];
};

type BreakdownResponse = {
  groupBy: DashboardBreakdownGroupBy;
  currentRange: {
    fromDate: string | null;
    toDate: string | null;
  };
  compareRange: {
    fromDate: string | null;
    toDate: string | null;
  };
  compareEnabled: boolean;
  current: BreakdownSeries;
  compare: BreakdownSeries;
};
// Dùng khi muốn trả về label thân thiện hơn cho một số field như ma_xa, incidentTypeCode, v.v.
const UNKNOWN_LABEL = 'Không xác định';
@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
  ) {}

  // Hàm xây dựng truy vấn cơ bản với các bộ lọc chung
  private buildBaseIncidentQuery(query: DashboardQueryDto) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    qb.where('1=1');
    applyIncidentFilters(qb, query);
    return qb;
  }

  // Hàm tính toán khoảng thời gian so sánh trước đó dựa trên khoảng thời gian hiện tại
  private calculatePreviousChangePeriod(
    currentPeriod: number,
    comparePeriod: number | null,
  ): string | number | null {
    if (comparePeriod == null) {
      return null; // Nếu không có khoảng thời gian so sánh, trả về null
    }
    if (comparePeriod === 0) {
      return currentPeriod === 0 ? 0 : null; // Nếu khoảng thời gian so sánh là 0, trả về 0 nếu hiện tại cũng là 0, ngược lại trả về null
    }
    return Number(
      ((currentPeriod - comparePeriod) / Math.abs(comparePeriod)) * 100,
    ).toFixed(2); // Tính phần trăm thay đổi
  }
  // Ham de chuan hoa ket qua xu ly tu truy van trend, chuyen doi time ve dang ISO string va count ve number
  private normalizeTrendRows(rows: TrendRow[]): TrendPoint[] {
    return rows.map((row) => ({
      time:
        row.time instanceof Date ? row.time.toISOString() : String(row.time),
      count: Number(row.count ?? 0),
    }));
  }
  // Helper để xác định cách nhóm theo thời gian trong truy vấn
  private resolveTimeGroup(groupByTime?: 'day' | 'week' | 'month' | 'year') {
    if (groupByTime === 'week') {
      return "DATE_TRUNC('week', incident.incidentTime)";
    }
    if (groupByTime === 'month') {
      return "DATE_TRUNC('month', incident.incidentTime)";
    }
    if (groupByTime === 'year') {
      return "DATE_TRUNC('year', incident.incidentTime)";
    }
    return 'DATE(incident.incidentTime)';
  }

  private async buildTrendSeries(
    query: DashboardQueryDto,
    fromDate?: string,
    toDate?: string,
  ): Promise<TrendRow[]> {
    const qb = this.buildBaseIncidentQuery(query);
    applyIncidentDateRange(qb, fromDate, toDate);
    const timeGroup = this.resolveTimeGroup(query.groupByTime);

    return qb
      .select(`${timeGroup}`, 'time')
      .addSelect('COUNT(*)', 'count')
      .groupBy(`${timeGroup}`)
      .orderBy('time', 'ASC')
      .getRawMany<TrendRow>();
  }

  // SUMMARY
  async getSummary(query: DashboardQueryDto) {
    const currentQb = this.buildBaseIncidentQuery(query);
    applyIncidentDateRange(
      currentQb,
      query.currentFromDate,
      query.currentToDate,
    );

    // Số lượng xã/phường có vụ việc xảy ra trong khoảng thời gian hiện tại
    const activeWardsRow: ActiveWardsRow | undefined = await currentQb
      .clone()
      .andWhere('incident.ma_xa IS NOT NULL')
      .select('COUNT(DISTINCT incident.ma_xa)', 'activeWards')
      .getRawOne();

    // Số lượng loại vụ việc trong khoảng thời gian hiện tại
    const topTypeRow: TopTypeRow | undefined = await currentQb
      .clone()
      .leftJoinAndSelect('incident.incidentType', 'incidentType')
      .select('incident.incidentTypeId', 'topTypeId')
      .addSelect('incidentType.name', 'topTypeName')
      .addSelect('COUNT(*)', 'topTypeCount')
      .groupBy('incident.incidentTypeId')
      .addGroupBy('incidentType.name')
      .orderBy('COUNT(*)', 'DESC')
      .limit(1)
      .getRawOne();

    // Tổng số vụ việc trong khoảng thời gian hiện tại
    const totalRow: DashboardCountRow | undefined = await currentQb
      .clone()
      .select('COUNT(*)', 'totalIncidents')
      .getRawOne();

    const currentPeriod = Number(totalRow?.totalIncidents ?? 0);
    let comparePeriod: number | null = null; // Có thể tính toán giá trị này dựa trên khoảng thời gian so sánh nếu cần thiết

    if (query.compareFromDate && query.compareToDate) {
      const compareQb = this.buildBaseIncidentQuery(query);
      applyIncidentDateRange(
        compareQb,
        query.compareFromDate,
        query.compareToDate,
      );
      const compareRow: DashboardCountRow | undefined = await compareQb
        .select('COUNT(*)', 'totalIncidents')
        .getRawOne();

      comparePeriod = Number(compareRow?.totalIncidents ?? 0);
    }

    return {
      totalIncidents: currentPeriod,
      activeWards: Number(activeWardsRow?.activeWards ?? 0),
      topType: topTypeRow?.topTypeId ?? null,
      topTypeName: topTypeRow?.topTypeName ?? null,
      topTypeCount: Number(topTypeRow?.topTypeCount ?? 0),
      periodComparison: {
        currentPeriod,
        comparePeriod,
        changePercent: this.calculatePreviousChangePeriod(
          currentPeriod,
          comparePeriod,
        ),
        currentRange: {
          fromDate: query.currentFromDate ?? null,
          toDate: query.currentToDate ?? null,
        },
        compareRange: {
          fromDate: query.compareFromDate ?? null,
          toDate: query.compareToDate ?? null,
        },
      },
    };
  }

  // TREND
  async getTrend(query: DashboardQueryDto) {
    const currentRows = await this.buildTrendSeries(
      query,
      query.currentFromDate,
      query.currentToDate,
    );
    let compareRows: TrendRow[] = [];
    if (query.compareFromDate && query.compareToDate) {
      compareRows = await this.buildTrendSeries(
        query,
        query.compareFromDate,
        query.compareToDate,
      );
    }
    return {
      groupByTime: query.groupByTime ?? 'day',
      currentRange: {
        fromDate: query.currentFromDate ?? null,
        toDate: query.currentToDate ?? null,
      },
      compareRange: {
        fromDate: query.compareFromDate ?? null,
        toDate: query.compareToDate ?? null,
      },
      currentSeries: this.normalizeTrendRows(currentRows),
      compareSeries: this.normalizeTrendRows(compareRows),
    };
  }

  // BREAKDOWN
  // Helper để xác định trường groupBy cho breakdown, ưu tiên groupBy trước nếu có, sau đó mới đến groupByField, và mặc định là 'incidentTypeCode' nếu không có gì được cung cấp
  private resolveBreakdownGroupBy(
    query: DashboardBreakdownQueryDto,
  ): DashboardBreakdownGroupBy {
    return query.groupBy ?? query.groupByField ?? 'incidentTypeCode';
  }
  // Helper để lấy cấu hình breakdown (trường key, cách join để lấy label, và biểu thức label) dựa trên trường groupBy
  private getBreakdownConfig(groupBy: DashboardBreakdownGroupBy) {
    switch (groupBy) {
      case 'incidentTypeCode':
        return {
          keyExpr: 'incident.incidentTypeCode',
          join: (qb: SelectQueryBuilder<Incident>) => {
            qb.leftJoin(
              IncidentType,
              'incidentType',
              'incidentType.code = incident.incidentTypeCode',
            );
          },
          labelExpr:
            'COALESCE(incidentType.name, incident.incidentTypeCode, :unknownLabel)',
        };

      case 'incidentCategoryCode':
        return {
          keyExpr: 'incident.incidentCategoryCode',
          join: (qb: SelectQueryBuilder<Incident>) => {
            qb.leftJoin(
              IncidentCategory,
              'incidentCategory',
              'incidentCategory.code = incident.incidentCategoryCode',
            );
          },
          labelExpr:
            'COALESCE(incidentCategory.name, incident.incidentCategoryCode, :unknownLabel)',
        };

      case 'incidentSubtypeCode':
        return {
          keyExpr: 'incident.incidentSubtypeCode',
          join: (qb: SelectQueryBuilder<Incident>) => {
            qb.leftJoin(
              IncidentSubtype,
              'incidentSubtype',
              'incidentSubtype.code = incident.incidentSubtypeCode',
            );
          },
          labelExpr:
            'COALESCE(incidentSubtype.name, incident.incidentSubtypeCode, :unknownLabel)',
        };

      case 'ma_xa':
        return {
          keyExpr: 'incident.ma_xa',
          join: (qb: SelectQueryBuilder<Incident>) => {
            qb.leftJoin(Ward, 'ward', 'ward.ma_xa = incident.ma_xa');
          },
          labelExpr: 'COALESCE(ward.ten_xa, incident.ma_xa, :unknownLabel)',
        };
    }
  }
  // Helper để chuẩn hóa kết quả xử lý từ truy vấn breakdown, tính toán phần trăm và đảm bảo các giá trị count là number
  private normalizeBreakdownRows(
    rows: BreakdownRawRow[],
    total: number,
  ): BreakdownItem[] {
    if (total <= 0) return [];

    return rows.map((row) => {
      const count = Number(row.count ?? 0);
      return {
        key: String(row.key ?? '__unknown__'),
        label: String(row.label ?? row.key ?? UNKNOWN_LABEL),
        count,
        percentage: Number(((count / total) * 100).toFixed(2)),
      };
    });
  }
  // Hàm xây dựng series breakdown cho một khoảng thời gian cụ thể và groupBy cụ thể, được sử dụng cho cả current và compare trong breakdown
  private async buildBreakdownSeries(
    query: DashboardBreakdownQueryDto,
    fromDate?: string,
    toDate?: string,
    groupBy?: DashboardBreakdownGroupBy,
  ): Promise<BreakdownSeries> {
    const resolvedGroupBy = groupBy ?? this.resolveBreakdownGroupBy(query);
    const config = this.getBreakdownConfig(resolvedGroupBy);

    const baseForCount = this.buildBaseIncidentQuery(query);
    applyIncidentDateRange(baseForCount, fromDate, toDate);

    const totalRow = await baseForCount
      .clone()
      .select('COUNT(*)', 'total')
      .getRawOne<{ total: string | number }>();

    const total = Number(totalRow?.total ?? 0);
    if (total === 0) {
      return { total: 0, items: [] };
    }

    const qb = this.buildBaseIncidentQuery(query);
    applyIncidentDateRange(qb, fromDate, toDate);
    config.join(qb);

    const rows = await qb
      .select(config.keyExpr, 'key')
      .addSelect(config.labelExpr, 'label')
      .addSelect('COUNT(*)', 'count')
      .setParameter('unknownLabel', UNKNOWN_LABEL)
      .groupBy(config.keyExpr)
      .addGroupBy(config.labelExpr)
      .orderBy('count', 'DESC')
      .addOrderBy('label', 'ASC')
      .getRawMany<BreakdownRawRow>();

    return {
      total,
      items: this.normalizeBreakdownRows(rows, total),
    };
  }
  // Chuc nang breakdown
  async getBreakdown(
    query: DashboardBreakdownQueryDto,
  ): Promise<BreakdownResponse> {
    const groupBy = this.resolveBreakdownGroupBy(query);
    const compareEnabled = Boolean(
      query.compareFromDate && query.compareToDate,
    );

    const [current, compare] = await Promise.all([
      this.buildBreakdownSeries(
        query,
        query.currentFromDate,
        query.currentToDate,
        groupBy,
      ),
      compareEnabled
        ? this.buildBreakdownSeries(
            query,
            query.compareFromDate,
            query.compareToDate,
            groupBy,
          )
        : Promise.resolve({ total: 0, items: [] }),
    ]);

    return {
      groupBy,
      currentRange: {
        fromDate: query.currentFromDate ?? null,
        toDate: query.currentToDate ?? null,
      },
      compareRange: {
        fromDate: query.compareFromDate ?? null,
        toDate: query.compareToDate ?? null,
      },
      compareEnabled,
      current,
      compare,
    };
  }
}
