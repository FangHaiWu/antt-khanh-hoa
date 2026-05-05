# Alert Blueprint

## Signal source phù hợp

- Count vượt ngưỡng trong analytics.
- Hotspot vượt ngưỡng ở GIS.
- Risk score hoặc anomaly từ forecast.
- Tăng volume observation từ OSINT.

## Data model gợi ý

- `alert_rule`
- `alert_event`
- `alert_delivery`
- `alert_subscription`

## Rule schema tối thiểu

- `scope`
- `conditionType`
- `threshold`
- `timeWindow`
- `severity`
- `dedupeKeyTemplate`
- `suppressionMinutes`
- `channels`

## Delivery pattern

- Evaluate rule theo schedule hoặc event.
- Tạo `alert_event` nếu pass condition và không trùng suppression window.
- Gửi qua channel adapter tách riêng.
- Ghi log mọi lần delivery và retry.

## Evidence cần giữ

- Link tới incident, ward, metric series, hoặc forecast record.
- Snapshot condition tại thời điểm bắn alert.
