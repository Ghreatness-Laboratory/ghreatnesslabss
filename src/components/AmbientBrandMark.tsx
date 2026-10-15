import React, { useEffect, useRef } from 'react';

export function AmbientBrandMark() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let scrollTimer: number | null = null;
    const onScroll = () => {
      el.classList.add('ambient-paused');
      if (scrollTimer !== null) window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        el.classList.remove('ambient-paused');
      }, 150);
    };

    const onVisibility = () => {
      if (document.hidden) {
        el.classList.add('ambient-paused');
      } else {
        el.classList.remove('ambient-paused');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (scrollTimer !== null) window.clearTimeout(scrollTimer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div ref={containerRef} className="ambient-mark-container" aria-hidden="true">
      <div className="ambient-mark-spin">
        <span className="ambient-ring ambient-ring-outer" />
        <span className="ambient-ring ambient-ring-mid" />
        <span className="ambient-ring ambient-ring-inner" />
        <span className="ambient-mark-dot" />
      </div>
    </div>
  );
}
