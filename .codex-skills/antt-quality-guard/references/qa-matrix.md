# QA Matrix

## Incident

- Validate subtype không thuộc type phải fail.
- Validate ward không tồn tại phải fail.
- Validate tạo point chỉ khi có đủ `lat` và `lng`.
- Validate soft delete hoặc restore đúng contract.

## GIS

- Kiểm tra `bbox`, `radius`, `polygon`, `intersectsWard`.
- Kiểm tra hotspot trả boundary đúng `ma_xa`.
- Kiểm tra reverse geocode trả `null` rõ ràng khi không match.

## Analytics

- Kiểm tra allow-list cho `groupByTime`.
- Kiểm tra allow-list cho `groupBy`.
- Kiểm tra empty result không làm hỏng shape response.

## Dashboard

- Kiểm tra `currentRange` và `compareRange`.
- Kiểm tra `changePercent` với mẫu số bằng `0` hoặc `null`.
- Kiểm tra shape response ổn định cho frontend.

## Forecast và Alert về sau

- Kiểm tra baseline output có confidence.
- Kiểm tra dedupe và suppression window.
- Kiểm tra audit trail hoặc delivery log.
