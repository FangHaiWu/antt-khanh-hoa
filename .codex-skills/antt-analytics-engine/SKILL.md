---
name: antt-analytics-engine
description: Xây dựng tầng thống kê và so sánh trên dữ liệu incident. Dùng khi Codex cần thêm trend, compare, heatmap, grouped count, safe group-by logic, hoặc sửa analytics service/controller của antt-khanh-hoa.
---

# ANTT Analytics Engine

## Overview

Xem analytics là tập endpoint thống kê tái sử dụng được cho dashboard, forecast, alert, hoặc công cụ BI nội bộ. Bắt đầu từ câu hỏi phân tích rồi ánh xạ sang filter, grain thời gian, và chiều group phù hợp.

## Workflow

1. Đọc `src/modules/analytics/analytics.service.ts`, `analytics.controller.ts`, `src/modules/analytics/dto/stats-query.dto.ts`, `src/common/query-builders/incident-query.builder.ts`, và `references/analytics-contract.md`.
2. Chốt câu hỏi phân tích trước: đếm cái gì, trong khoảng thời gian nào, theo chiều nào, và ai sẽ tiêu thụ kết quả.
3. Giữ time grain trong allow-list `day`, `week`, `month`, `year`.
4. Giữ group-by field trong allow-list cố định; không nội suy user input tùy ý vào SQL.
5. Phân biệt endpoint analytics chung với endpoint dashboard tổng hợp; chỉ để phần business view đặc thù ở dashboard.

## Quy Tắc

- Tái sử dụng `applyIncidentFilters` và `applyIncidentDateRange` trước khi thêm filter mới ở từng service.
- Chuẩn hóa kiểu trả về số và thời gian khi endpoint được dùng bởi UI.
- Cân nhắc index khi thêm dimension lọc có cardinality cao.
- Dùng raw SQL chỉ khi QueryBuilder làm câu truy vấn khó đọc hoặc quá kém hiệu quả.

## Repo Anchors

- `src/modules/analytics/analytics.service.ts`
- `src/modules/analytics/analytics.controller.ts`
- `src/modules/analytics/dto/stats-query.dto.ts`
- `src/common/query-builders/incident-query.builder.ts`
- `src/common/utils/date.util.ts`

## Checklist

- Nêu metric, time grain, và dimension group.
- Nêu endpoint thuộc analytics hay dashboard.
- Nêu query/index cần chỉnh nếu metric mới nặng.
- Thêm test cho allow-list và edge case empty result.
