/** Frozen clock so the demo story stays stable for judges. */
export const DEMO_NOW = new Date('2026-09-05T09:00:00+08:00');

export function parseIso(iso: string): Date {
  return new Date(iso);
}

export function isInForce(inForceAt: string, now: Date = DEMO_NOW): boolean {
  return parseIso(inForceAt).getTime() <= now.getTime();
}

export function daysUntil(iso: string, now: Date = DEMO_NOW): number {
  const ms = parseIso(iso).getTime() - now.getTime();
  return Math.ceil(ms / 86_400_000);
}

export function formatDate(iso: string): string {
  return parseIso(iso).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Singapore',
  });
}

export function formatDateTime(iso: string): string {
  return parseIso(iso).toLocaleString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Singapore',
  });
}
