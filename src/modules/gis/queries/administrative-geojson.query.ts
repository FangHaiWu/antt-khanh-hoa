export const SELECT_SINGLE_WARD_FEATURE = `
  SELECT jsonb_build_object(
    'type', 'Feature',
    'geometry', ST_AsGeoJSON(w.geom)::jsonb,
    'properties', jsonb_build_object(
      'ma_xa', w.ma_xa,
      'ten_xa', w.ten_xa,
      'cap', w.cap,
      'loai', w.loai,
      'dtich_km2', w.dtich_km2,
      'dan_so', w.dan_so,
      'ma_tinh', w.ma_tinh,
      'metadata', w.metadata

    )
  ) AS feature
  FROM wards w
  WHERE w.ma_xa = $1
  LIMIT 1
`;

export const SELECT_ALL_WARDS_COLLECTION = `
  SELECT jsonb_build_object(
    'type', 'FeatureCollection',
    'features', COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(w.geom)::jsonb,
          'properties', jsonb_build_object(
            'ma_xa', w.ma_xa,
            'ten_xa', w.ten_xa
            'cap', w.cap,
          'loai', w.loai,
            'dtich_km2', w.dtich_km2,
            'dan_so', w.dan_so,
            'ma_tinh', w.ma_tinh,
            'metadata', w.metadata
          )
        )
      ),
      '[]'::jsonb
    )
  ) AS geojson
  FROM wards w
`;

export const SELECT_PROVINCE_FEATURE = `
  SELECT jsonb_build_object(
    'type', 'Feature',
    'geometry', ST_AsGeoJSON(p.geom)::jsonb,
    'properties', jsonb_build_object(
      'ma_tinh', p.ma_tinh,
      'ten_tinh', p.ten_tinh,
      'quy_mo', p.quy_mo,
      'tru_so', p.tru_so,
      'loai', p.loai,
      'cap', p.cap,
      'dtich_km2', p.dtich_km2,
      'dan_so', p.dan_so,
      'matdo_km2', p.matdo_km2
    )
  ) AS feature
  FROM province p
  LIMIT 1
`;
