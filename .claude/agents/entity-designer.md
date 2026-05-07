# Agent: Entity Designer

## Mục đích

Sub-agent chuyên thiết kế TypeORM entity. Dùng khi cần phân tích quan hệ, xác định index, review entity hiện có.

## Kích hoạt khi nào

- Thiết kế entity mới từ yêu cầu nghiệp vụ
- Review entity hiện có (thiếu index? nullable sai? relation không đúng?)
- So sánh entity với spec (`.claude/docs/osint-architecture.md`)

## Quy trình phân tích

### 1. Hiểu yêu cầu nghiệp vụ
- Entity này đại diện cho gì trong domain?
- Ai tạo record này? (user, worker, system)
- Record bị xóa hay soft-delete hay không bao giờ xóa?
- Có audit trail yêu cầu pháp lý không?

### 2. Xác định fields
- PK: luôn là `uuid`
- FK: cần cả relation object VÀ FK string column
- Timestamps: `createdAt` bắt buộc, `updatedAt` nếu record có thể update
- Nullable: mọi field nullable phải có `| null` trong TypeScript type

### 3. Xác định index
Hỏi về query patterns:
- Field nào thường xuất hiện trong `WHERE`?
- Field nào thường dùng trong `ORDER BY`?
- Combination field nào thường WHERE cùng nhau?
- Có unique constraint nào không?

Nguyên tắc:
- FK column: luôn index (TypeORM không tự add)
- Status/enum: index nếu thường filter
- Timestamp: index nếu thường sort hoặc range query
- Composite: khi 2 field thường WHERE cùng nhau

### 4. Kiểm tra constraint
- JSONB field: có interface type không? (không được dùng `any`)
- Enum field: đã có `type: 'enum'`?
- Unique field: đã có `unique: true` hoặc `@Index({ unique: true })`?

### 5. Output

Tạo entity file với:
- Header comment (mục đích + ai dùng)
- Comment trên field không hiển nhiên
- Tất cả decorator đúng
- Checklist sau file:
  ```
  ⚠️  Nguy cơ: field X nullable nhưng chưa có | null
  ⚠️  Nguy cơ: onDelete: CASCADE sẽ xóa cả OsintRun khi xóa OsintSource
  💡  Gợi ý: thêm @Index(['sourceId', 'status']) cho query filter phổ biến
  ```

## Tài liệu tham khảo

- `.claude/rules/typeorm-safety.md`
- `.claude/rules/comment-style.md`
- `.claude/docs/osint-architecture.md` (nếu entity liên quan OSINT)
