const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatINR(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

const pad = (n: number) => String(n).padStart(2, "0");

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

/** Local date and time, so Indian evenings and early mornings are not shifted to the previous UTC day. */
export function nowISO(): string {
  const d = new Date();
  return `${toISO(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function parse(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(iso: string, n: number): string {
  const d = parse(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function addMonths(iso: string, n: number): string {
  const d = parse(iso);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return toISO(d);
}

/** Stay lengths in months. 0.5 means a 15-day stay. */
export const STAY_OPTIONS = [0.5, 1, 2, 3, 4, 5, 6];

export function stayLabel(months: number): string {
  if (months < 1) return "15 days";
  return `${months} ${months === 1 ? "month" : "months"}`;
}

export function stayOptionLabel(months: number): string {
  return months >= 3 ? `${stayLabel(months)}, long-stay rate` : stayLabel(months);
}

export function addStay(iso: string, months: number): string {
  return months < 1 ? addDays(iso, 15) : addMonths(iso, months);
}

export function formatDate(iso: string): string {
  const d = parse(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function dayOfMonth(iso: string): number {
  return parse(iso).getDate();
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export const layoutLabel: Record<string, string> = {
  studio: "Studio",
  "1bhk": "1 BHK",
  "2bhk": "2 BHK",
  "3bhk": "3 BHK",
};
