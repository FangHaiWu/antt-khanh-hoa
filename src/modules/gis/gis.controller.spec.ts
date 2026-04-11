import { Test, TestingModule } from '@nestjs/testing';
import { GisController } from './gis.controller';
import { GisService } from './gis.service';

describe('GisController', () => {
  let controller: GisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GisController],
      providers: [GisService],
    }).compile();

    controller = module.get<GisController>(GisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
