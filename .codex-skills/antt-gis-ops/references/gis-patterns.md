# GIS Patterns

## Năng lực hiện có

- GeoJSON tỉnh.
- GeoJSON tất cả xã hoặc một xã.
- Incident theo xã.
- Incident gần một điểm theo bán kính.
- Incident trong polygon.
- Reverse geocode.
- Heatmap và hotspot theo xã.
- Metadata layer.

## Pattern nên giữ

- Thêm spatial filter dùng chung vào `applyIncidentFilters`.
- Trả incident point qua mapper `toIncidentFeature` hoặc `toIncidentFeatureCollection`.
- Trả polygon boundary qua utility `toFeature` hoặc `toFeatureCollection`.
- Aggregate trước, join boundary sau khi dựng hotspot hoặc choropleth.

## Mở rộng phù hợp

- Clustering theo zoom.
- Buffer hoặc proximity search theo polygon động.
- Choropleth theo metric analytics.
- Extent hoặc bounds theo nhiều điều kiện lọc.

## Cần tránh

- Tự ráp GeoJSON ad-hoc ở controller.
- Hard-code geometry hoặc SRID khác với `4326`.
- Copy filter bbox hoặc polygon vào nhiều service khác nhau.

