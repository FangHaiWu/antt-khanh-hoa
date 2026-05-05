# ANTT Codex Skill Playbook

## Mục tiêu

Pack này biến `anntt-khanh-hoa` thành một workspace có thể dùng Codex theo đúng capability của hệ thống ANTT thay vì mỗi lần đều phải giải thích lại domain.

## Capability map của repo hiện tại

- `src/modules/incidents`: intake, CRUD, search, provenance của incident.
- `src/modules/analytics`: thống kê, trend, compare, heatmap.
- `src/modules/gis`: GeoJSON, reverse geocode, hotspot, spatial filter.
- `src/modules/dashboard`: payload tổng hợp cho UI.
- `src/modules/administrative_unit`: boundary tỉnh và xã.

## Danh mục skill

- `antt-system-architect`: dùng khi thiết kế tính năng cắt ngang nhiều module hoặc cần quyết định boundary.
- `antt-incident-pipeline`: dùng khi sửa canonical incident model, DTO, service, query/filter.
- `antt-osint-ingestion`: dùng khi xây collector, parser, source registry, dedupe, normalize dữ liệu OSINT.
- `antt-gis-ops`: dùng khi thêm PostGIS query, GeoJSON layer, hotspot, reverse geocode.
- `antt-analytics-engine`: dùng khi thêm metric, trend, compare, heatmap, group-by logic.
- `antt-dashboard-delivery`: dùng khi thiết kế payload KPI, widget, range compare cho dashboard.
- `antt-forecast-engine`: dùng khi thiết kế feature store, scoring, dự báo.
- `antt-alert-orchestrator`: dùng khi xây rule, suppression, notification, alert audit trail.
- `antt-quality-guard`: dùng khi thêm test, seed, validation, regression protection.

## Cách dùng với Codex App

### Cách 1: gọi trực tiếp bằng path trong repo

Dùng khi chưa muốn cài skill vào `~/.codex/skills`.

Ví dụ:

```text
Use $antt-gis-ops at ./codex-skills/antt-gis-ops to add an endpoint that clusters incidents by ward and returns GeoJSON for the dashboard map.
```

```text
Use $antt-system-architect at ./codex-skills/antt-system-architect and $antt-osint-ingestion at ./codex-skills/antt-osint-ingestion to design a Facebook news ingestion module that normalizes posts into incident candidates.
```

### Cách 2: cài vào Codex để auto-discovery

Chạy:

```bash
bash codex-skills/install-to-codex.sh
```

Script sẽ symlink toàn bộ skill trong pack vào `${CODEX_HOME:-$HOME/.codex}/skills`.

Sau đó có thể gọi ngắn:

```text
Use $antt-dashboard-delivery to extend the dashboard summary endpoint with alert counters and forecast risk cards.
```

## Kiểm tra pack skill

Chạy:

```bash
bash codex-skills/validate-pack.sh
```

Script sẽ gọi validator của `skill-creator` cho từng skill.

## Workflow khuyến nghị khi build dự án

1. Dùng `antt-system-architect` để chốt boundary và contract.
2. Dùng skill domain chính, ví dụ `antt-osint-ingestion`, `antt-gis-ops`, `antt-forecast-engine`, hoặc `antt-alert-orchestrator`.
3. Dùng `antt-dashboard-delivery` nếu cần payload cho UI.
4. Kết thúc bằng `antt-quality-guard` để thêm test hoặc seed bảo vệ thay đổi.

## Prompt mẫu theo use case

### Bổ sung nguồn OSINT

```text
Use $antt-system-architect and $antt-osint-ingestion to scaffold an osint module that stores raw observations, scores confidence, and writes reviewed candidates into incident.
```

### Xây forecast hotspot

```text
Use $antt-forecast-engine to design a ward-level risk score for the next 7 days using incident trend and hotspot density.
```

### Mở rộng dashboard

```text
Use $antt-dashboard-delivery and $antt-analytics-engine to add a compare widget for current period versus previous period by incident type.
```

### Bật cảnh báo

```text
Use $antt-alert-orchestrator to create alert rules that fire when one ward exceeds a moving average threshold for three consecutive days.
```

### Chốt chất lượng

```text
Use $antt-quality-guard to add regression tests for the new spatial filters and dashboard payload shape.
```
