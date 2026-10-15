import React, { useEffect, useRef } from 'react';

export function CursorDot() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on desktop devices with fine pointer and no reduced motion
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      return;
    }

    const dot = dotRef.current;
    if (!dot) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let isVisible = false;
    let isScrolling = false;
    let scrollTimeout: number | null = null;
    let rafId: number | null = null;

    const updatePosition = () => {
      // Linear interpolation (easing)
      const ease = 0.22;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      if (dot) {
        dot.style.transform = `translate3d(${Math.round(currentX - 4)}px, ${Math.round(currentY - 4)}px, 0)`;
        dot.style.opacity = isVisible && !isScrolling ? '1' : '0';
      }

      // Keep RAF loop active only while visible and tab active
      if (!document.hidden) {
        rafId = requestAnimationFrame(updatePosition);
      }
    };

    rafId = requestAnimationFrame(updatePosition);

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      isVisible = true;
    };

    const onMouseLeave = () => {
      isVisible = false;
    };

    const onMouseEnter = () => {
      isVisible = true;
    };

    // Pause cursor updates during scroll to free up 100% of GPU/CPU for scrolling
    const onScroll = () => {
      isScrolling = true;
      if (dot) dot.style.opacity = '0';

      if (scrollTimeout !== null) {
        window.clearTimeout(scrollTimeout);
      }
      scrollTimeout = window.setTimeout(() => {
        isScrolling = false;
        if (isVisible && dot) dot.style.opacity = '1';
      }, 120);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (rafId) cancelAnimationFrame(rafId);
      } else {
        rafId = requestAnimationFrame(updatePosition);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (scrollTimeout !== null) window.clearTimeout(scrollTimeout);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return <div ref={dotRef} className="cursor-trail-dot" aria-hidden="true" />;
}
