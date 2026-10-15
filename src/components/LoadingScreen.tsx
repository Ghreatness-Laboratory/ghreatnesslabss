import React, { useEffect, useState, useRef } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  delayMs?: number;
}

export function LoadingScreen({ isLoading, delayMs = 220 }: LoadingScreenProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const delayTimerRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      if (fadeTimerRef.current) {
        window.clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
      setIsFadingOut(false);

      // Avoid flash of loader on fast loads (< 220ms)
      delayTimerRef.current = window.setTimeout(() => {
        setShouldRender(true);
      }, delayMs);
    } else {
      if (delayTimerRef.current) {
        window.clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }

      if (shouldRender) {
        setIsFadingOut(true);
        fadeTimerRef.current = window.setTimeout(() => {
          setShouldRender(false);
          setIsFadingOut(false);
        }, 360);
      }
    }

    return () => {
      if (delayTimerRef.current) window.clearTimeout(delayTimerRef.current);
      if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
    };
  }, [isLoading, delayMs, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      className={`branded-loading-screen ${isFadingOut ? 'loading-screen-fade-out' : 'loading-screen-fade-in'}`}
      role="status"
      aria-live="polite"
      aria-label="Loading content"
    >
      <div className="branded-spinner" />
      <span className="branded-loader-wordmark">GHREATNESSLABS</span>
    </div>
  );
}
