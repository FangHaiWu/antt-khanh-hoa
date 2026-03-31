import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import type { MultiPolygon } from 'geojson';
import { Province } from './province.entity';
import { Incident } from '../../incidents/entities/incident.entity';
@Entity('wards')
export class Ward {
  @PrimaryColumn()
  ma_xa: string;

  @Column({ name: 'ten_xa', nullable: true })
  ten_xa: string;

  @Column({ name: 'cap', nullable: true })
  cap: number;

  @Column({ name: 'loai', nullable: true })
  loai: string;

  @Column({ name: 'dtich_km2', type: 'float' })
  dtich_km2: number;

  @Column()
  dan_so: number;

  @Column({ name: 'matdo_km2', type: 'float' })
  matdo_km2: number;

  @Column()
  ma_tinh: string;

  // 🗺️ geometry
  @Index({ spatial: true })
  @Column({
    name: 'geom',
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
  })
  boundary: MultiPolygon;

  // Quan hệ
  @ManyToOne(() => Province, (province) => province.wards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ma_tinh', referencedColumnName: 'ma_tinh' })
  province: Province;

  @OneToMany(() => Incident, (incident) => incident.ward)
  incidents: Incident[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}
