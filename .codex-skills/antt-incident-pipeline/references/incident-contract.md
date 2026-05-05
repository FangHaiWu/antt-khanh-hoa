# Incident Contract

## Invariant hiện có

- `incidentTypeId` là foreign key canonical.
- `incidentCategoryCode`, `incidentTypeCode`, `incidentSubtypeCode` là field denormalized để query nhanh.
- `ma_xa` là ward key, phải map được sang `Ward`.
- `incidentTime` phải được normalize về `Date`.
- `location` chỉ tạo khi có đủ `lat` và `lng`, giữ ở chuẩn `Point` và `SRID 4326`.
- `sourceType` và `sourceUrl` là provenance tối thiểu.

## Khi thêm field mới

1. Cập nhật entity.
2. Cập nhật `CreateIncidentDto` hoặc `UpdateIncidentDto`.
3. Cập nhật mapping trong `IncidentsService`.
4. Cập nhật search filter nếu field đó dùng để truy vấn.
5. Cập nhật response hoặc serializer nếu client cần field mới.
6. Thêm test cho save path và validate path.

## Khi thêm filter mới

- Thêm field vào `SearchIncidentDto`.
- Cài filter một lần ở `applyIncidentFilters`.
- Kiểm tra module `analytics`, `gis`, `dashboard` có nên tái sử dụng filter đó không.

## Các file quan trọng

- `src/modules/incidents/entities/incident.entity.ts`
- `src/modules/incidents/dto/create-incident.dto.ts`
- `src/modules/incidents/dto/update-incident.dto.ts`
- `src/modules/incidents/dto/search-incident.dto.ts`
- `src/modules/incidents/incidents.service.ts`
- `src/common/query-builders/incident-query.builder.ts`
