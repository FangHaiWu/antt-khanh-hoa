---
name: antt-quality-guard
description: Bảo vệ chất lượng dữ liệu, contract API, và regression safety của ANTT. Dùng khi Codex cần thêm hoặc sửa test, seed data, validation rule, filter consistency, contract coverage, hoặc QA check cho incidents, analytics, GIS, dashboard, forecast, hay alert.
---

# ANTT Quality Guard

## Overview

Xem quality guard là lớp bảo vệ hệ thống sau mọi thay đổi domain hoặc API. Ưu tiên kiểm tra những seam có rủi ro cao: validate hierarchy, spatial filter, group-by allow-list, so sánh kỳ, và dữ liệu seed Khánh Hòa.

## Workflow

1. Đọc các file `*.spec.ts`, seed trong `src/database/seeds`, và `references/qa-matrix.md`.
2. Đặt test ở seam đem lại độ tin cậy cao nhất: service test cho nghiệp vụ, controller test cho contract, e2e khi cần path đầy đủ.
3. Khi đổi shared query hoặc filter, kiểm tra ảnh hưởng đến `incidents`, `analytics`, `gis`, và `dashboard`.
4. Dùng geojson tỉnh hoặc xã và seed incidents làm fixture thực tế.
5. Bổ sung validation input trước khi thêm SQL hoặc PostGIS expression mới.

## Quy Tắc

- Ưu tiên test nhỏ, deterministic, và sát seam thay đổi.
- Luôn có ít nhất một success case và một failure hoặc edge case cho logic mới.
- Kiểm tra soft delete, date range, spatial filter, allow-list, và empty state khi chúng liên quan.
- Nêu residual risk rõ ràng nếu không chạy được DB integration hoặc e2e.

## Repo Anchors

- `src/modules/**/*.spec.ts`
- `test/app.e2e-spec.ts`
- `src/database/seeds`
- `src/database/generate-test-data.ts`

## Checklist

- Nêu seam nào đang được bảo vệ.
- Nêu test mới hoặc test phải cập nhật.
- Nêu fixture hoặc seed dùng để tái hiện bài toán.
- Nêu residual risk nếu chưa verify được end-to-end.
