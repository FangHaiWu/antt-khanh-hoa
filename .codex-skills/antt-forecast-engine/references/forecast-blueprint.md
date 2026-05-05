# Forecast Blueprint

## Prediction target phù hợp

- Dự báo số vụ việc theo ngày hoặc tuần.
- Risk score theo `ma_xa`.
- Xác suất tăng đột biến theo loại sự vụ.
- Xác suất chạm ngưỡng alert trong horizon gần.

## Feature nên bắt đầu

- Rolling count theo xã.
- Rolling count theo loại sự vụ.
- Day-of-week, week-of-month, seasonality đơn giản.
- Tần suất nguồn tin theo `sourceType`.
- Mật độ lân cận từ hotspot hoặc spatial lag.

## Baseline nên làm trước

- Moving average.
- Exponentially weighted average.
- Rolling z-score để phát hiện spike.
- Weighted hotspot score theo recency và severity.

## Serving contract gợi ý

- `forecastAt`
- `targetTime`
- `horizon`
- `scope`
- `predictedValue`
- `riskScore`
- `confidence`
- `topDrivers`

## Đánh giá

- Backtest theo `ma_xa` và incident type.
- Track MAE hoặc MAPE cho regression.
- Track precision hoặc recall nếu coi là bài toán spike detection.
