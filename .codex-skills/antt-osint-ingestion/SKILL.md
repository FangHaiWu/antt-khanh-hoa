---
name: antt-osint-ingestion
description: Thiết kế pipeline thu thập và chuẩn hóa OSINT để cấp dữ liệu cho ANTT. Dùng khi Codex cần thêm crawler, parser, source registry, credibility scoring, deduplication, extraction job, hoặc module NestJS mới chuyển tín hiệu bên ngoài thành incident canonical.
---

# ANTT OSINT Ingestion

## Overview

Xây OSINT như một tầng nguồn đổ vào incident, không nhét thẳng logic crawler vào dashboard hay analytics. Giữ raw capture, normalized observation, và incident candidate thành các bước riêng để có thể trace và review.

## Workflow

1. Đọc `references/osint-blueprint.md` trước khi thêm module mới.
2. Chia pipeline thành các bước: source registry -> raw capture -> normalized observation -> enrichment -> incident candidate -> write hoặc merge vào `incident`.
3. Giữ raw payload bất biến để phục vụ traceability và re-parse.
4. Tính ít nhất ba loại confidence: độ tin cậy nguồn, độ chắc chắn trích xuất, và độ chắc chắn merge hoặc dedupe.
5. Chỉ ghi thẳng vào `incident` khi đã xác định đủ thời gian, loại sự vụ, và vị trí; nếu chưa đủ thì đưa vào review queue.
6. Thiết kế job idempotent bằng source fingerprint hoặc external event key.

## Quy Tắc

- Không cho scraper ghi trực tiếp vào bảng `incident` mà bỏ qua tầng chuẩn hóa.
- Tách schedule thu thập khỏi parser hoặc mapper nghiệp vụ.
- Giữ `sourceUrl`, acquisition time, raw payload hash, và external id khi nguồn có cung cấp.
- Ưu tiên reviewable observation store cho dữ liệu mơ hồ thay vì ép normalize sai.

## Repo Anchors

- `src/modules/incidents`
- `src/modules/incidents/enums/source-type.enum.ts`
- `src/modules/incidents/dto/create-incident.dto.ts`
- `src/common/query-builders/incident-query.builder.ts`

## Checklist

- Nêu source registry, storage model, và job flow.
- Nêu chiến lược dedupe hoặc merge vào incident.
- Nêu review path cho dữ liệu chưa đủ chắc chắn.
- Nêu test fixture hoặc sample payload cần thêm.
