# Architecture Map

## Lõi hiện tại

- `incidents`: canonical fact store, CRUD, search, soft delete, provenance.
- `analytics`: grouped stats, trend, compare, heatmap trên incident.
- `gis`: GeoJSON, reverse geocode, hotspot, spatial filtering.
- `dashboard`: payload tổng hợp cho operator UI.
- `administrative_unit`: province và ward geometry.

## Luồng dữ liệu hiện tại

1. Incident intake ghi vào bảng `incident`.
2. Shared filter ở `src/common/query-builders/incident-query.builder.ts` cấp lại cho `incidents`, `analytics`, `gis`, `dashboard`.
3. `analytics` và `gis` đọc từ incident để tạo read model.
4. `dashboard` tổng hợp output đã curate từ analytics hoặc GIS.

## Lớp nên mở rộng tiếp

- `osint`: source registry, raw capture, normalized observation, incident candidate.
- `forecast`: feature computation, baseline model hoặc scoring, forecast read model.
- `alert`: rule evaluation, dedupe hoặc suppression, delivery log, acknowledgement.

## Quy tắc dependency

- `osint` có thể đề xuất hoặc ghi vào `incident`.
- `forecast` đọc từ `incident`, `analytics`, `gis`.
- `alert` đọc từ `analytics`, `forecast`, và có thể từ `osint`.
- `dashboard` đọc output đã curate từ `analytics`, `gis`, `forecast`, `alert`.

## Heuristic đặt code

- Nếu đổi shape canonical của sự vụ, đặt ở `incidents`.
- Nếu thêm aggregation hoặc compare chung, đặt ở `analytics`.
- Nếu thêm geometry, layer, GeoJSON, reverse geocode, đặt ở `gis`.
- Nếu thêm widget composite cho UI, đặt ở `dashboard`.
- Nếu có scheduler, source adapter, hoặc persistence riêng theo lifecycle, tạo module mới.
