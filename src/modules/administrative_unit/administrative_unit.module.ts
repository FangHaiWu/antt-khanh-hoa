import { Module } from '@nestjs/common';
import { AdministrativeUnitController } from './administrative_unit.controller';
import { AdministrativeUnitService } from './administrative_unit.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ward } from './entities/wards.entity';
import { Province } from './entities/province.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ward, Province])],
  controllers: [AdministrativeUnitController],
  providers: [AdministrativeUnitService],
})
export class AdministrativeUnitModule {}
