---
name: antt-gis-ops
description: Phát triển năng lực PostGIS và GeoJSON cho ANTT. Dùng khi Codex cần thêm hoặc refactor spatial filter, layer tỉnh xã, hotspot, heatmap, reverse geocode, FeatureCollection, hoặc logic GIS khác trong antt-khanh-hoa.
---

# ANTT GIS Ops

## Overview

Xem GIS là spatial read layer bọc quanh incident và administrative unit. Giữ kết quả trả về dưới dạng GeoJSON hoặc metadata rõ ràng để dashboard và phân tích tiêu thụ trực tiếp.

## Workflow

1. Đọc `src/modules/gis/gis.service.ts`, `gis.controller.ts`, các file trong `src/modules/gis/queries`, `src/modules/gis/mappers`, `src/modules/gis/utils`, và `references/gis-patterns.md`.
2. Giữ `location` ở chuẩn `SRID 4326` và tái sử dụng `applyIncidentFilters` cho `bbox`, `radius`, `polygon`, `intersectsWard`.
3. Trả về GeoJSON bằng mapper hoặc utility có sẵn thay vì tự ráp JSON thủ công.
4. Dùng raw SQL cho PostGIS khi biểu thức không gian rõ ràng hơn hoặc hiệu quả hơn QueryBuilder thông thường.
5. Khi thêm layer mới, cập nhật `getGisLayers()` và shape response ổn định để frontend hoặc dashboard có thể tự khám phá.

## Quy Tắc

- Giữ spatial filter dùng chung ở `incident-query.builder.ts` nếu nhiều module cần.
- Aggregate trước rồi mới join boundary khi dựng hotspot hoặc choropleth.
- Giữ contract `Feature` hoặc `FeatureCollection` nhất quán.
- Ưu tiên boundary từ `wards` hoặc `province` thay vì hard-code geometry.

## Repo Anchors

- `src/modules/gis/gis.service.ts`
- `src/modules/gis/gis.controller.ts`
- `src/modules/gis/queries`
- `src/modules/gis/mappers/incident-geojson.mapper.ts`
- `src/modules/gis/utils/geojson-response.util.ts`
- `src/common/query-builders/incident-query.builder.ts`
- `src/modules/administrative_unit`

## Checklist

- Nêu filter không gian mới hoặc layer mới nằm ở đâu.
- Nêu contract GeoJSON trả về.
- Nêu query PostGIS hoặc helper nào được tái sử dụng.
- Nêu test nào kiểm tra bbox, polygon, radius hoặc hotspot.
