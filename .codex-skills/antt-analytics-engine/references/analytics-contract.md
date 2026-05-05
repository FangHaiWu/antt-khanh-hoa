# Analytics Contract

## Endpoint hiện có

- `GET /analytics/by-date`
- `GET /analytics/by-type`
- `GET /analytics/by-subtype`
- `GET /analytics/by-ward`
- `GET /analytics/trend`
- `GET /analytics/heatmap`
- `GET /analytics/compare`

## Quy tắc thiết kế

- Xác định rõ metric, grain thời gian, dimension group, và consumer.
- Giữ allow-list cho `groupByTime` và `groupBy`.
- Tái sử dụng shared filters trước khi viết query mới.
- Trả shape tái sử dụng được cho dashboard, forecast, alert.

## Khi nào đặt ở dashboard thay vì analytics

- Khi payload là composite cho UI cụ thể.
- Khi response có nhiều card hoặc series ghép từ nhiều nguồn.
- Khi semantics phụ thuộc mạnh vào màn hình thay vì bản thân metric.

## Gợi ý mở rộng

- Top-N có giới hạn rõ ràng.
- Trend theo source type hoặc category.
- Rolling window hoặc anomaly baseline cho alert hoặc forecast.
