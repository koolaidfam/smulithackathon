import { daysUntil, formatDate } from '../lib/dates';

export function Countdown({ inForceAt }: { inForceAt: string }) {
  const days = daysUntil(inForceAt);
  const label =
    days > 1
      ? `${days} days to commencement`
      : days === 1
        ? '1 day to commencement'
        : days === 0
          ? 'In force today'
          : `In force since ${formatDate(inForceAt)}`;

  return (
    <div className="countdown" title={formatDate(inForceAt)}>
      <span className="dot" style={{ background: days > 0 ? 'var(--source)' : 'var(--stale)' }} />
      <strong>{label}</strong>
    </div>
  );
}
