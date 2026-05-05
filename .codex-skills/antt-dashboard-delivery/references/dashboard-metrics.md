# Dashboard Metrics

## Payload hiện có

- `summary`: `totalIncidents`, `activeWards`, `topType`, `periodComparison`.
- `trend`: `groupByTime`, `currentRange`, `compareRange`, `currentSeries`, `compareSeries`.

## KPI nên ưu tiên

- Tổng số vụ việc theo kỳ.
- Số xã có hoạt động.
- Loại sự vụ nổi trội.
- Chuỗi tăng hoặc giảm theo ngày, tuần, tháng.
- Hotspot theo xã.
- Số alert đang mở.
- Risk score hoặc forecast spike cho kỳ tới.

## Quy tắc thiết kế response

- Trả explicit range cho mọi số liệu theo kỳ.
- Trả `null` hoặc mảng rỗng nhất quán cho empty state.
- Trả field đủ rõ để frontend không phải diễn giải từ nhiều enum hoặc code rời rạc.
- Ưu tiên response theo nhóm widget hoặc khu vực màn hình.

## Tích hợp về sau

- Lấy panel bản đồ từ `gis`.
- Lấy KPI trend từ `analytics`.
- Lấy forecast card từ `forecast`.
- Lấy alert panel từ `alert`.
