import React, { useEffect, useRef } from 'react';
import { GhreatnessMark } from './GhreatnessLogo';

export function AmbientBrandMark() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Pause animation only when browser tab is inactive to preserve battery and resources
    const onVisibility = () => {
      if (document.hidden) {
        el.classList.add('ambient-paused');
      } else {
        el.classList.remove('ambient-paused');
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="ambient-mark-container pointer-events-none select-none"
      aria-hidden="true"
    >
      <div className="ambient-mark-spin">
        <GhreatnessMark size={320} className="ambient-official-mark" />
      </div>
    </div>
  );
}

export default AmbientBrandMark;
