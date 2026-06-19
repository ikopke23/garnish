import { useEffect, useRef } from 'react';

export function useWakeLock(active: boolean): void {
  const sentinel = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    const acquire = async () => {
      try {
        const wl = await (navigator as unknown as { wakeLock?: { request: (s: string) => Promise<WakeLockSentinel> } }).wakeLock?.request('screen');
        if (cancelled) { wl?.release(); return; }
        sentinel.current = wl ?? null;
      } catch { /* wake lock unavailable */ }
    };

    acquire();

    const onVis = () => {
      if (document.visibilityState === 'visible' && !sentinel.current) acquire();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVis);
      sentinel.current?.release().catch(() => {});
      sentinel.current = null;
    };
  }, [active]);
}
