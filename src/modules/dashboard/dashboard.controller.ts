import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/Dashboard-query.dto';
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getSummary(query);
  }

  @Get('trend')
  async getTrend(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getTrend(query);
  }
}
