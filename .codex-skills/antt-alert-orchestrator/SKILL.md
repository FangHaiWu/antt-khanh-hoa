---
name: antt-alert-orchestrator
description: Thiết kế tầng cảnh báo rule-based và signal-based cho ANTT. Dùng khi Codex cần triển khai alert rule, threshold detection, anomaly trigger, deduplication, suppression window, notification channel, hoặc alert module đọc từ analytics, GIS, forecast, hay OSINT.
---

# ANTT Alert Orchestrator

## Overview

Xem alert là decision hoặc action layer nằm sau analytics, GIS, forecast, hoặc OSINT. Thiết kế alert sao cho mỗi cảnh báo đều truy ngược được về bằng chứng và có cơ chế chống bắn trùng.

## Workflow

1. Đọc `references/alert-blueprint.md` và module upstream tạo ra signal.
2. Chốt signal source: metric analytics, hotspot GIS, score forecast, hoặc volume OSINT.
3. Thiết kế rule model gồm scope, threshold hoặc condition, time window, severity, recipient hoặc channel.
4. Thêm dedupe key và suppression window trước khi viết code gửi notification.
5. Ghi lại alert event, delivery attempt, và status để có audit trail.
6. Tách rule evaluation khỏi channel adapter để có thể test độc lập.

## Quy Tắc

- Mỗi alert phải trỏ ngược được về evidence, ví dụ incident, series, ward, hoặc score.
- Tách trigger evaluation khỏi notification delivery để dễ retry và idempotent.
- Model severity, state, assignee, hoặc acknowledgement nếu dashboard vận hành cần.
- Không gửi alert trực tiếp từ controller request path trừ khi có yêu cầu sync rõ ràng.

## Repo Anchors

- `src/modules/analytics`
- `src/modules/gis`
- `src/modules/dashboard`
- `src/modules/incidents`

## Checklist

- Nêu signal source, rule schema, và channel.
- Nêu dedupe key và suppression policy.
- Nêu bảng log hoặc audit trail cần có.
- Nêu test cho duplicate, retry, và false positive path.
