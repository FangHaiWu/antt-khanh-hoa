import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OsintSourceType } from '../enums/osint-source-type.enum';
import { OsintSourceStatus } from '../enums/osint-source-status';
import type { CrawlRule } from '../types/crawl-rule';
import type { ParseRule } from '../types/parse-rule';

@Entity('osint_source')
export class OsintSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: OsintSourceType })
  sourceType: OsintSourceType;

  @Column()
  baseUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  crawlRule: CrawlRule | null;

  @Column({ type: 'jsonb', nullable: true })
  parseRule: ParseRule | null;

  @Column({ default: 5 })
  priority: number;

  @Column({ default: 30 })
  crawlIntervalMinutes: number;

  @Column({ type: 'float', default: 0.5 })
  credibilityWeight: number;

  @Column({
    type: 'enum',
    enum: OsintSourceStatus,
    default: OsintSourceStatus.DRAFT,
  })
  status: OsintSourceStatus;

  @Column({ default: 0 })
  consecutiveFailureCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSuccessfulCrawl: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastSuccessfulCheckpoint: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  autoDisableAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
