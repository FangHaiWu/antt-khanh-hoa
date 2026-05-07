# CLAUDE.md — antt-khanh-hoa

Hướng dẫn làm việc với dự án này. Đọc kỹ trước khi bắt đầu bất kỳ task nào.

---

## 1. Tổng quan dự án

Hệ thống quản lý an ninh trật tự tỉnh Khánh Hòa. Backend REST API phục vụ:
- Quản lý và thống kê sự cố (incidents) theo địa bàn
- Phân tích GIS + PostGIS (hotspot, geocode, reverse-geocode)
- Dashboard tổng hợp theo thời gian
- **OSINT pipeline** — thu thập dữ liệu công khai, chuẩn hóa, chấm điểm, tự động tạo incident

Pháp lý liên quan: Nghị định 13/2023/NĐ-CP — raw data và audit log là yêu cầu pháp lý, không phải optional.

---

## 2. Tech stack

| Thành phần | Công nghệ |
|---|---|
| Framework | NestJS 11 |
| ORM | TypeORM 0.3 |
| Database | PostgreSQL + PostGIS |
| Queue (OSINT) | BullMQ (`@nestjs/bullmq`) |
| Validation | class-validator + class-transformer |
| Test | Jest + Supertest |
| Language | TypeScript strict |

**Packages OSINT cần cài (chưa có trong package.json):**
```
npm install @nestjs/bullmq bullmq axios cheerio @nestjs/schedule
npm install -D @types/cheerio
```

---

## 3. Cấu trúc module

```
src/
  modules/
    administrative_unit/   ← tỉnh/xã (PostGIS geometry)
    incidents/             ← CRUD sự cố, phân loại 3 cấp
    analytics/             ← thống kê tổng hợp
    gis/                   ← GIS queries, hotspot, export
    dashboard/             ← summary + trend cho dashboard
    osint/                 ← OSINT pipeline (đang xây dựng)
  common/
    query-builders/        ← SelectQueryBuilder helpers
    utils/                 ← date util
  database/
    seeds/                 ← seed data (GeoJSON tỉnh/xã)
    data-source/           ← DataSource entity
```

Mỗi module có cấu trúc chuẩn: `module / controller / service / dto / entities / enums / types`.

Đọc `.claude/docs/osint-architecture.md` **trước khi** làm bất kỳ task nào liên quan OSINT.

---

## 4. Quy ước code — BẮT BUỘC

### 4.1 Header file
Mỗi file phải có comment ngắn ở đầu mô tả mục đích và vị trí trong workflow:

```typescript
// osint-source.service.ts
// Quản lý OsintSource: CRUD, validate crawlRule/parseRule, activate/deactivate.
// Được gọi bởi: OsintSourceController (HTTP) và OsintCrawlerScheduler (khi enqueue job).
```

### 4.2 Comment tiếng Việt
- Bắt buộc comment tại: business logic phức tạp, công thức tính toán, constraint không hiển nhiên, workaround
- Không comment những gì tên hàm/biến đã nói rõ
- Comment giải thích WHY, không giải thích WHAT

```typescript
// SAI — comment thừa
// Lấy source theo id
const source = await this.sourceRepo.findOne({ where: { id } });

// ĐÚNG — giải thích constraint không hiển nhiên
// Không xóa cứng nếu đã có raw events — chuyển sang disabled để giữ audit trail
if (rawEventCount > 0) {
  source.status = OsintSourceStatus.DISABLED;
}
```

### 4.3 Quy tắc đặt tên
- File: `kebab-case.ts`
- Class: `PascalCase`
- Method/variable: `camelCase`
- Enum value: `SCREAMING_SNAKE_CASE`
- DB column: `camelCase` (TypeORM tự map sang snake_case)

---

## 5. Workflow làm việc — BẮT BUỘC

### 5.1 Trước khi sửa code
**Luôn hỏi xác nhận** trước khi thay đổi, đặc biệt:
- Sửa entity (ảnh hưởng DB schema)
- Sửa logic business (confidence, dedupe, auto-merge)
- Refactor file lớn

Ưu tiên **sửa nhỏ, đúng chỗ** hơn là rewrite toàn bộ.

### 5.2 Sau khi sửa code
1. Chạy `npm run lint` — fix lỗi trước khi báo xong
2. Chạy test liên quan: `npm run test -- --testPathPattern=<module>`
3. Chỉ ra các **nguy cơ lỗi tiềm ẩn** (edge case, null pointer, race condition)
4. Hướng dẫn cách fix nếu có lỗi xảy ra

### 5.3 Không tự ý làm
- Không thêm package mới mà không thông báo
- Không refactor code ngoài phạm vi task
- Không xóa code cũ mà không hỏi
- Không bật `synchronize: true` ở production

---

## 6. Known issues / Pitfalls

### Bug đang tồn tại
**`src/app.module.ts:12`** — import path sai:
```typescript
// SAI (đang có trong code)
import { OsintModule } from './src/modules/osint/osint.module';
// ĐÚNG
import { OsintModule } from './modules/osint/osint.module';
```

### TypeORM với PostGIS
- Geometry columns dùng `type: 'geometry'` — không có TypeScript type built-in
- Raw queries cho spatial operations (ST_DWithin, ST_Contains...) — không dùng qua TypeORM QueryBuilder
- Xem ví dụ trong `src/modules/gis/queries/`

### Dedupe OSINT
- 3 levels dedupe — xem chi tiết trong `.claude/docs/osint-architecture.md` mục 5.2
- payloadHash phải normalize trước khi hash (sort key, trim whitespace)
- rawPayload là **bất biến** — không có PATCH endpoint, không có @UpdateDateColumn

---

## 7. Tài liệu tham khảo

| File | Nội dung |
|---|---|
| `.claude/docs/osint-architecture.md` | Spec đầy đủ OSINT pipeline v2.0 |
| `.claude/docs/decision-log.md` | Các quyết định kiến trúc quan trọng |
| `.claude/rules/comment-style.md` | Quy tắc comment chi tiết |
| `.claude/rules/nestjs-patterns.md` | Pattern NestJS chuẩn của dự án |
| `.claude/rules/typeorm-safety.md` | Quy tắc an toàn TypeORM |
