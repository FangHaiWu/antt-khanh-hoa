export function buildIncidentExtentQuery(filteredSql: string) {
  return `
    SELECT
      ST_XMin(extent) AS "minLng",
      ST_YMin(extent) AS "minLat",
      ST_XMax(extent) AS "maxLng",
      ST_YMax(extent) AS "maxLat",
      total_count::int AS "count"
    FROM (
      SELECT
        ST_Extent(location) AS extent,
        COUNT(*) AS total_count
      FROM (${filteredSql}) filtered_incidents
    ) q
  `;
}
