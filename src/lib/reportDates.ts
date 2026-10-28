export type DateRange = { from: string; to: string };

const pad2 = (value: number) => String(value).padStart(2, "0");

export const toDateKey = (date = new Date()) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export const dateKeyToDate = (value: string) => new Date(`${value}T00:00:00`);

export const normalizeDateKey = (value: string | null | undefined) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return toDateKey(date);
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : "";
};

export const shiftDateKey = (value: string, days: number) => {
  const date = dateKeyToDate(value);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
};

export const formatDateKey = (value: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) => {
  const date = dateKeyToDate(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-IN", options);
};

export const formatDayName = (value: string) => formatDateKey(value, { weekday: "short" });

export const isInRange = (dateKey: string, range: DateRange) => Boolean(dateKey) && dateKey >= range.from && dateKey <= range.to;

/** Every date key from `from` to `to` (inclusive), newest first. */
export const listDaysInRange = (range: DateRange) => {
  const days: string[] = [];
  for (let current = range.to; current >= range.from; current = shiftDateKey(current, -1)) {
    days.push(current);
  }
  return days;
};

export const countDays = (range: DateRange) => Math.round((dateKeyToDate(range.to).getTime() - dateKeyToDate(range.from).getTime()) / 86_400_000) + 1;

/** Range covering every date key given (falls back to today), extended up to today. */
export const rangeForAllDays = (dateKeys: string[]): DateRange => {
  const today = toDateKey();
  const valid = dateKeys.filter(Boolean).sort();
  return { from: valid[0] && valid[0] < today ? valid[0] : today, to: valid[valid.length - 1] && valid[valid.length - 1] > today ? valid[valid.length - 1] : today };
};

const csvCell = (value: string | number) => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const downloadCsv = (fileName: string, rows: Array<Array<string | number>>) => {
  const body = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  // Byte-order mark so Excel opens the file as UTF-8.
  const csv = String.fromCharCode(0xfeff) + body;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
