# Decision Log — antt-khanh-hoa

Ghi lại các quyết định kiến trúc quan trọng: tại sao chọn cách này, những gì đã bị bác bỏ.
Cập nhật mỗi khi có quyết định mới. Format: **Quyết định → Lý do → Alternatives đã loại bỏ**.

---

## Kiến trúc tổng thể

### [2026-05] Dùng NestJS 11 + TypeORM thay vì Prisma
**Quyết định:** TypeORM 0.3
**Lý do:** PostGIS support tốt hơn với raw queries; TypeORM cho phép dùng `@Index` với spatial column trực tiếp; team đã quen TypeORM.
**Đã loại bỏ:** Prisma — hỗ trợ PostGIS phức tạp hơn, cần dùng `$queryRaw` cho hầu hết GIS queries.

### [2026-05] PostgreSQL + PostGIS thay vì MongoDB
**Quyết định:** PostgreSQL 15 + PostGIS
**Lý do:** Spatial queries (ST_DWithin, ST_Contains, hotspot clustering) là core feature; relational integrity quan trọng; audit trail cần transactions.
**Đã loại bỏ:** MongoDB — GIS support yếu, không có ACID transaction thực sự.

---

## OSINT Module

### [2026-05] Một OsintModule duy nhất thay vì nhiều module
**Quyết định:** `src/modules/osint/` — 1 module duy nhất
**Lý do:** Các service trong OSINT phụ thuộc lẫn nhau nhiều (ScoringService ← ObservationService ← CandidateService...); tách module → circular dependency phức tạp.
**Đã loại bỏ:** Tách thành osint-source module, osint-processing module, osint-review module — gây circular import khó debug.

### [2026-05] BullMQ thay vì Bull (cũ)
**Quyết định:** `@nestjs/bullmq` + `bullmq`
**Lý do:** BullMQ hỗ trợ NestJS 11 tốt hơn; TypeScript native; concurrency kiểm soát tốt hơn; Bull (ioredis-based) đang trong maintenance mode.
**Đã loại bỏ:** Bull — cũ, không được maintain tích cực; `@nestjs/bull` không tương thích tốt với NestJS 11.

### [2026-05] axios + cheerio thay vì Puppeteer
**Quyết định:** `axios` (HTTP) + `cheerio` (HTML parsing)
**Lý do:** Đủ dùng cho static HTML và RSS ở Phase 1; nhẹ hơn nhiều so với Puppeteer; không cần Chrome headless.
**Đã loại bỏ:** Puppeteer — quá nặng, cần Chromium, overkill cho Phase 1. Sẽ xem xét lại nếu nguồn dùng JavaScript rendering.

### [2026-05] CrawlRule + ParseRule lưu dưới dạng JSONB thay vì bảng riêng
**Quyết định:** `JSONB` column trong `OsintSource`
**Lý do:** Schema của rule khác nhau hoàn toàn giữa RSS/HTML/API; nếu tách thành bảng riêng cần 3 bảng + join phức tạp; JSONB cho phép validate schema ở application layer.
**Đã loại bỏ:** Bảng riêng `osint_crawl_rule` với các nullable column — quá nhiều null, khó maintain; polymorphic table pattern — quá phức tạp cho team junior.

### [2026-05] rawPayload là bất biến
**Quyết định:** Không có PATCH endpoint, không có `@UpdateDateColumn` trên rawPayload
**Lý do:** Nghị định 13/2023/NĐ-CP yêu cầu dữ liệu gốc không được sửa; audit trail cần dữ liệu gốc để verify; observation versioning cho phép reparse mà không cần sửa raw.
**Đã loại bỏ:** Cho phép cập nhật rawPayload với audit log — nguy cơ pháp lý; khó chứng minh tính toàn vẹn dữ liệu.

### [2026-05] Tích hợp OsintReviewItem vào OsintCandidate
**Quyết định:** Review fields (reviewPriority, assignedTo, reviewNote...) nằm trực tiếp trong `OsintCandidate`
**Lý do:** 1:1 relationship giữa ReviewItem và Candidate → không cần entity riêng; giảm join; đơn giản hóa queries.
**Đã loại bỏ:** Entity `OsintReviewItem` riêng — tạo "2 nguồn truth" cho trạng thái review, dễ gây không đồng bộ.

### [2026-05] /osint/reviews là VIEW lên Candidate, không phải endpoint riêng
**Quyết định:** `/osint/reviews` chỉ là alias với filter mặc định `status=pending`, sort theo priority
**Lý do:** Không có entity riêng → không cần controller riêng thực sự; giảm duplicate business logic.
**Đã loại bỏ:** Controller riêng với business logic riêng — duplicate code, 2 nơi cần update khi thay đổi.

### [2026-05] Observation versioning thay vì overwrite
**Quyết định:** Tạo observation mới khi reparse (`version + 1`, `isLatest = true`)
**Lý do:** Giữ lịch sử parse để audit; analyst có thể so sánh kết quả parse với rule cũ vs mới; pháp lý.
**Đã loại bỏ:** Overwrite observation hiện tại — mất lịch sử, không thể rollback.

### [2026-05] Confidence = 3 thành phần (source + extraction + merge)
**Quyết định:** `sourceCredibility × 0.4 + extractionConfidence × 0.6 = mergeConfidence`
**Lý do:** Tách source quality (admin control) khỏi data quality (NLP/geocode quality); trọng số 40/60 phản ánh thực tế: dữ liệu tốt từ nguồn kém vẫn hữu ích hơn dữ liệu rỗng từ nguồn uy tín.
**Đã loại bỏ:** 1 confidence score duy nhất — không phân biệt được nguồn gốc sự tin cậy thấp; confidence = average — không đủ nuanced.

### [2026-05] Dedupe 3 levels với semantic duplicate dùng PostGIS
**Quyết định:** Level 1 (exact same source) → Level 2 (cross-source hash) → Level 3 (spatial+time+category)
**Lý do:** False positive trong ANTT có hậu quả vận hành thực; Level 3 cần 500m + 2h + cùng category để đủ chắc là cùng sự kiện.
**Đã loại bỏ:** Chỉ dùng title similarity (cosine/Levenshtein) — tiếng Việt có nhiều từ đồng nghĩa, tỷ lệ false positive cao; không dùng spatial — 2 vụ cướp ở cùng phường trong 2h vẫn có thể là 2 sự kiện khác nhau.

### [2026-05] Auto-pause sau 5 consecutive failures
**Quyết định:** Ngưỡng = 5 lần fail liên tiếp
**Lý do:** Tránh system âm thầm mất dữ liệu khi nguồn down; 5 lần đủ để loại bỏ lỗi tạm thời (network blip, timeout) mà không bị pause quá sớm.
**Đã loại bỏ:** Pause ngay sau 1 lần fail — quá nhạy, gây nhiều false alarm; không auto-pause — nguồn có thể down nhiều ngày mà không ai biết.

---

## Database / Schema

### [2026-05] synchronize: true chỉ ở dev, tắt ở production
**Quyết định:** `synchronize: false` trong production config
**Lý do:** TypeORM synchronize có thể DROP column khi đổi tên — nguy hiểm với data production.
**Hành động:** Dùng migration files cho mọi schema change ở production.

### [2026-05] UUID cho tất cả PK thay vì auto-increment integer
**Quyết định:** `@PrimaryGeneratedColumn('uuid')`
**Lý do:** Dễ merge data từ nhiều nguồn; không expose business logic qua sequential ID; phù hợp với distributed system sau này.
**Đã loại bỏ:** Integer auto-increment — dễ enumerate, lộ thông tin business qua ID gap.

### [2026-05] Index composite cho incident (ma_xa + incidentTypeCode)
**Quyết định:** `@Index(['ma_xa', 'incidentTypeCode'])`
**Lý do:** Query pattern phổ biến nhất: thống kê theo xã + loại; composite index cover cả 2 column.
**Xem:** `src/modules/incidents/entities/incident.entity.ts`

---

## Chưa quyết định (cần thảo luận)

- **Auth system:** JWT stateless hay session? Role enforcement ở middleware hay guard?
- **Redis:** Dùng cho BullMQ queue và/hoặc metrics cache (TTL 5 phút)?
- **Geocoding provider:** Nominatim (OpenStreetMap, free) hay Google Maps API (có phí, chính xác hơn)?
- **Alert delivery:** Email hay webhook? Cần config per admin hay global?
- **Puppeteer (Phase 2):** Khi nào cần xử lý trang dùng JavaScript rendering?
