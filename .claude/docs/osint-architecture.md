# OSINT Feature Architecture — antt-khanh-hoa (Spec v2.0)

> Đọc file này TRƯỚC KHI làm bất kỳ task nào liên quan module OSINT.
> Nguồn gốc: OSINT-Feature-Architecture.pdf (29 trang), đã được biên tập lại để dễ tra cứu khi code.

---

## 1. Mục tiêu

Xây pipeline nhận dữ liệu công khai từ nhiều nguồn, chuẩn hóa thành dữ liệu có cấu trúc, chấm điểm độ tin cậy, dedupe, rồi:
- **Tự động tạo/cập nhật incident** khi đủ điều kiện (`mergeConfidence >= 0.8`)
- **Đưa vào hàng chờ duyệt** nếu dữ liệu chưa đủ chắc (0.5 ≤ confidence < 0.8)
- **Bỏ qua** nếu confidence < 0.5

Pháp lý: Nghị định 13/2023/NĐ-CP — raw data bất biến và audit log là yêu cầu pháp lý.

---

## 2. Pipeline tổng thể

```
Admin cấu hình source (status=draft → active)
  ↓
Scheduler (mỗi N phút) — kiểm tra source đến hạn → enqueue crawl job vào osint.crawl queue
  ↓
CrawlWorker — fetch HTML/RSS/API → lưu OsintRawEvent (BẤT BIẾN)
  ↓
ParseWorker — parse rawPayload theo parseRule → tạo OsintObservation
  ↓
EnrichWorker — geocode locationText → lat/lng → map ward (PostGIS) → cập nhật wardCode
  ↓
ScoringService — tính 3 loại confidence (source, extraction, merge)
  ↓
DedupeService — kiểm tra trùng theo cluster (level 3)
  ↓
  ┌──────────────────────────────────────────┐
  │ mergeConfidence >= 0.8 AND đủ dữ liệu?  │
  └──────────────────────────────────────────┘
       YES → tạo Incident (auto-merge) + ghi audit
       NO (0.5-0.79) → tạo OsintCandidate → đưa vào review queue
       NO (< 0.5) → log lại, không tạo candidate
```

**4 business flows:**
1. **Auto flow** — happy path từ source đến incident tự động
2. **Manual review flow** — analyst duyệt candidate từ review queue
3. **Reparse flow** — admin cập nhật parseRule → trigger parse lại raw event cũ
4. **Source health auto-pause flow** — source fail >= 5 lần → tự động pause

---

## 3. Cấu trúc module NestJS

**Một `OsintModule` duy nhất** — không tách thành nhiều module để tránh circular dependency.

```
src/modules/osint/
├── osint.module.ts
├── controllers/
│   ├── osint-source.controller.ts
│   ├── osint-run.controller.ts
│   ├── osint-raw-event.controller.ts
│   ├── osint-observation.controller.ts
│   ├── osint-candidate.controller.ts
│   ├── osint-review.controller.ts         ← VIEW lên Candidate, không phải entity riêng
│   ├── osint-metrics.controller.ts
│   └── osint-integration.controller.ts
├── services/
│   ├── osint-source.service.ts
│   ├── osint-run.service.ts
│   ├── osint-raw-event.service.ts
│   ├── osint-observation.service.ts
│   ├── osint-candidate.service.ts
│   ├── osint-review.service.ts
│   ├── osint-metrics.service.ts
│   ├── osint-scoring.service.ts           ← tính confidence
│   ├── osint-dedupe.service.ts            ← kiểm tra trùng
│   └── osint-integration.service.ts       ← ghi vào Incident
├── workers/                               ← Bull queue consumers
│   ├── crawl.worker.ts
│   ├── parse.worker.ts
│   └── enrich.worker.ts
├── scrapers/                              ← Strategy pattern
│   ├── scraper.interface.ts
│   ├── rss-scraper.ts
│   ├── html-scraper.ts
│   └── scraper-factory.ts
├── processors/
│   ├── text-processor.ts                  ← keyword extraction, NLP, normalization
│   ├── geo-processor.ts                   ← geocoding, ward matching
│   └── classification.service.ts          ← map keyword → incidentType
├── schedulers/
│   └── osint-crawler.scheduler.ts         ← chỉ enqueue, không xử lý
├── entities/                              ← 5 entities
├── dto/
├── enums/
└── constants/
    ├── confidence.constant.ts             ← ngưỡng threshold
    └── dedupe.constant.ts                 ← window values
```

---

## 4. Queue Architecture (BullMQ)

| Queue | Job payload | Concurrency | Retry |
|---|---|---|---|
| `osint.crawl` | `{ sourceId, runId, since, until }` | 3 | 3 lần, exponential 1s/5s/30s |
| `osint.parse` | `{ rawEventId }` | 10 | 2 lần |
| `osint.enrich` | `{ observationId }` | 5 | 3 lần, delay 2s giữa requests (rate limit geocoding) |

---

## 5. Entities — 5 entities chính

### 5.1 OsintSource
```typescript
@Entity('osint_source')
// Cấu hình nguồn crawl. Admin quản lý. Scheduler đọc để enqueue job.
{
  id: uuid (PK)
  name: string (unique)
  sourceType: OsintSourceType         // RSS | HTML | API
  baseUrl: string
  crawlRule: CrawlRule (jsonb)        // schema crawl — xem mục 7
  parseRule: ParseRule (jsonb, null)  // schema parse — xem mục 7
  priority: number (default 5)        // 1 cao → 10 thấp
  credibilityWeight: float (0.0-1.0, default 0.5)  // dùng cho sourceCredibility
  crawlIntervalMinutes: number (default 30)
  crawlDelayMs: number (default 2000) // delay giữa requests tránh bị block IP
  status: OsintSourceStatus (default DRAFT)
  consecutiveFailureCount: number (default 0)  // auto-pause khi >= 5
  lastSuccessfulCheckpoint: timestamp (null)   // mốc incremental crawl
  autoDisabledAt: timestamp (null)
  createdAt, updatedAt
}
```

**Lưu ý quan trọng:**
- `crawlDelayMs` — mỗi nguồn cấu hình delay khác nhau vì ngưỡng chặn IP khác nhau
- `lastSuccessfulCheckpoint` — scheduler dùng để biết crawl từ đâu thay vì crawl lại từ đầu
- `consecutiveFailureCount` — reset về 0 khi run success, tăng +1 mỗi run fail

### 5.2 OsintRun
```typescript
@Entity('osint_run')
// Ghi lại mỗi lần crawl. Bull worker tạo khi nhận job, cập nhật metrics khi xử lý.
{
  id: uuid (PK)
  sourceId: string (FK → OsintSource, CASCADE)
  source: OsintSource
  status: OsintRunStatus (default QUEUED)
  jobId: string (null)               // Bull job ID — dùng để cancel
  startedAt: timestamp
  finishedAt: timestamp (null)       // null = đang chạy hoặc bị kill
  since: timestamp (null)            // crawl từ thời điểm này
  until: timestamp (null)            // crawl đến thời điểm này
  itemsFound: number (default 0)     // tổng items lấy được (trước dedupe)
  itemsCreated: number (default 0)   // số RawEvent INSERT (sau dedupe)
  itemsSkipped: number (default 0)   // bị bỏ qua vì trùng
  totalParsed: number (default 0)
  totalDuplicate: number (default 0)
  totalCandidate: number (default 0)
  totalAutoMerged: number (default 0)
  totalQueued: number (default 0)    // số vào review queue
  errorMessage: text (null)          // chỉ có giá trị khi status = FAILED
  errorDetail: jsonb (null)          // stack trace, request info
  createdAt
}
```

### 5.3 OsintRawEvent — BẤT BIẾN
```typescript
@Entity('osint_raw_event')
@Index(['sourceId', 'externalEventId'], { unique: true })  // dedupe level 1
@Index(['payloadHash'])                                     // dedupe level 2
// Lưu dữ liệu thô từ nguồn. KHÔNG BAO GIỜ SỬA sau khi lưu.
{
  id: uuid (PK)
  sourceId: string (FK → OsintSource)
  runId: string (null, FK → OsintRun)
  externalEventId: string (null)     // ID từ nguồn: link bài, guid RSS
  sourceUrl: string
  capturedAt: timestamp              // thời điểm crawler lấy được
  payloadHash: string (unique)       // SHA-256(rawPayload normalized) — dedupe cross-source
  rawPayload: jsonb                  // KHÔNG có @UpdateDateColumn — enforce immutability
  status: OsintRawEventStatus (default RECEIVED)
  createdAt
}
```

**Bất biến được enforce bằng:**
- Không có PATCH endpoint cho raw event
- `rawPayload` không có `@UpdateDateColumn`
- Service không expose method `updateRawPayload`

**payloadHash:** SHA-256 của toàn bộ rawPayload sau khi normalize (sort key, trim whitespace). Dùng để phát hiện cùng bài đăng trên 2 nguồn khác nhau.

### 5.4 OsintObservation — có versioning
```typescript
@Entity('osint_observation')
// Kết quả parse + enrich từ 1 raw event. Hỗ trợ versioning khi reparse.
{
  id: uuid (PK)
  rawEventId: string (FK → OsintRawEvent)
  version: number (default 1)
  parentObservationId: string (null) // observation version trước
  isLatest: boolean (default true)   // chỉ 1 observation mới nhất per rawEvent
  // Nội dung đã parse
  headline: string (null)
  body: text (null)
  observedAt: timestamp (null)
  locationText: string (null)        // địa chỉ text trích xuất được
  lat: float (null)
  lng: float (null)
  wardCode: string (null)            // ma_xa sau khi map sang ward
  candidateIncidentTypeCode: string (null)
  candidateIncidentSubtypeCode: string (null)
  extractedKeywords: jsonb (null)
  // Confidence scores
  sourceCredibility: float (default 0)
  extractionConfidence: float (default 0)
  mergeConfidence: float (default 0)
  status: OsintObservationStatus (default DRAFT)
  enrichedAt: timestamp (null)
  createdAt, updatedAt
}
```

**Reparse flow (tạo version mới):**
1. rawPayload bất biến — không thay đổi
2. Chạy lại parse logic với rule mới
3. `WHERE rawEventId = ? AND isLatest = true` → set `isLatest = false` trên version cũ
4. Tạo observation mới: `version = old.version + 1`, `parentObservationId = old.id`, `isLatest = true`
5. Tính lại confidence
6. Nếu candidate đang pending → tính lại mergeConfidence → cập nhật quyết định

### 5.5 OsintCandidate — tích hợp review workflow
```typescript
@Entity('osint_candidate')
// Candidate chờ duyệt hoặc đã được xử lý. Tích hợp review fields (không tách entity riêng).
{
  id: uuid (PK)
  observationId: string (FK → OsintObservation)
  incidentId: string (null)          // FK sang Incident sau khi merge
  // Dedupe
  dedupeKey: string (null, @Index)   // SHA-256(incidentCategoryCode + wardCode + floor(observedAt/2h))
  clusterId: string (null)           // UUID nhóm các candidate cùng sự kiện
  // Decision
  decision: OsintCandidateDecision (default PENDING)
  decisionReason: text (null)
  status: OsintCandidateStatus (default PENDING)
  // Auto-merge tracking
  autoMergedAt: timestamp (null)
  mergedBy: string (null)            // 'system' hoặc userId
  // Review fields
  reviewPriority: 'low' | 'medium' | 'high' (null)
  reviewReason: text (null)
  assignedTo: string (null)          // userId được assign
  reviewedAt: timestamp (null)
  reviewNote: text (null)
  reviewedBy: string (null)
  createdAt, updatedAt
}
```

---

## 6. Enums — 7 enums

```typescript
enum OsintSourceType    { RSS = 'rss', HTML = 'html', API = 'api' }

enum OsintSourceStatus  { DRAFT = 'draft', ACTIVE = 'active', PAUSED = 'paused', DISABLED = 'disabled' }

enum OsintRunStatus     { QUEUED = 'queued', RUNNING = 'running',
                          PARTIAL_SUCCESS = 'partial_success', SUCCESS = 'success',
                          FAILED = 'failed', CANCELLED = 'cancelled' }

enum OsintRawEventStatus { RECEIVED = 'received', PARSED = 'parsed',
                           PARSE_FAILED = 'parse_failed', DUPLICATE = 'duplicate',
                           ARCHIVED = 'archived' }

enum OsintObservationStatus { DRAFT = 'draft', NORMALIZED = 'normalized',
                               ENRICHED = 'enriched', VALIDATED = 'validated',
                               NEEDS_REVIEW = 'needs_review', REJECTED = 'rejected' }

enum OsintCandidateDecision { PENDING = 'pending', AUTO_MERGED = 'auto_merged',
                               APPROVED = 'approved', REJECTED = 'rejected',
                               LINKED_EXISTING = 'linked_existing_incident',
                               DUPLICATE = 'duplicate_clustered' }

enum OsintCandidateStatus   { PENDING = 'pending', IN_REVIEW = 'in_review',
                               RESOLVED = 'resolved', ESCALATED = 'escalated',
                               CLOSED = 'closed' }
```

---

## 7. Schema CrawlRule và ParseRule (JSONB)

### CrawlRule
```typescript
interface CrawlRule {
  type: 'RSS' | 'HTML' | 'API';

  // HTML only
  listSelector?: string;     // CSS selector danh sách bài: 'article.item-news'
  titleSelector?: string;    // CSS selector tiêu đề: 'h3.title-news a'
  contentSelector?: string;
  linkSelector?: string;
  dateSelector?: string;
  dateFormat?: string;       // 'DD/MM/YYYY HH:mm' — dayjs format

  // API only
  endpoint?: string;         // path sau baseUrl: '/api/v1/posts'
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  bodyTemplate?: object;

  // Pagination (HTML + API)
  pagination?: {
    type: 'page_param' | 'cursor' | 'none';
    param?: string;          // 'page', 'p'
    cursorPath?: string;     // JSONPath đến cursor trong response
    maxPages?: number;       // default 5
    startPage?: number;      // default 1
  };
}

// Ví dụ thực tế — baokhanhhoa.vn:
const baoKhanhHoaRule: CrawlRule = {
  type: 'HTML',
  listSelector: 'article.item-news',
  titleSelector: 'h3.title-news a',
  contentSelector: 'div.fck_detail',
  linkSelector: 'h3.title-news a',
  dateSelector: 'span.time-public',
  dateFormat: 'DD/MM/YYYY HH:mm',
  pagination: { type: 'page_param', param: 'trang', maxPages: 3 },
};
```

### ParseRule
```typescript
interface ParseRule {
  titleField: string;        // field trong rawPayload chứa tiêu đề
  bodyField: string;         // field chứa nội dung
  dateField: string;         // field chứa thời gian
  locationField?: string;    // field chứa vị trí (nếu có)
  eventIdField?: string;     // field chứa ID sự kiện

  locationPatterns?: string[];   // regex pattern trích xuất địa điểm từ text
  // Ví dụ: ['tại {location}', 'ở {location}', 'đường {location}']

  incidentTypeKeywords?: Record<string, string[]>;
  // Map incidentTypeCode → keywords:
  // { 'CUOP_GIAT': ['cướp', 'giật dây chuyền'], 'TNGT': ['tai nạn', 'va chạm xe'] }

  locationAliases?: Record<string, string>;
  // Chuẩn hóa địa danh trước khi match ward:
  // { 'TP Nha Trang': 'Thành phố Nha Trang', 'TX Cam Ranh': 'Thị xã Cam Ranh' }

  dateExtractionPatterns?: string[];
  // Trích xuất thời gian từ nội dung nếu không có date field:
  // ['sáng nay', 'chiều qua', 'tối ngày {date}']
}
```

**Validation khi tạo/cập nhật source:**
- CrawlRule type=HTML: `listSelector`, `titleSelector`, `linkSelector` là required
- CrawlRule type=HTML: `dateFormat` phải là dayjs-compatible format
- CrawlRule type=API: `endpoint` là required
- ParseRule: mỗi code trong `incidentTypeKeywords` phải tồn tại trong bảng `incident_type`
- ParseRule: mỗi pattern trong `locationPatterns` phải chứa placeholder `{location}`
- Fail → HTTP 422 với details field nào sai

---

## 8. Business Rules chi tiết

### 8.1 Công thức tính confidence

**sourceCredibility** (lấy từ source, không tính động):
```
sourceCredibility = source.credibilityWeight  // admin set
// Gợi ý: baokhanhhoa.vn → 0.90, vnexpress/tuoitre → 0.80,
//         báo địa phương khác → 0.65, Facebook group → 0.40
```

**extractionConfidence** (tính sau parse + enrich):
```
+0.25  nếu observedAt hợp lệ (không null, không future)
+0.20  nếu lat/lng có giá trị (đã geocode)
+0.15  nếu locationText không null (dù chưa geocode)
+0.25  nếu candidateIncidentTypeCode không null
+0.10  nếu wardCode không null (đã map được ward)
+0.05  nếu body.length >= 100 ký tự
max = 1.0
```

**mergeConfidence** (quyết định auto-merge hay không):
```
mergeConfidence = (sourceCredibility × 0.4) + (extractionConfidence × 0.6)

Ngưỡng:
>= 0.80  → auto_merge (tạo incident tự động)
0.50-0.79 → needs_review (tạo candidate, đưa vào review queue)
< 0.50   → rejected (không tạo candidate, chỉ log)
```

### 8.2 Dedupe — 3 levels

**Level 1 — Exact duplicate (cùng nguồn):**
- Điều kiện: `sourceId + externalEventId` trùng
- Xử lý: UNIQUE INDEX → không INSERT, status = duplicate

**Level 2 — Cross-source exact duplicate:**
- Điều kiện: `payloadHash` trùng
- Xử lý: không INSERT raw event mới, status = duplicate

**Level 3 — Semantic duplicate (cùng sự kiện, khác nguồn):**
- Điều kiện: TẤT CẢ 3 điều sau đúng:
  - `|observedAt_A - observedAt_B| <= 2 giờ`
  - `ST_DWithin(location_A, location_B, 500)` — 500 mét, dùng PostGIS
  - `incidentCategoryCode_A == incidentCategoryCode_B`
- Xử lý: cùng `clusterId`
  - Candidate đầu tiên trong cluster: `status = pending`
  - Candidate sau trong cluster: `decision = duplicate_clustered`
  - Merge enrichment từ tất cả vào candidate chính của cluster

**dedupeKey:** `SHA-256(incidentCategoryCode + wardCode + floor(observedAt / 2h))` — dùng để group nhanh trước khi kiểm tra spatial.

### 8.3 Auto-merge — điều kiện đầy đủ

Auto-merge xảy ra khi TẤT CẢ điều kiện sau thỏa mãn:
1. `mergeConfidence >= 0.80`
2. `observedAt` hợp lệ (không null, không future, không quá 7 ngày)
3. `wardCode` không null (phải map được địa bàn)
4. `candidateIncidentTypeCode` không null
5. Không trùng `clusterId` với incident đã tồn tại trong 2 giờ gần nhất

Khi auto-merge:
- Tạo Incident với `sourceType = 'BAO_CHI'` (hoặc `OSINT`)
- Ghi provenance: `{ candidateId, observationId, rawEventId, sourceId }`
- `candidate.decision = auto_merged`, `candidate.mergedBy = 'system'`
- `rawEvent.status = parsed`, `observation.status = validated`

### 8.4 Source health — auto-pause

```
Mỗi run fail: consecutiveFailureCount += 1
Nếu consecutiveFailureCount >= 5:
  source.status = paused
  source.autoDisabledAt = now()
  → Gửi alert đến admin (email hoặc webhook)
  → Ghi audit log: "Source auto-paused after 5 consecutive failures"

Khi run success:
  consecutiveFailureCount = 0
  autoDisabledAt = null (nếu trước đó bị auto-pause và đã manual resume)
  lastSuccessfulCheckpoint = run.until
```

### 8.5 Incremental crawl — checkpoint

```
Khi scheduler tạo run:
  since = source.lastSuccessfulCheckpoint ?? (now - 24h)
  until = now

Crawler chỉ lấy bài trong [since, until].

Sau khi run success: lastSuccessfulCheckpoint = run.until
Sau khi run fail: lastSuccessfulCheckpoint KHÔNG cập nhật → lần sau retry từ cùng checkpoint
```

### 8.6 Vietnamese text normalization

Áp dụng trước khi lưu vào observation và khi matching:
1. Unicode NFC: `"Kha´nh Ho`a"` → `"Khánh Hòa"`
2. Trim whitespace thừa: `" Nha Trang "` → `"Nha Trang"`
3. Lowercase + remove diacritics — CHỈ dùng cho search/matching, KHÔNG lưu vào DB
4. Alias normalization (dùng `parseRule.locationAliases`)
5. Ward matching sau normalize:
   - Tìm `ward.ten_xa ILIKE '%{locationText}%'`
   - Hoặc dùng PostGIS: `ST_Contains(ward.geom, point)`

### 8.7 Alert suppression

Alert bắn khi:
- Incident được tạo từ OSINT (auto hoặc manual)
- `severity` của incidentType >= ngưỡng cấu hình

Suppression window: 30 phút (configurable per incidentType)
Dedupe key: `SHA-256(incidentCategoryCode + wardCode + floor(incidentTime / 30m))`

Logic:
- Kiểm tra cache (Redis hoặc DB) xem key này đã bắn trong 30 phút qua chưa
- Nếu rồi → bỏ qua
- Nếu chưa → bắn + lưu key vào cache với TTL = 30 phút

### 8.8 Observation versioning khi reparse

Reparse flow:
1. Đọc `rawEvent.rawPayload` (bất biến)
2. Chạy lại parse logic với rule mới
3. Tìm observation hiện tại: `WHERE rawEventId = ? AND isLatest = true`
4. Set `isLatest = false` trên observation cũ
5. Tạo observation mới: `version = old.version + 1`, `parentObservationId = old.id`, `isLatest = true`
6. Tính lại confidence
7. Nếu candidate đang pending → tính lại mergeConfidence → cập nhật quyết định

---

## 9. Roles và quyền

| Role | Quyền |
|---|---|
| `ADMIN` | Tạo/sửa/xóa/bật/tắt source; xem tất cả log, metrics, audit; retry/cancel run; cấu hình threshold |
| `ANALYST_OSINT` | Xem raw event, observation, candidate; sửa observation (ghi audit); approve/reject candidate; trigger reparse, enrich; bulk reject |
| `OPERATOR_ANTT` | Xem review queue; approve/reject candidate trong queue; xem confirmed incident từ OSINT; KHÔNG xem raw event, KHÔNG sửa observation |
| `SYSTEM` (internal) | Tự crawl, parse, enrich, dedupe, merge; tạo audit log cho mọi action |

---

## 10. API Endpoints tổng hợp

### /osint/sources
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | /osint/sources | Tạo source mới |
| GET | /osint/sources | Danh sách (filter: status, type, keyword) |
| GET | /osint/sources/:id | Chi tiết + recentRuns + metrics |
| PATCH | /osint/sources/:id | Cập nhật (không cho sửa nếu có run đang chạy) |
| DELETE | /osint/sources/:id | Xóa cứng nếu chưa có raw events, chuyển disabled nếu đã có |
| POST | /osint/sources/:id/activate | Validate crawlRule → status=active |
| POST | /osint/sources/:id/deactivate | Cancel run đang chạy → status=paused |

### /osint/runs
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | /osint/runs | Trigger crawl thủ công (source phải active) |
| GET | /osint/runs | Danh sách (filter: sourceId, status, date range) |
| GET | /osint/runs/:id | Chi tiết + rawEventSample (5 events đầu) |
| POST | /osint/runs/:id/retry | Tạo run MỚI với cùng since/until (không sửa run cũ) |
| POST | /osint/runs/:id/stop | Cancel run đang chạy |

### /osint/raw-events
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /osint/raw-events | Danh sách (không trả rawPayload trong list) |
| GET | /osint/raw-events/:id | Chi tiết đầy đủ |
| GET | /osint/raw-events/:id/payload | rawPayload nguyên trạng (cho analyst debug) |
| GET | /osint/raw-events/:id/history | rawEvent + tất cả observation versions + candidate + auditLogs |
| POST | /osint/raw-events/:id/reparse | Trigger reparse thủ công |

### /osint/observations
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /osint/observations | Danh sách (filter: sourceId, status, wardCode, isLatest, date range) |
| GET | /osint/observations/:id | Chi tiết + rawEvent (không rawPayload) + candidate + previousVersions |
| PATCH | /osint/observations/:id | Sửa nếu status != validated và role >= ANALYST_OSINT |
| POST | /osint/observations/:id/reparse | Parse lại từ raw event gốc |
| POST | /osint/observations/:id/enrich | Geocode + ward matching thủ công |

### /osint/candidates
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /osint/candidates | Danh sách (filter: status, decision, priority...) |
| GET | /osint/candidates/:id | Chi tiết + observation + rawEvent + incident + clusterMembers + auditLogs |
| POST | /osint/candidates/:id/approve | Tạo incident (gọi IncidentsService.create) |
| POST | /osint/candidates/:id/reject | Ghi lý do, không thể auto-merge lại |
| POST | /osint/candidates/:id/merge | Link vào incident có sẵn hoặc tạo mới |
| POST | /osint/candidates/:id/link-incident | Xác định candidate là cùng sự vụ với incident đã có |
| POST | /osint/candidates/bulk-reject | Reject nhiều candidate (max 100) |
| POST | /osint/candidates/bulk-assign | Assign nhiều candidate cho 1 analyst |

### /osint/reviews (VIEW lên Candidate)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /osint/reviews | Candidates cần review, sort theo priority |
| GET | /osint/reviews/:candidateId | Alias của GET /osint/candidates/:id |
| POST | /osint/reviews/:candidateId/approve | Alias của POST /osint/candidates/:id/approve |
| POST | /osint/reviews/:candidateId/reject | Alias |
| POST | /osint/reviews/:candidateId/request-edit | Reviewer yêu cầu analyst bổ sung |
| POST | /osint/reviews/:candidateId/escalate | Escalate lên cấp trên |

### /osint/metrics (nên cache Redis TTL 5 phút)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /osint/metrics/summary | Tổng quan: sources active, runs today, raw events today... |
| GET | /osint/metrics/coverage | Tỷ lệ geocoded, ward mapped, parse success |
| GET | /osint/metrics/duplicates | Tỷ lệ trùng, largestClusters |
| GET | /osint/metrics/source-performance | Per-source: fetchSuccessRate, parseSuccessRate, autoMergeRate |
| GET | /osint/metrics/latency | Thời gian trung bình giữa các bước (phút) |

### /osint/integrations
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /osint/integrations/incidents/:incidentId/provenance | Nguồn gốc OSINT của 1 incident |
| POST | /osint/integrations/alerts/dispatch | Internal endpoint — gọi từ worker sau auto-merge |

---

## 11. Response format chuẩn

```typescript
// Success đơn
interface SuccessResponse<T> { success: true; data: T; message?: string; }

// Success danh sách
interface ListResponse<T> { success: true; data: { items: T[]; page: number; limit: number; total: number; }; }

// Error
interface ErrorResponse { success: false; statusCode: number; message: string; error: string; details?: object; }
```

**Error codes:**
| Code | Khi nào |
|---|---|
| 400 | Input sai format, thiếu required field |
| 401 | Chưa xác thực |
| 403 | Không đủ quyền |
| 404 | Resource không tìm thấy |
| 409 | Trùng dữ liệu (name, externalEventId) |
| 422 | Rule không hợp lệ, confidence thấp, dữ liệu không đủ để merge, nguồn không active |
| 423 | Source hoặc run đang bị lock (có run đang chạy) |
| 429 | Rate limit (khi crawl) |
| 500 | Lỗi hệ thống |

---

## 12. Trạng thái hiện tại (tháng 5/2026)

### Đã có
- Entities: 5/5 (`osint-source`, `osint-run`, `osint-raw-event`, `osint-observation`, `osint-candidate`)
- Enums: 5/7 (thiếu `OsintRawEventStatus`, cần kiểm tra `OsintCandidateDecision`)
- Types: `CrawlRule`, `ParseRule`
- `osint.module.ts` — rỗng, chưa đăng ký gì

### Chưa có (theo thứ tự nên implement)
1. Constants: `confidence.constant.ts`, `dedupe.constant.ts`
2. Services: scoring, dedupe, source, run, raw-event, observation, candidate, review, metrics, integration
3. DTOs cho tất cả endpoints
4. Controllers
5. Scrapers: interface, rss-scraper, html-scraper, scraper-factory
6. Processors: text-processor, geo-processor, classification.service
7. Workers: crawl, parse, enrich
8. Scheduler: osint-crawler.scheduler

### Packages cần cài
```bash
npm install @nestjs/bullmq bullmq axios cheerio @nestjs/schedule
npm install -D @types/cheerio
```

### Bug đang có
`app.module.ts:12` — import path sai: `'./src/modules/osint/osint.module'` → `'./modules/osint/osint.module'`
