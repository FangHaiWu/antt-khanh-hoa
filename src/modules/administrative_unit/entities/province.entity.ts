import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { Ward } from './wards.entity';
import type { MultiPolygon } from 'geojson';
@Entity('province')
export class Province {
  @PrimaryColumn()
  ma_tinh: string;

  @Column()
  ten_tinh: string;

  @Column()
  quy_mo: string;

  @Column({ nullable: true })
  tru_so: string;

  @Column()
  loai: string;
  @Column()
  cap: number;

  @Column({ type: 'float' })
  dtich_km2: number;

  @Column({ type: 'int' })
  dan_so: number;

  @Column({ type: 'float' })
  matdo_km2: number;

  // 🗺️ geometry
  @Column({
    name: 'geom',
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
  })
  boundary: MultiPolygon;

  // Quan hệ với Ward
  @OneToMany(() => Ward, (ward) => ward.province)
  wards: Ward[];
}
