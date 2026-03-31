import { Controller, Query, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { StatsQueryDto } from './dto/stats-query.dto';
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}
  // STATISTICS
  @Get('by-date')
  statByDate(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.analyticsService.statByDate(fromDate, toDate);
  }

  @Get('by-type')
  statByType(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.analyticsService.statByType(fromDate, toDate);
  }

  @Get('by-subtype')
  statBySubtype(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.analyticsService.statBySubtype(fromDate, toDate);
  }

  @Get('by-ward')
  statByWard(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.analyticsService.statByWard(fromDate, toDate);
  }

  @Get('trend')
  getTrend(@Query() query: StatsQueryDto) {
    return this.analyticsService.getTrend(query);
  }

  @Get('heatmap')
  heatmap(@Query() query: StatsQueryDto) {
    return this.analyticsService.heatmap(query);
  }

  @Get('compare')
  compare(@Query() query: StatsQueryDto) {
    return this.analyticsService.compare(query);
  }
}
