import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, IsNull, Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Incident } from './entities/incident.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentType } from './entities/incidentType.entity';
import { Ward } from '../administrative_unit/entities/wards.entity';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentSubtype } from './entities/incidentSubtype.entity';
import { SearchIncidentDto } from './dto/search-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
    @InjectRepository(IncidentType)
    private readonly incidentTypeRepository: Repository<IncidentType>,
    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
    @InjectRepository(IncidentSubtype)
    private readonly incidentSubtypeRepository: Repository<IncidentSubtype>,
  ) {}

  // Các phương thức xử lý nghiệp vụ liên quan đến incidents
  // CRUD
  async create(createIncidentDto: CreateIncidentDto): Promise<Incident> {
    // 1. Validate incidentTypeId
    const type = await this.incidentTypeRepository.findOne({
      where: { id: createIncidentDto.incidentTypeId },
      relations: ['category'],
    });
    if (!type) {
      throw new NotFoundException('IncidentType not found');
    }
    // 2. Kiem tra incidentSubtypeCode neu co
    let subtype: IncidentSubtype | null = null;
    if (createIncidentDto.incidentSubtypeCode) {
      subtype = await this.incidentSubtypeRepository.findOne({
        where: { code: createIncidentDto.incidentSubtypeCode },
        relations: ['incidentType', 'incidentType.category'],
      });
      if (!subtype) {
        throw new NotFoundException('IncidentSubtype not found');
      }
      // Check subType phai thuoc incidentType
      if (subtype.incidentType.id !== createIncidentDto.incidentTypeId) {
        throw new BadRequestException(
          'IncidentSubtype does not belong to the specified IncidentType',
        );
      }
    }

    // 3. Kiem tra ward
    const ward = await this.wardRepository.findOne({
      where: { ma_xa: createIncidentDto.ma_xa },
    });

    if (!ward) {
      throw new NotFoundException('Ward not found');
    }
    // Derive hierarchy codes
    const incidentTypeId = subtype
      ? subtype.incidentType.id
      : createIncidentDto.incidentTypeId;

    const incidentTypeCode = subtype ? subtype.incidentType.code : type.code;
    const incidentCategoryCode = subtype
      ? subtype.incidentType.category.code
      : type.category.code;

    const incidentSubtypeCode = subtype?.code;

    // 5. Normalize time
    const incidentTime = createIncidentDto.incidentTime
      ? new Date(createIncidentDto.incidentTime)
      : new Date();
    // 6. Tao incident moi
    const incident = this.incidentRepository.create({
      title: createIncidentDto.title,
      description: createIncidentDto.description,
      incidentTime,
      incidentLocation: createIncidentDto.incidentLocation,
      sourceType: createIncidentDto.sourceType,
      sourceUrl: createIncidentDto.sourceUrl,
      incidentTypeId,
      incidentTypeCode,
      incidentCategoryCode,
      incidentSubtypeCode,
      ward,
    });
    return await this.incidentRepository.save(incident);
  }

  async findAll(): Promise<Incident[]> {
    return await this.incidentRepository.find({
      relations: ['incidentType', 'ward'],
    });
  }

  async findOne(id: string): Promise<Incident | null> {
    return await this.incidentRepository.findOne({
      where: { id },
      relations: ['incidentType', 'ward'],
    });
  }

  async update(
    id: string,
    updateIncidentDto: UpdateIncidentDto,
  ): Promise<Incident> {
    const incident = await this.incidentRepository.findOne({ where: { id } });
    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    // 1. Xu ly cap nhat incident type
    let type: IncidentType | null = null;

    if (updateIncidentDto.incidentTypeId) {
      type = await this.incidentTypeRepository.findOne({
        where: { id: updateIncidentDto.incidentTypeId },
        relations: ['category'],
      });
      if (!type) {
        throw new NotFoundException('IncidentType not found');
      }

      // 2. Xu ly cap nhat subtype neu co
      let subtype: IncidentSubtype | null = null;
      if (updateIncidentDto.incidentSubtypeCode) {
        subtype = await this.incidentSubtypeRepository.findOne({
          where: { code: updateIncidentDto.incidentSubtypeCode },
          relations: ['incidentType', 'incidentType.category'],
        });
        if (!subtype) {
          throw new NotFoundException('IncidentSubtype not found');
        }

        // Check consistency neu co ca incident type
        if (type && subtype.incidentType.id !== type.id) {
          throw new BadRequestException(
            'IncidentSubtype does not belong to the specified IncidentType',
          );
        }

        // 3. Check derive hierachy
        if (subtype) {
          // ưu tiên subtype > type
          incident.incidentTypeId = subtype.incidentType.id;
          incident.incidentTypeCode = subtype.incidentType.code;
          incident.incidentCategoryCode = subtype.incidentType.category.code;
          incident.incidentSubtypeCode = subtype.code;
        } else if (type) {
          // nếu có type nhưng không có subtype thì chỉ cập nhật type và category
          incident.incidentTypeId = type.id;
          incident.incidentTypeCode = type.code;
          incident.incidentCategoryCode = type.category.code;
          incident.incidentSubtypeCode = null;
        }
        // 4. validate ward
        if (updateIncidentDto.ma_xa) {
          const ward = await this.wardRepository.findOne({
            where: { ma_xa: updateIncidentDto.ma_xa },
          });
          if (!ward) {
            throw new NotFoundException('Ward not found');
          }
          incident.ward = ward;
        }
      }
      // 5. Update normal fields
      if (updateIncidentDto.title !== undefined) {
        incident.title = updateIncidentDto.title;
      }
      if (updateIncidentDto.description !== undefined) {
        incident.description = updateIncidentDto.description;
      }
      if (updateIncidentDto.incidentTime !== undefined) {
        incident.incidentTime = new Date(updateIncidentDto.incidentTime);
      }
      if (updateIncidentDto.incidentLocation !== undefined) {
        incident.incidentLocation = updateIncidentDto.incidentLocation;
      }
      if (updateIncidentDto.sourceType !== undefined) {
        incident.sourceType = updateIncidentDto.sourceType;
      }
      if (updateIncidentDto.sourceUrl !== undefined) {
        incident.sourceUrl = updateIncidentDto.sourceUrl;
      }
    }

    return await this.incidentRepository.save(incident);
  }

  async remove(id: string) {
    const incident = await this.incidentRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!incident) {
      throw new NotFoundException('Incident not found');
    }
    if (incident.deletedAt) {
      throw new BadRequestException('Incident already deleted');
    }
    await this.incidentRepository.softDelete(id);

    return {
      success: true,
      message: 'Incident deleted successfully',
      id,
    };
  }

  async restore(id: string) {
    const incident = await this.incidentRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!incident) {
      throw new NotFoundException('Incident not found');
    }
    await this.incidentRepository.restore(id);

    return {
      success: true,
      message: 'Incident restored successfully',
      id,
    };
  }
  async findDeleted(): Promise<Incident[]> {
    return await this.incidentRepository.find({
      withDeleted: true,
      where: { deletedAt: Not(IsNull()) },
      relations: ['incidentType', 'ward'],
      order: { deletedAt: 'DESC' },
    });
  }

  async hardDelete(id: string) {
    const incident = await this.incidentRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!incident) {
      throw new NotFoundException('Incident not found');
    }
    if (!incident.deletedAt) {
      throw new BadRequestException('Incident must be soft deleted first');
    }
    await this.incidentRepository.delete(id);

    return {
      success: true,
      message: 'Incident permanently deleted successfully',
      id,
    };
  }

  //SEARCH, FILTER, PAGINATION
  async searchIncidents(query: SearchIncidentDto) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    qb.leftJoinAndSelect('incident.incidentType', 'incidentType');
    qb.leftJoinAndSelect('incident.ward', 'ward');
    qb.where('1=1');
    if (query.keyword) {
      qb.andWhere(
        'incident.title ILIKE :keyword OR incident.description ILIKE :keyword',
        {
          keyword: `%${query.keyword}%`,
        },
      );
    }
    if (query.incidentCategoryCode) {
      qb.andWhere('incident.incidentCategoryCode = :categoryCode', {
        categoryCode: query.incidentCategoryCode,
      });
    }
    if (query.incidentTypeCode) {
      qb.andWhere('incident.incidentTypeCode = :typeCode', {
        typeCode: query.incidentTypeCode,
      });
    }
    if (query.incidentSubtypeCode) {
      qb.andWhere('incident.incidentSubtypeCode = :subtypeCode', {
        subtypeCode: query.incidentSubtypeCode,
      });
    }
    if (query.ma_xa) {
      qb.andWhere('incident.ma_xa = :ma_xa', { ma_xa: query.ma_xa });
    }
    if (query.fromDate && query.toDate) {
      qb.andWhere('incident.incidentTime BETWEEN :from AND :to', {
        from: query.fromDate,
        to: query.toDate,
      });
    }

    qb.orderBy('incident.incidentTime', 'DESC');

    const page = query.page || 1;
    const limit = query.limit || 10;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      total,
      page,
      limit,
    };
  }
  // STATISTICS

  async statByType(fromDate?: string, toDate?: string) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    qb.where('incident.incidenTime BETWEEN :from AND :to', {
      from: fromDate,
      to: toDate,
    });
    return qb
      .select('incident.incidentTypeCode', 'typeCode')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.incidentTypeCode')
      .getRawMany();
  }

  async statBySubtype(fromDate?: string, toDate?: string) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    qb.where('incident.incidenTime BETWEEN :from AND :to', {
      from: fromDate,
      to: toDate,
    });
    return qb
      .select('incident.incidentSubtypeCode', 'subtypeCode')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.incidentSubtypeCode')
      .getRawMany();
  }

  async statByDate(fromDate?: string, toDate?: string) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    qb.where('incident.incidenTime BETWEEN :from AND :to', {
      from: fromDate,
      to: toDate,
    });
    return qb
      .select('DATE(incident.incidentTime', 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy('DATE(incident.incidentTime)')
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  async statByWard(fromDate?: string, toDate?: string) {
    const qb = this.incidentRepository.createQueryBuilder('incident');
    qb.where('incident.incidentTime BETWEEN :from AND :to', {
      from: fromDate,
      to: toDate,
    });
    return qb
      .select('incident.ma_xa ', 'ma_xa')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.ma_xa')
      .getRawMany();
  }
}
