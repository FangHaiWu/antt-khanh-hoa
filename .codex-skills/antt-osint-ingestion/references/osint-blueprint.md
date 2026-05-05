# OSINT Blueprint

## Module đề xuất

- `src/modules/osint/osint.module.ts`
- `src/modules/osint/entities/osint-source.entity.ts`
- `src/modules/osint/entities/osint-raw-event.entity.ts`
- `src/modules/osint/entities/osint-observation.entity.ts`
- `src/modules/osint/entities/osint-run.entity.ts`
- `src/modules/osint/adapters/*`
- `src/modules/osint/parsers/*`

## Pipeline đề xuất

1. Đăng ký nguồn trong `osint_source`.
2. Thu raw payload và lưu immutable vào `osint_raw_event`.
3. Parse ra `osint_observation` có timestamp, location hint, event type hint, text summary.
4. Tính `sourceCredibility`, `extractionConfidence`, `mergeConfidence`.
5. Merge vào `incident` khi confidence đủ cao; ngược lại đưa vào review queue.

## Schema observation tối thiểu

- `sourceId`
- `externalEventId`
- `sourceUrl`
- `capturedAt`
- `observedAt`
- `headline`
- `body`
- `locationText`
- `lat` hoặc `lng` nếu parse được
- `candidateIncidentTypeCode`
- `confidence`

## Quy tắc chất lượng

- Không bỏ raw payload sau khi parse.
- Tạo fingerprint bằng `sourceId + externalEventId` hoặc hash nội dung.
- Không unit test bằng live scraping; dùng fixture payload chụp sẵn.
