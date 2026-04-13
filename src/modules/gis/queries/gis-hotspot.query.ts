export const SELECT_WARD_HOTSPOT = `
  SELECT jsonb_build_object(
  'type', 'FeatureCollection',
  'features', COALESCE(jsonb_agg(
    jsonb_build_object(
      'type', 'Feature',
      'geometry', ST_AsGeoJSON(w.geom)::jsonb,
      'properties', jsonb_build_object(
        'ma_xa', w.ma_xa,
        'ten_xa', w.ten_xa,
        'incident_count', hotspot_count
      )
    )
  ), '[]'::jsonb)
) AS geojson
FROM (
  SELECT incident.ma_xa, COUNT(*) AS count
  FROM incidents incident
  WHERE incident.location IS NOT NULL
  GROUP BY incident.ma_xa
) hotspot
JOIN wards w ON w.ma_xa = hotspot.ma_xa
`;
