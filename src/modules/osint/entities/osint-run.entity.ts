import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OsintSource } from './osint-source.entity';
import { OsintRunStatus } from '../enums/osint-run-status.enum';

@Entity('osint_run')
export class OsintRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK về source nào trigger run này
  @ManyToOne(() => OsintSource, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceId' })
  source: OsintSource;

  @Column()
  sourceId: string;

  // Trạng thái của run — do Bull worker cập nhật khi job chuyển phase
  @Column({
    type: 'enum',
    enum: OsintRunStatus,
    default: OsintRunStatus.QUEUED,
  })
  status: OsintRunStatus;

  // Bull job ID — dùng để cancel hoặc track job trên Bull dashboard
  @Column({ nullable: true })
  jobId: string | null;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  // Null khi job đang chạy hoặc bị kill bất ngờ (process crash)
  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date | null;

  // Tổng số item lấy được từ source (trước khi dedupe)
  @Column({ default: 0 })
  itemsFound: number;

  // Số RawEvent thực sự INSERT vào DB (sau khi dedupe)
  @Column({ default: 0 })
  itemsCreated: number;

  // Số item bị bỏ qua vì đã tồn tại (exact match hoặc hash match)
  @Column({ default: 0 })
  itemsSkipped: number;

  // Lý do fail — chỉ có giá trị khi status = FAILED
  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  // createdAt = thời điểm job được đẩy vào queue (khác startedAt = lúc worker bắt đầu xử lý)
  @CreateDateColumn()
  createdAt: Date;
}
