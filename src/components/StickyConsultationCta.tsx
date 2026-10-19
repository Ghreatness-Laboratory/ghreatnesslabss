import React, { useEffect, useState, useRef } from 'react';
import { Calendar, ArrowRight, MessageSquareCode, Loader2 } from 'lucide-react';
import { ConsultationModal } from './ConsultationModal';

export function StickyConsultationCta({
  onNavigate,
}: {
  onNavigate?: (to: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Target the hero section on Home, or page-intro on subpages
    const getTargetSection = () => {
      return (
        document.querySelector<HTMLElement>('main > .hero') ||
        document.querySelector<HTMLElement>('main > .section.page-intro') ||
        document.querySelector<HTMLElement>('main > .section:first-child')
      );
    };

    let observer: IntersectionObserver | null = null;

    // Slight delay to ensure DOM is ready after route transitions
    const timer = setTimeout(() => {
      const target = getTargetSection();
      if (!target) {
        // Fallback: If no hero section found, show after 500px scroll
        const handleScrollFallback = () => {
          setIsVisible(window.scrollY > 450);
        };
        window.addEventListener('scroll', handleScrollFallback, { passive: true });
        return () => window.removeEventListener('scroll', handleScrollFallback);
      }

      // Use high-performance IntersectionObserver per performance guidelines
      observer = new IntersectionObserver(
        ([entry]) => {
          // If hero/page-intro is intersecting, user is at the top -> hide CTA
          // Once hero leaves the viewport, user has scrolled past -> show CTA
          setIsVisible(!entry.isIntersecting);
        },
        {
          rootMargin: '-80px 0px 0px 0px',
          threshold: 0,
        }
      );

      observer.observe(target);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, []);

  // Update body attribute for chat bubble safe clearance on mobile when visible
  useEffect(() => {
    if (isVisible) {
      document.body.classList.add('has-sticky-cta');
    } else {
      document.body.classList.remove('has-sticky-cta');
    }
    return () => {
      document.body.classList.remove('has-sticky-cta');
    };
  }, [isVisible]);

  // Global listener for other "Book a consultation" buttons to open the modal
  useEffect(() => {
    const handleTrigger = (e: MouseEvent) => {
      const target = (e.target as Element).closest<HTMLElement>('.button-solid, [data-consultation-trigger]');
      if (!target) return;

      const text = target.textContent?.toLowerCase().trim();
      if (text?.includes('book a consultation')) {
        e.preventDefault();
        e.stopPropagation();
        setModalOpen(true);
      }
    };

    document.addEventListener('click', handleTrigger, true);
    return () => document.removeEventListener('click', handleTrigger, true);
  }, []);

  return (
    <>
      <div
        className={`sticky-cta-wrapper ${isVisible ? 'sticky-cta-visible' : ''}`}
        aria-hidden={!isVisible}
      >
        {/* Desktop & Tablet Floating Button */}
        <div className="sticky-cta-desktop">
          <button
            type="button"
            className="sticky-cta-button"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                setModalOpen(true);
              }, 220);
            }}
            aria-label="Book a consultation with GhreatnessLabs"
          >
            {loading ? (
              <span className="button-spinner-wrap">
                <Loader2 size={14} className="animate-spin" />
                <span>Opening...</span>
              </span>
            ) : (
              <>
                <span className="sticky-cta-icon-dot" />
                <span className="sticky-cta-text">Book a Consultation</span>
                <ArrowRight size={14} className="sticky-cta-arrow" />
              </>
            )}
          </button>
        </div>

        {/* Mobile Fixed Bottom Bar */}
        <div className="sticky-cta-mobile-bar">
          <button
            type="button"
            className="sticky-cta-mobile-btn"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                setModalOpen(true);
              }, 220);
            }}
            aria-label="Book a consultation"
          >
            {loading ? (
              <span className="button-spinner-wrap">
                <Loader2 size={14} className="animate-spin" />
                <span>Opening...</span>
              </span>
            ) : (
              <>
                <span className="sticky-cta-icon-dot" />
                <span>Book a Consultation</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Consultation Channel Choice Modal (Email vs WhatsApp) */}
      <ConsultationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
}

export default StickyConsultationCta;
