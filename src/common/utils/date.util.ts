export type TimeUnit = 'day' | 'week' | 'month' | 'year';

// Normalize ve dau don vi thoi gian
export function normalizeDate(date: Date, unit: TimeUnit): Date {
  const d = new Date(date);
  switch (unit) {
    case 'day':
      d.setHours(0, 0, 0, 0);
      return d;
    case 'week': {
      const day = d.getDay(); // 0 (Sun) -> 6 (Sat)
      const diff = day === 0 ? -6 : 1 - day; // tinh so ngay can tru de ve dau tuan (Mon) ISO week (Mon)
      d.setDate(d.getDate() + diff); // ve dau tuan
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case 'month':
      d.setHours(0, 0, 0, 0);
      d.setDate(1);
      return d;
    case 'year':
      d.setHours(0, 0, 0, 0);
      d.setMonth(0, 1);
      return d;
  }
}

export function add(date: Date, unit: TimeUnit): Date {
  const d = new Date(date);
  switch (unit) {
    case 'day':
      d.setDate(d.getDate() + 1);
      return d;
    case 'week':
      d.setDate(d.getDate() + 7);
      return d;
    case 'month': {
      const day = d.getDate();
      d.setDate(1);
      d.setMonth(d.getMonth() + 1);

      const max = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(day, max));
      return d;
    }
    case 'year':
      d.setFullYear(d.getFullYear() + 1);
      return d;
  }
}

// format YYYY-MM-DD

export function format(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateTimeline(fromDate: Date, toDate: Date, unit: TimeUnit) {
  const result: string[] = [];
  let current = normalizeDate(fromDate, unit);
  const end = normalizeDate(toDate, unit);
  while (current <= end) {
    result.push(format(current));
    current = add(current, unit);
  }

  return result;
}

export function buildDateRange(
  fromDate?: string,
  toDate?: string,
): { from: Date; to: Date } | null {
  if (!fromDate || !toDate) {
    return null;
  }
  // ep ve local VN
  const from = new Date(`${fromDate}T00:00:00+07:00`);
  const to = new Date(`${toDate}T00:00:00+07:00`);
  // fix bug mat ngay cuoi
  to.setDate(to.getDate() + 1);
  return { from, to };
}
