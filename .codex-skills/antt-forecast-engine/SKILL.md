---
name: antt-forecast-engine
description: Thiết kế năng lực dự báo và risk scoring cho ANTT. Dùng khi Codex cần tạo predictive service, feature engineering flow, scoring table, baseline model, forecast API, hoặc hotspot risk projection dựa trên incidents, GIS và analytics thời gian.
---

# ANTT Forecast Engine

## Overview

Xem forecast là lớp dự báo đọc từ incident, analytics, và GIS thay vì thay thế chúng. Bắt đầu bằng baseline minh bạch, giải thích được, rồi mới cân nhắc mô hình phức tạp hơn.

## Workflow

1. Đọc `references/forecast-blueprint.md` và xem lại analytics hoặc GIS hiện có để hiểu feature đã sẵn.
2. Chốt prediction target: số vụ việc theo ngày, risk score theo xã, spike theo loại sự vụ, hoặc xác suất vượt ngưỡng alert.
3. Bắt đầu từ baseline dễ giải thích như moving average, seasonal average, rolling z-score, hoặc weighted hotspot score.
4. Tách feature computation hoặc training khỏi serving API.
5. Version feature set và output dự báo để có thể backtest hoặc so sánh.
6. Trả về `forecastAt`, `targetTime`, `horizon`, `predictedValue`, `confidence`, và driver chính nếu có.

## Quy Tắc

- Không đặt model logic trực tiếp trong controller.
- Tái sử dụng `ma_xa`, loại sự vụ, và feature thời gian hoặc không gian từ domain hiện có.
- Ưu tiên forecast đọc được bằng con người trước khi thêm ML phức tạp.
- Luôn gắn confidence hoặc uncertainty với output.

## Repo Anchors

- `src/modules/incidents`
- `src/modules/analytics`
- `src/modules/gis`
- `src/modules/dashboard`

## Checklist

- Nêu target dự báo và horizon.
- Nêu feature pipeline và baseline đầu tiên.
- Nêu nơi lưu forecast output.
- Nêu metric backtest hoặc cách đánh giá.
