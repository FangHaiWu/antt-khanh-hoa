import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  OneToMany,
  Index,
} from 'typeorm';
import { IncidentType } from './incidentType.entity';
@Entity('incident_category')
export class IncidentCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Index({ unique: true })
  @Column()
  name: string;

  @OneToMany(() => IncidentType, (incidentType) => incidentType.category)
  incidentTypes: IncidentType[];
}
