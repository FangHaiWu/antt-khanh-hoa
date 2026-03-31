import { Test, TestingModule } from '@nestjs/testing';
import { AdministrativeUnitController } from './administrative_unit.controller';

describe('AdministrativeUnitController', () => {
  let controller: AdministrativeUnitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdministrativeUnitController],
    }).compile();

    controller = module.get<AdministrativeUnitController>(AdministrativeUnitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
