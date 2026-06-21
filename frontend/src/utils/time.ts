export function formatClockTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(safe / 3600);
  const m = String(Math.floor((safe % 3600) / 60)).padStart(2, "0");
  const s = String(safe % 60).padStart(2, "0");
  return h > 0 ? `${String(h).padStart(2, "0")}:${m}:${s}` : `${m}:${s}`;
}

export function parseClockTime(value: string) {
  const parts = value.trim().split(":").map(Number);
  if (parts.some(Number.isNaN)) return null;
  return parts.reduce((total, part) => total * 60 + part, 0);
}
