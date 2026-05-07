# Rule: TypeORM Safety

---

## Không bao giờ dùng synchronize: true ở production

```typescript
// app.module.ts — chú ý comment đã có sẵn trong code
synchronize: true, // dev only, set to false in production
```

Thay đổi schema ở production → dùng migration:
```bash
npm run typeorm migration:generate -- -n TenMigration
npm run typeorm migration:run
```

---

## Entity — quy tắc bắt buộc

### PK luôn là UUID
```typescript
@PrimaryGeneratedColumn('uuid')
id: string;
```

### Timestamps chuẩn
```typescript
@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;

// Soft delete (nếu cần)
@DeleteDateColumn()
deletedAt: Date;
```

### Nullable rõ ràng
```typescript
// Nếu có thể null — phải khai báo cả 2 chỗ
@Column({ nullable: true })
jobId: string | null;

// Nếu không null — không cần thêm gì, TypeORM default là NOT NULL
@Column()
name: string;
```

### Index cho các field hay query
```typescript
// Single column
@Index()
@Column()
status: OsintSourceStatus;

// Composite
@Index(['sourceId', 'externalEventId'], { unique: true })
export class OsintRawEvent { ... }

// Time-based queries (hay dùng WHERE + ORDER BY)
@Index()
@Column({ type: 'timestamp' })
incidentTime: Date;
```

---

## JSONB columns

```typescript
// Dùng cho schema linh hoạt (CrawlRule, ParseRule, rawPayload)
@Column({ type: 'jsonb', nullable: true })
crawlRule: CrawlRule | null;

// KHÔNG dùng any — khai báo interface rõ ràng
// BAD: config: any
// GOOD: config: CrawlRule | null
```

---

## Relation — luôn khai báo FK column riêng

```typescript
// Cần cả relation object VÀ FK string riêng để query linh hoạt
@ManyToOne(() => OsintSource, { nullable: false, onDelete: 'CASCADE' })
@JoinColumn({ name: 'sourceId' })
source: OsintSource;

@Column()
sourceId: string;  // ← cần để query WHERE sourceId = ? mà không cần join
```

---

## Soft delete vs Hard delete

**Hard delete** — chỉ khi chưa có dữ liệu liên quan:
```typescript
// Kiểm tra trước khi xóa
const rawEventCount = await this.rawEventRepo.count({ where: { sourceId: id } });
if (rawEventCount > 0) {
  // Không xóa cứng — chuyển sang disabled để giữ audit trail
  source.status = OsintSourceStatus.DISABLED;
  await this.sourceRepo.save(source);
} else {
  await this.sourceRepo.remove(source);
}
```

**Soft delete** — dùng `@DeleteDateColumn()` khi cần giữ record:
```typescript
await this.repo.softDelete(id);
// Tự động thêm WHERE deletedAt IS NULL vào mọi query
```

---

## QueryBuilder — pattern chuẩn

```typescript
// Dùng alias rõ ràng
const qb = this.sourceRepo
  .createQueryBuilder('source')
  .where('source.status = :status', { status: OsintSourceStatus.ACTIVE })
  .andWhere('source.crawlIntervalMinutes <= :interval', { interval: thresholdMinutes });

// Paginate
qb.skip((page - 1) * limit).take(limit);

const [items, total] = await qb.getManyAndCount();
```

**Tuyệt đối không dùng string interpolation trong query:**
```typescript
// SAI — SQL injection
qb.where(`source.name = '${name}'`);

// ĐÚNG — parameterized
qb.where('source.name = :name', { name });
```

---

## Raw query cho PostGIS — ghi comment lý do

```typescript
// Dùng raw query vì TypeORM QueryBuilder không hỗ trợ ST_DWithin
const result = await this.entityManager.query(
  `SELECT id FROM osint_observation
   WHERE ST_DWithin(
     ST_MakePoint(lng, lat)::geography,
     ST_MakePoint($1, $2)::geography,
     $3
   )`,
  [lng, lat, radiusMeters],
);
```

---

## Enum columns

```typescript
// Khai báo enum trong DB (không dùng string check)
@Column({ type: 'enum', enum: OsintSourceStatus, default: OsintSourceStatus.DRAFT })
status: OsintSourceStatus;
```

**Lưu ý:** Khi thêm giá trị mới vào enum → cần migration để ALTER TYPE trong PostgreSQL, `synchronize: true` không tự làm điều này đúng cách.
