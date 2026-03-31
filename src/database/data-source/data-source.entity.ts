import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DataSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  config: any;
}
