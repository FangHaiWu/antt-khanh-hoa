import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';

import type { Point } from 'geojson';
import { IncidentType } from './incidentType.entity';
import { Ward } from 'src/modules/administrative_unit/entities/wards.entity';
@Index(['incidentTime'])
@Index(['incidentTypeCode'])
@Index(['incidentSubtypeCode'])
@Index(['incidentCategoryCode'])
@Index(['ma_xa'])
@Index(['ma_xa', 'incidentTypeCode'])
@Entity('incident')
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Index()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  incidentTime: Date;

  @Column()
  incidentLocation: string;

  @Column({ length: 255 })
  sourceType: string;

  @Column({ nullable: true })
  sourceUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: Point;

  // Quan he chinh
  @ManyToOne(() => IncidentType, (incidentType) => incidentType.incidents, {
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'incidentTypeId' })
  incidentType: IncidentType;

  //FK chinh den incidentTypeId
  @Index()
  @Column()
  incidentTypeId: number;

  //denormalized
  @Column({ nullable: true })
  incidentCategoryCode: string;

  @Column({ nullable: true })
  incidentTypeCode: string;

  @Column({ type: 'varchar', nullable: true })
  incidentSubtypeCode?: string | null;

  @Column({ nullable: true })
  ma_xa: string;

  @ManyToOne(() => Ward)
  @JoinColumn({ name: 'ma_xa', referencedColumnName: 'ma_xa' })
  ward: Ward;
}
