import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ward } from './entities/wards.entity';
import { Province } from './entities/province.entity';

@Injectable()
export class AdministrativeUnitService {
  constructor(
    @InjectRepository(Ward) private readonly wardsRepository: Repository<Ward>,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
  ) {}

  async findOne(ma_xa: string) {
    return await this.wardsRepository.findOne({
      where: { ma_xa },
    });
  }

  async findAll(): Promise<Ward[]> {
    const resultWards = await this.wardsRepository.find();
    const wards = resultWards.map((ward) => ({
      ...ward,
    }));
    return wards;
  }
}
