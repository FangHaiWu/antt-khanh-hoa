export function buildDateRange(
  fromDate?: string,
  toDate?: string,
): { from: Date; to: Date } | null {
  if (!fromDate || !toDate) {
    return null;
  }
  const from = new Date(fromDate);
  const to = new Date(toDate);
  // fix bug mat ngay cuoi
  to.setHours(23, 59, 59, 999);
  return { from, to };
}
