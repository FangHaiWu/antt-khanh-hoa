---
name: antt-dashboard-delivery
description: Thiết kế contract API phục vụ dashboard tác chiến ANTT. Dùng khi Codex cần thêm KPI card, summary endpoint, trend panel, compare period, map widget, hoặc composite backend contract cho dashboard của antt-khanh-hoa.
---

# ANTT Dashboard Delivery

## Overview

Xem dashboard là curated read model cho người vận hành, không phải mirror 1:1 của bảng dữ liệu. Bắt đầu từ widget, câu hỏi ra quyết định, và trạng thái rỗng mà giao diện cần hiển thị.

## Workflow

1. Đọc `src/modules/dashboard/dashboard.service.ts`, `dashboard.controller.ts`, `src/modules/dashboard/dto/Dashboard-query.dto.ts`, và `references/dashboard-metrics.md`.
2. Xác định widget hoặc câu hỏi vận hành trước khi thiết kế payload.
3. Chốt contract response: label, value, series, compare range, empty state, và metadata hiển thị.
4. Gộp dữ liệu từ analytics, GIS, forecast, alert thành payload ổn định mà frontend có thể render trực tiếp.
5. Ưu tiên ít endpoint ổn định cho từng khu vực dashboard thay vì chia quá nhiều endpoint nhỏ theo widget, trừ khi hiệu năng hoặc ownership yêu cầu khác.

## Quy Tắc

- Phân biệt analytics endpoint tổng quát với dashboard composite endpoint.
- Luôn trả `currentRange` và `compareRange` rõ ràng khi có so sánh kỳ.
- Giữ key response ổn định để frontend không phải suy luận thêm.
- Để dashboard phụ thuộc vào output đã được curate thay vì đọc trực tiếp bảng raw.

## Repo Anchors

- `src/modules/dashboard/dashboard.service.ts`
- `src/modules/dashboard/dashboard.controller.ts`
- `src/modules/dashboard/dto/Dashboard-query.dto.ts`
- `src/modules/analytics`
- `src/modules/gis`

## Checklist

- Nêu dashboard question hoặc widget phục vụ ai.
- Nêu response shape ổn định cho frontend.
- Nêu dữ liệu nào đi từ analytics, GIS, forecast, hoặc alert.
- Nêu chiến lược cache hoặc split endpoint nếu payload nặng.
