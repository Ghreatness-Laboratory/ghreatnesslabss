import React, { useEffect, useState, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { useSmoothScroll } from '../context/SmoothScrollContext';

export function ScrollNavigation() {
  const { lenis, scrollTo } = useSmoothScroll();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const lastStateRef = useRef(false);

  useEffect(() => {
    const updateProgress = (scroll: number, limit: number) => {
      const progress = limit > 0 ? Math.min(1, Math.max(0, scroll / limit)) : 0;
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${progress})`;
      }

      const shouldShow = scroll > 500;
      if (shouldShow !== lastStateRef.current) {
        lastStateRef.current = shouldShow;
        setShowBackToTop(shouldShow);
      }
    };

    if (lenis) {
      const unsubscribe = lenis.on('scroll', (e: { scroll: number; limit: number }) => {
        updateProgress(e.scroll, e.limit);
      });
      return () => {
        unsubscribe();
      };
    } else {
      let ticking = false;
      const handleNativeScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
            const height =
              document.documentElement.scrollHeight - document.documentElement.clientHeight;
            updateProgress(winScroll, height);
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', handleNativeScroll, { passive: true });
      handleNativeScroll();
      return () => window.removeEventListener('scroll', handleNativeScroll);
    }
  }, [lenis]);

  const handleScrollToTop = () => {
    scrollTo(0, {
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  };

  return (
    <>
      {/* Precision scroll progress indicator fixed to top */}
      <div
        className="scroll-progress-track"
        aria-hidden="true"
        role="progressbar"
      >
        <div
          ref={progressBarRef}
          className="scroll-progress-bar"
        />
      </div>

      {/* Floating Back to Top Button */}
      <button
        type="button"
        onClick={handleScrollToTop}
        className={`back-to-top-btn ${showBackToTop ? 'back-to-top-visible' : ''}`}
        aria-label="Back to top of page"
        title="Back to top"
      >
        <ArrowUp size={18} />
      </button>
    </>
  );
}

export default ScrollNavigation;
