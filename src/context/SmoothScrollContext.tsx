import React, { createContext, useContext, useEffect, useRef, useMemo } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

interface SmoothScrollContextValue {
  lenis: Lenis | null;
  scrollTo: (
    target: number | string | HTMLElement,
    options?: {
      offset?: number;
      immediate?: boolean;
      duration?: number;
      easing?: (t: number) => number;
      onComplete?: () => void;
    }
  ) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: () => {},
});

export function SmoothScrollProvider({
  children,
  currentPath,
}: {
  children: React.ReactNode;
  currentPath?: string;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect accessibility settings
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initialize Lenis with refined studio dynamics:
    // - Silky exponential decay easing
    // - Smooth trackpad & mouse wheel normalization
    // - Responsive touch momentum on mobile devices
    const lenis = new Lenis({
      duration: prefersReducedMotion ? 0.01 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Natural inertial deceleration
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !prefersReducedMotion,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false,
      autoRaf: false, // We control requestAnimationFrame for precise timing
    });

    lenisRef.current = lenis;

    // High performance RAF loop
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Smooth anchor link click interception (#hash)
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href && href.length > 1 && href.startsWith('#')) {
        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl as HTMLElement, {
            offset: -80, // account for header clearance
            duration: 1.2,
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    // Refresh Lenis on window resize or DOM updates
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    resizeObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', handleAnchorClick);
      resizeObserver.disconnect();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // When path changes, immediately scroll smoothly to the top of the new page
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [currentPath]);

  const value = useMemo(
    () => ({
      lenis: lenisRef.current,
      scrollTo: (
        target: number | string | HTMLElement,
        options?: {
          offset?: number;
          immediate?: boolean;
          duration?: number;
          easing?: (t: number) => number;
          onComplete?: () => void;
        }
      ) => {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(target, options);
        } else {
          if (typeof target === 'number') {
            window.scrollTo({ top: target, behavior: options?.immediate ? 'instant' : 'smooth' });
          } else if (typeof target === 'string') {
            const el = document.querySelector(target);
            el?.scrollIntoView({ behavior: options?.immediate ? 'instant' : 'smooth' });
          } else if (target instanceof HTMLElement) {
            target.scrollIntoView({ behavior: options?.immediate ? 'instant' : 'smooth' });
          }
        }
      },
    }),
    []
  );

  return (
    <SmoothScrollContext.Provider value={value}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
export default SmoothScrollProvider;
