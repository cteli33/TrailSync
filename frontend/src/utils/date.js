const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function parseDate(value) {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(value) {
  const d = parseDate(value);
  if (!d) return "";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatDateShort(value) {
  const d = parseDate(value);
  if (!d) return "";
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

export function formatDateRange(start, end) {
  const s = parseDate(start);
  const e = parseDate(end);
  if (!s || !e) return "";
  if (s.getFullYear() === e.getFullYear()) {
    return `${MONTHS[s.getMonth()].slice(0, 3)} ${s.getDate()} – ${MONTHS[e.getMonth()].slice(0, 3)} ${e.getDate()}, ${e.getFullYear()}`;
  }
  return `${formatDateShort(start)}, ${s.getFullYear()} – ${formatDateShort(end)}, ${e.getFullYear()}`;
}

export function daysUntil(value) {
  const d = parseDate(value);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / (1000 * 60 * 60 * 24));
}
