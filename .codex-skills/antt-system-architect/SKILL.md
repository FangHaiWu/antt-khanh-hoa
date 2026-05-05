---
name: antt-system-architect
description: Thiết kế và phân rã thay đổi kiến trúc cho nền tảng ANTT của dự án antt-khanh-hoa. Dùng khi Codex cần lập kế hoạch, scaffold hoặc refactor tính năng cắt ngang nhiều module như OSINT, forecast, dashboard, alert, shared DTO, query/filter chung, hoặc module NestJS mới đi qua incidents, analytics, gis và dashboard.
---

# ANTT System Architect

## Overview

Dùng skill này để map yêu cầu vào đúng ranh giới module trước khi sửa code. Xem `incidents`, `analytics`, `gis`, `dashboard` là lõi hiện tại; xem `osint`, `forecast`, `alert` là lớp mở rộng bọc quanh lõi đó.

## Workflow

1. Đọc `src/app.module.ts`, thư mục module liên quan, và `references/architecture-map.md`.
2. Quyết định yêu cầu thuộc mở rộng module cũ hay nên tách module mới. Chỉ giữ `incidents` cho dữ liệu sự vụ chuẩn hóa và CRUD lõi.
3. Chốt contract trước khi code: entity, DTO, controller route, service responsibility, và filter dùng chung trong `src/common/query-builders/incident-query.builder.ts`.
4. Tách write model khỏi read hoặc decision model. Để ingestion hoặc normalization ở tầng nguồn; để analytics, dashboard, forecast, alert ở tầng đọc và suy luận.
5. Gắn test ở đúng seam thay đổi: service test cho nghiệp vụ, controller test cho contract, seed hoặc test data khi mô hình dữ liệu thay đổi.

## Quy Tắc

- Tái sử dụng `incident` làm bản ghi sự kiện chuẩn; không tạo schema incident song song ở dashboard hoặc alert.
- Giữ logic filter không gian hoặc thời gian ở layer dùng chung khi nhiều module cần nó.
- Tạo module mới khi tính năng có lifecycle, scheduler, persistence table, hoặc ownership riêng.
- Nâng field denormalized khi giúp truy vấn nhanh hơn, nhưng không thay thế foreign key canonical.

## Repo Anchors

- `src/app.module.ts`
- `src/modules/incidents`
- `src/modules/analytics`
- `src/modules/gis`
- `src/modules/dashboard`
- `src/common/query-builders/incident-query.builder.ts`

## Checklist

- Nêu rõ boundary module.
- Nêu route và DTO thay đổi.
- Nêu entity, index, scheduler, migration cần thêm.
- Nêu test nào phải đi kèm.
