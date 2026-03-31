import { Controller, Get, Param } from '@nestjs/common';
import { AdministrativeUnitService } from './administrative_unit.service';
@Controller('administratives')
export class AdministrativeUnitController {
  constructor(
    private readonly administrativeUnitService: AdministrativeUnitService,
  ) {}

  @Get(':wardCode')
  async findOne(@Param('wardCode') wardCode: string) {
    return await this.administrativeUnitService.findOne(wardCode);
  }
  @Get()
  async findAll() {
    return this.administrativeUnitService.findAll();
  }
}
