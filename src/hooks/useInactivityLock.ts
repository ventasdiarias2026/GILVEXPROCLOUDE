import { useEffect, useRef, useState } from 'react';

const STORAGE_LOCK_KEY = 'gilvexpro_session_locked';

export function useInactivityLock(timeoutMs: number = 60 * 1000, isEnabled: boolean = true) {
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_LOCK_KEY) === 'true';
  });
  const [secondsRemaining, setSecondsRemaining] = useState<number>(Math.floor(timeoutMs / 1000));
  const timerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = () => {
    if (isLocked || !isEnabled) return;
    lastActivityRef.current = Date.now();
    setSecondsRemaining(Math.floor(timeoutMs / 1000));

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      lockSession();
    }, timeoutMs);
  };

  const lockSession = () => {
    setIsLocked(true);
    localStorage.setItem(STORAGE_LOCK_KEY, 'true');
    if (timerRef.current) window.clearTimeout(timerRef.current);
  };

  const unlockSession = () => {
    setIsLocked(false);
    localStorage.removeItem(STORAGE_LOCK_KEY);
    resetTimer();
  };

  useEffect(() => {
    if (!isEnabled || isLocked) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) window.clearInterval(countdownIntervalRef.current);
      return;
    }

    // Reset on initial mount
    resetTimer();

    // Listen to user activity events
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      // Throttle activity resets to once per 2 seconds to avoid CPU churn
      if (Date.now() - lastActivityRef.current > 2000) {
        resetTimer();
      }
    };

    events.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }));

    // Countdown interval for UI indicator
    countdownIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const left = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000));
      setSecondsRemaining(left);
      if (left <= 0 && !isLocked) {
        lockSession();
      }
    }, 1000);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) window.clearInterval(countdownIntervalRef.current);
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
    };
  }, [isEnabled, isLocked, timeoutMs]);

  return {
    isLocked,
    lockSession,
    unlockSession,
    secondsRemaining,
  };
}
