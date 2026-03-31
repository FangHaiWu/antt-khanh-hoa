import {
  Column,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
  Entity,
} from 'typeorm';
import { IncidentCategory } from './incidentCategory.entity';
import { Incident } from './incident.entity';
import { IncidentSubtype } from './incidentSubtype.entity';

@Entity('incident_type')
export class IncidentType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  lawCode: string;

  //FK toi category
  @ManyToOne(() => IncidentCategory, (category) => category.incidentTypes, {
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId', referencedColumnName: 'id' })
  category: IncidentCategory;

  @Column({ name: 'categoryId' })
  categoryId: number;

  // Quan he voi Incident
  @OneToMany(() => Incident, (incident) => incident.incidentType)
  incidents: Incident[];

  @OneToMany(
    () => IncidentSubtype,
    (incidentSubtype) => incidentSubtype.incidentType,
  )
  incidentSubtypes: IncidentSubtype[];
}
