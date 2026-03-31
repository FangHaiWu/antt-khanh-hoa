import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { IncidentType } from './incidentType.entity';
@Entity('incident_subtype')
export class IncidentSubtype {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({ unique: true })
  name: string;

  @ManyToOne(
    () => IncidentType,
    (incidentType: IncidentType) => incidentType.incidentSubtypes,
    {
      nullable: false,
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'incidentTypeId', referencedColumnName: 'id' })
  incidentType: IncidentType;

  @Column()
  incidentTypeId: number;
}
