# /osint-pipeline — Hiển thị trạng thái OSINT pipeline

Snapshot nhanh tiến độ build OSINT module, giúp biết làm gì tiếp theo.

## Cách dùng

```
/osint-pipeline
```

## Việc cần làm khi thực thi

1. **Đọc** `.claude/docs/osint-architecture.md` (mục 12 — Trạng thái hiện tại)
2. **Scan** `src/modules/osint/` để kiểm tra file nào đã có

3. **Kiểm tra từng hạng mục:**

### Entities (5 entities)
```bash
find src/modules/osint/entities -name "*.entity.ts" | sort
```

### Enums (7 enums theo spec)
```bash
find src/modules/osint/enums -name "*.ts" | sort
```

### Services, Controllers, Workers, Scrapers, Processors, Scheduler
```bash
find src/modules/osint -name "*.ts" -not -path "*/entities/*" -not -path "*/enums/*" -not -path "*/types/*" -not -path "*/dto/*" | sort
```

### Package dependencies
```bash
cat package.json | grep -E "bullmq|cheerio|@nestjs/schedule"
```

4. **Output dạng checklist:**

```
=== OSINT Pipeline Status ===

ENTITIES (5/5)
✅ osint-source.entity.ts
✅ osint-run.entity.ts
✅ osint-raw-event.entity.ts
✅ osint-observation.entity.ts
✅ osint-candidate.entity.ts

ENUMS (5/7)
✅ osint-source-type.enum.ts
✅ osint-source-status.ts
✅ osint-run-status.enum.ts
✅ osint-observation-status.ts
✅ osint-cadidate-status.enum.ts
❌ osint-raw-event-status.enum.ts   ← THIẾU
❌ osint-candidate-decision.enum.ts ← THIẾU

CONSTANTS (0/2)
❌ confidence.constant.ts
❌ dedupe.constant.ts

SERVICES (0/10)
❌ osint-source.service.ts
... (list all)

CONTROLLERS (0/8)
... (list all)

WORKERS (0/3)
... (list all)

PACKAGES
❌ bullmq chưa cài
❌ cheerio chưa cài

=== Gợi ý bước tiếp theo ===
1. Thêm enum OsintRawEventStatus (bị thiếu)
2. Cài packages: npm install @nestjs/bullmq bullmq axios cheerio @nestjs/schedule
3. Tạo constants/confidence.constant.ts và constants/dedupe.constant.ts
4. Bắt đầu service: osint-source.service.ts (ít dependency nhất)
```

## Sau khi hiển thị

Hỏi: "Bạn muốn bắt đầu từ hạng mục nào?" rồi đợi chỉ thị.
