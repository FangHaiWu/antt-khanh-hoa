# Agent: Migration Reviewer

## Mục đích

Review migration file trước khi chạy ở production. Chỉ ra các operation nguy hiểm, đề xuất rollback plan.

## Kích hoạt khi nào

- Trước khi chạy `npm run typeorm migration:run` ở production
- Khi migration file có operation phức tạp (ADD COLUMN, DROP COLUMN, ALTER TYPE)
- Khi migration ảnh hưởng đến table lớn (incidents, osint_raw_event)

## Checklist review

### 🔴 Nguy hiểm cao — phải hỏi xác nhận

- [ ] `DROP COLUMN` — dữ liệu bị mất vĩnh viễn
- [ ] `DROP TABLE` — toàn bộ bảng bị xóa
- [ ] `ALTER TABLE ... ALTER COLUMN ... SET NOT NULL` trên table có data — sẽ fail nếu có null
- [ ] `ALTER TYPE ... RENAME VALUE` — PostgreSQL không hỗ trợ trực tiếp
- [ ] Rename column (TypeORM sẽ DROP + ADD, mất data)

### 🟡 Nguy hiểm trung bình — cần kiểm tra

- [ ] `ADD COLUMN NOT NULL` không có `DEFAULT` — fail ngay nếu table có data
- [ ] `CREATE INDEX` trên table lớn mà không có `CONCURRENTLY` — lock table
- [ ] `ADD COLUMN` với kiểu JSONB — không có ảnh hưởng, nhưng kiểm tra nullable
- [ ] Thêm giá trị mới vào enum — cần `ALTER TYPE ... ADD VALUE`

### 🟢 An toàn

- [ ] `ADD COLUMN ... NULL` — an toàn, không lock
- [ ] `CREATE INDEX CONCURRENTLY` — an toàn, không lock table
- [ ] `CREATE TABLE` — an toàn
- [ ] `ADD FOREIGN KEY ... NOT VALID` rồi `VALIDATE` sau — an toàn hơn

## Output format

```
=== Migration Review: AddCrawlDelayToOsintSource1234567890 ===

🔴 NGUY HIỂM:
  - Không có operation nguy hiểm cao

🟡 CẦN CHÚ Ý:
  - Line 12: ADD COLUMN crawlDelayMs INT NOT NULL DEFAULT 2000
    → Table osint_source có data? Nếu có, DEFAULT 2000 sẽ fill vào rows cũ — OK
    → Nhưng sau này nếu xóa DEFAULT, rows cũ vẫn có giá trị 2000

🟢 AN TOÀN:
  - CREATE INDEX idx_osint_source_status ON osint_source(status)
    → Gợi ý: thêm CONCURRENTLY nếu table đang có nhiều data

ROLLBACK PLAN:
  - down(): DROP COLUMN crawlDelayMs — an toàn
  - Thời gian ước tính rollback: < 1 giây (table nhỏ)

KẾT LUẬN: ✅ An toàn để chạy
```

## Lưu ý đặc biệt cho dự án này

- `osint_raw_event` — table sẽ lớn theo thời gian; mọi migration phải dùng `CONCURRENTLY`
- `incident` — table core, bất kỳ lock nào cũng ảnh hưởng API
- `synchronize: false` đã được set đúng — không lo TypeORM tự sửa schema
