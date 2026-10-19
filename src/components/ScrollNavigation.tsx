import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollNavigation() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
          const height =
            document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
          setScrollProgress(Math.min(100, Math.max(0, scrolled)));
          setShowBackToTop(winScroll > 600);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {/* Thin scroll progress bar fixed to top of viewport */}
      <div
        className="scroll-progress-track"
        aria-hidden="true"
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="scroll-progress-bar"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Back to top circular button positioned bottom-left to avoid chat bubble collision */}
      <button
        type="button"
        onClick={scrollToTop}
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
