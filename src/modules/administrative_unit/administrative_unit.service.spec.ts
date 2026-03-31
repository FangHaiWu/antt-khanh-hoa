import { Test, TestingModule } from '@nestjs/testing';
import { AdministrativeUnitService } from './administrative_unit.service';

describe('AdministrativeUnitService', () => {
  let service: AdministrativeUnitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdministrativeUnitService],
    }).compile();

    service = module.get<AdministrativeUnitService>(AdministrativeUnitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
