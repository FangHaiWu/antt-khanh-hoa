---
name: antt-incident-pipeline
description: Mở rộng và bảo vệ canonical incident domain của antt-khanh-hoa. Dùng khi Codex cần sửa entity, DTO, controller, service, denormalized code, CRUD/search flow, source metadata, hoặc ingestion path nào ghi vào bảng incident.
---

# ANTT Incident Pipeline

## Overview

Xem `incident` là write model trung tâm của hệ thống. Mọi nguồn dữ liệu mới, kể cả OSINT sau này, đều nên đổ qua contract này hoặc qua một tầng chuẩn hóa bọc quanh contract này.

## Workflow

1. Đọc `src/modules/incidents/entities/incident.entity.ts`, các DTO trong `src/modules/incidents/dto`, `incidents.service.ts`, `incidents.controller.ts`, và `references/incident-contract.md`.
2. Giữ invariant hiện có: `incidentTypeId` hợp lệ, `incidentSubtypeCode` phải thuộc `incidentTypeId`, `ma_xa` phải tồn tại, `incidentTime` phải được normalize, và `location` chỉ sinh khi có đủ `lat` và `lng`.
3. Khi thêm field mới, cập nhật entity, DTO, service mapping, controller contract, và search/filter liên quan cùng một lượt.
4. Khi thêm filter mới, triển khai một lần trong `src/common/query-builders/incident-query.builder.ts`, sau đó tái sử dụng cho `analytics`, `gis`, và `dashboard`.
5. Giữ đầy đủ soft delete, restore, hard delete, và metadata nguồn (`sourceType`, `sourceUrl`).

## Quy Tắc

- Giữ `incidentTypeId` là foreign key canonical; xem `incidentCategoryCode`, `incidentTypeCode`, `incidentSubtypeCode` là field denormalized phục vụ lọc nhanh.
- Ưu tiên normalize ở service thay vì controller.
- Ghi provenance của dữ liệu qua `sourceType` và `sourceUrl`.
- Không rải logic validate hierarchy type hoặc subtype ở nhiều nơi.

## Repo Anchors

- `src/modules/incidents/entities/incident.entity.ts`
- `src/modules/incidents/dto/create-incident.dto.ts`
- `src/modules/incidents/dto/update-incident.dto.ts`
- `src/modules/incidents/dto/search-incident.dto.ts`
- `src/modules/incidents/incidents.service.ts`
- `src/modules/incidents/incidents.controller.ts`
- `src/common/query-builders/incident-query.builder.ts`

## Checklist

- Cập nhật full chain entity -> DTO -> service -> controller khi thêm field.
- Cập nhật query builder khi thêm filter.
- Cập nhật mapping location hoặc provenance khi thêm nguồn dữ liệu.
- Thêm test cho success path và case validate lỗi.
