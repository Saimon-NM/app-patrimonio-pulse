import { useEffect, useMemo, useState } from 'react';

type BalanceUpdateReminderBannerProps = {
  lastSnapshotRecordedAt: string | null;
  onRegisterSnapshot: () => void;
  reminderAfterDays?: number;
  dismissForDays?: number;
};

const DISMISSED_UNTIL_KEY = 'patrimonio-reminder-dismissed-until';

const readDismissedUntil = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DISMISSED_UNTIL_KEY);
    return raw && typeof raw === 'string' ? raw : null;
  } catch {
    return null;
  }
};

const writeDismissedUntil = (iso: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DISMISSED_UNTIL_KEY, iso);
};

const isExpired = (iso: string | null) => {
  if (!iso) return true;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return true;
  return Date.now() >= t;
};

export default function BalanceUpdateReminderBanner({
  lastSnapshotRecordedAt,
  onRegisterSnapshot,
  reminderAfterDays = 7,
  dismissForDays = 7,
}: BalanceUpdateReminderBannerProps) {
  const [dismissedUntil, setDismissedUntil] = useState<string | null>(null);

  useEffect(() => {
    setDismissedUntil(readDismissedUntil());
  }, []);

  const shouldShow = useMemo(() => {
    if (!isExpired(dismissedUntil)) return false;

    if (!lastSnapshotRecordedAt) return true;

    const last = new Date(lastSnapshotRecordedAt).getTime();
    if (Number.isNaN(last)) return true;

    const diffMs = Date.now() - last;
    const reminderMs = reminderAfterDays * 24 * 60 * 60 * 1000;
    return diffMs >= reminderMs;
  }, [dismissedUntil, lastSnapshotRecordedAt, reminderAfterDays]);

  if (!shouldShow) return null;

  return (
    <section
      className="glass rounded-3xl border border-white/10 bg-black/40 p-4 shadow-2xl"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Recordatorio</p>
          <h2 className="mt-1 text-base font-semibold text-white">Actualiza tus saldos</h2>
          <p className="mt-1 text-sm text-white/60">
            {lastSnapshotRecordedAt
              ? `Hace más de ${reminderAfterDays} días que no registras un snapshot.`
              : 'Aún no hay snapshots guardados.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRegisterSnapshot}
            className="rounded-full border border-emerald-500/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 transition hover:bg-emerald-500/10"
          >
            Registrar ahora
          </button>
          <button
            type="button"
            onClick={() => {
              const until = new Date(Date.now() + dismissForDays * 24 * 60 * 60 * 1000).toISOString();
              writeDismissedUntil(until);
              setDismissedUntil(until);
            }}
            className="rounded-full border border-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-white/30"
          >
            No ahora
          </button>
        </div>
      </div>
    </section>
  );
}

