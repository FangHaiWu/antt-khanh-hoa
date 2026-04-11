export const SELECT_REVERSE_GEOCODE = `
  SELECT 
    w.ma_xa, w.ten_xa, w.ma_tinh, p.ten_tinh
    FROM wards w
    JOIN province p ON w.ma_tinh = p.ma_tinh
    WHERE ST_Contains(w.geom, ST_SetSRID(ST_MakePoint($1, $2), 4326))
    LIMIT 1
`;
