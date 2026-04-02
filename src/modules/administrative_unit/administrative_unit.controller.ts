import { Controller, Get, Param } from '@nestjs/common';
import { AdministrativeUnitService } from './administrative_unit.service';
@Controller('administratives')
export class AdministrativeUnitController {
  constructor(
    private readonly administrativeUnitService: AdministrativeUnitService,
  ) {}

  @Get(':ma_xa')
  async findOne(@Param('ma_xa') ma_xa: string) {
    return await this.administrativeUnitService.findOne(ma_xa);
  }
  @Get()
  async findAll() {
    return this.administrativeUnitService.findAll();
  }
}
