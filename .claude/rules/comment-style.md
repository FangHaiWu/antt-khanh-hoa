# Rule: Comment Style

## Bắt buộc — Header file

Mỗi file TypeScript trong dự án phải có comment ngắn ở đầu (2-3 dòng):

```typescript
// <tên file>
// Mục đích: <1 câu mô tả file làm gì>
// Được gọi bởi / Phụ thuộc: <ai gọi file này, hoặc file này dùng gì>
```

**Ví dụ đúng:**
```typescript
// osint-scoring.service.ts
// Tính 3 loại confidence (sourceCredibility, extractionConfidence, mergeConfidence) cho Observation.
// Được gọi bởi: EnrichWorker sau khi geocode xong, và ObservationService khi analyst sửa tay.
```

```typescript
// crawl.worker.ts
// Bull worker xử lý job từ queue osint.crawl: fetch HTML/RSS/API → lưu OsintRawEvent → enqueue parse job.
// Phụ thuộc: ScraperFactory, OsintRawEventService, OsintRunService.
```

---

## Bắt buộc — Comment giải thích WHY

Thêm comment khi:
- Logic không hiển nhiên từ tên hàm/biến
- Có constraint hoặc invariant ẩn
- Workaround cho bug hoặc limitation của thư viện
- Công thức tính toán (confidence, dedupe key...)
- Business rule quan trọng

**Không comment** khi tên đã nói rõ:
```typescript
// SAI — comment thừa, xóa đi
// Lấy source theo id
const source = await this.sourceRepo.findOne({ where: { id } });

// SAI — comment lại những gì code đã nói
// Kiểm tra xem status có phải ACTIVE không
if (source.status === OsintSourceStatus.ACTIVE) { ... }
```

**Đúng — giải thích constraint không hiển nhiên:**
```typescript
// Không xóa cứng nếu đã có raw events — giữ audit trail theo Nghị định 13/2023/NĐ-CP
if (rawEventCount > 0) {
  source.status = OsintSourceStatus.DISABLED;
} else {
  await this.sourceRepo.remove(source);
}

// payloadHash normalize trước khi hash: sort key + trim — đảm bảo cùng content, khác thứ tự key vẫn detect được
const normalized = JSON.stringify(sortKeys(payload)).replace(/\s+/g, ' ').trim();
const hash = crypto.createHash('sha256').update(normalized).digest('hex');

// finishedAt null có 2 nghĩa: đang chạy HOẶC bị kill bất ngờ (process crash)
// Dùng thêm status để phân biệt — null + status=RUNNING là đang chạy
if (!run.finishedAt && run.status !== OsintRunStatus.RUNNING) {
  // run bị kill — cần alert admin
}
```

---

## Công thức và business rule — luôn comment

```typescript
// mergeConfidence = sourceCredibility × 0.4 + extractionConfidence × 0.6
// Trọng số 40/60: data quality (extraction) quan trọng hơn source reputation
// Ngưỡng: >= 0.8 → auto_merge, 0.5-0.79 → needs_review, < 0.5 → rejected
const mergeConfidence = sourceCredibility * 0.4 + extractionConfidence * 0.6;

// dedupeKey: group candidate trước khi kiểm tra spatial (level 3)
// floor(observedAt / 2h) → candidate trong cùng 2 giờ có cùng key
const dedupeKey = sha256(`${incidentCategoryCode}|${wardCode}|${Math.floor(observedAt / 7200000)}`);
```

---

## Comment tiếng Anh vs tiếng Việt

- **Tiếng Việt:** business logic, domain rules, lý do quyết định kiến trúc
- **Tiếng Anh:** TypeScript type annotations, JSDoc nếu cần (optional)
- Không mix trong cùng 1 comment block

---

## Không được làm

```typescript
// SAI — comment nhiều dòng không cần thiết
/**
 * Hàm này nhận vào một source và trả về thông tin source đó.
 * Nó sử dụng repository để tìm kiếm trong database.
 * @param id - ID của source
 * @returns OsintSource object
 */
async findById(id: string): Promise<OsintSource> { ... }

// ĐÚNG — không cần comment, tên hàm đã rõ
async findById(id: string): Promise<OsintSource> { ... }
```
