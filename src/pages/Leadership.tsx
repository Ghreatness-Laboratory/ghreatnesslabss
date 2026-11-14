import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight, UsersRound } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import {
  SectionHead,
  EmptyState,
  LeaderSnapCard,
  ResilientAvatar,
} from '../components/SharedSections';
import { slugify } from '../components/admin/LinksManager';

export default function Leadership() {
  const { data } = useCms();
  const pageCopy = data.pages.find((p) => p.page_slug === 'leadership' && p.section_key === 'hero');

  const title = pageCopy?.title || 'A small team for';
  const subtitle = pageCopy?.subtitle || 'high-stakes work.';
  const intro =
    pageCopy?.content ||
    'Senior thinking stays close to the brief, the details, and the people making decisions.';

  const sortedLeaders = [...data.leadership].sort((a, b) => a.sort_order - b.sort_order);
  const trackRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [thumbWidthPct, setThumbWidthPct] = useState(35);
  const [progressPct, setProgressPct] = useState(0);

  const getCardStep = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 246;
    const card = track.querySelector<HTMLElement>('.leader-snap-card');
    if (!card) return 246;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '10') || 10;
    return card.getBoundingClientRect().width + gap;
  }, []);

  const syncScrollMetrics = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const { scrollLeft, scrollWidth, clientWidth } = track;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);

    setAtStart(scrollLeft <= 2);
    setAtEnd(maxScroll <= 2 || scrollLeft >= maxScroll - 2);

    if (scrollWidth > 0 && maxScroll > 0) {
      const ratioWidth = Math.max(20, Math.min(100, (clientWidth / scrollWidth) * 100));
      setThumbWidthPct(ratioWidth);
      setProgressPct(Math.max(0, Math.min(1, scrollLeft / maxScroll)));

      if (scrollLeft >= maxScroll - 6) {
        setActiveIndex(Math.max(0, sortedLeaders.length - 1));
      } else {
        const step = getCardStep();
        setActiveIndex(Math.max(0, Math.min(sortedLeaders.length - 1, Math.round(scrollLeft / step))));
      }
    } else {
      setThumbWidthPct(100);
      setProgressPct(0);
      setActiveIndex(0);
    }
  }, [getCardStep, sortedLeaders.length]);

  useEffect(() => {
    syncScrollMetrics();
    window.addEventListener('resize', syncScrollMetrics);
    return () => window.removeEventListener('resize', syncScrollMetrics);
  }, [syncScrollMetrics]);

  const scrollByCards = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * getCardStep(),
      behavior: 'smooth',
    });
  };

  const scrollToLeader = (idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    if (maxScroll <= 2) {
      setActiveIndex(idx);
      return;
    }
    const targetLeft = Math.min(maxScroll, idx * getCardStep());
    track.scrollTo({ left: targetLeft, behavior: 'smooth' });
    setActiveIndex(idx);
  };

  const handleTrackKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollByCards(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollByCards(-1);
    }
  };

  const maxOffsetPct = Math.max(0, 100 - thumbWidthPct);
  const thumbLeftPct = progressPct * maxOffsetPct;

  return (
    <section className="section page-intro leadership-page-section">
      <SectionHead
        as="h1"
        label="Leadership"
        title={title}
        accent={subtitle}
        copy={intro}
      />

      {sortedLeaders.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="Nothing here yet"
          subtitle="Studio leadership team profiles will appear here."
        />
      ) : (
        <>
          <div className="leadership-page-controls">
            <span className="leadership-swipe-hint">Meet the leaders · swipe →</span>
            {sortedLeaders.length > 1 && (
              <div className="leader-controls leadership-page-nav" role="group" aria-label="Scroll leadership cards">
                <button
                  type="button"
                  className="leader-nav-btn leader-nav-prev"
                  onClick={() => scrollByCards(-1)}
                  disabled={atStart}
                  aria-label="Scroll to previous leader"
                >
                  <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`leader-nav-btn leader-nav-next ${!atEnd ? 'is-solid' : ''}`}
                  onClick={() => scrollByCards(1)}
                  disabled={atEnd}
                  aria-label="Scroll to next leader"
                >
                  <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>

          <div
            ref={trackRef}
            className="leadership-page-track"
            role="region"
            aria-label="Leadership team"
            tabIndex={0}
            onScroll={syncScrollMetrics}
            onKeyDown={handleTrackKeyDown}
          >
            {sortedLeaders.map((leader) => (
              <div key={leader.id || leader.name} className="leadership-page-card-wrap">
                <LeaderSnapCard leader={leader} />
              </div>
            ))}
          </div>

          {sortedLeaders.length > 1 && (
            <div className="leadership-progress-bar" aria-hidden="true">
              <span
                className="leadership-progress-thumb"
                style={{
                  width: `${thumbWidthPct}%`,
                  transform: `translate3d(${(thumbLeftPct / thumbWidthPct) * 100}%, 0, 0)`,
                }}
              />
            </div>
          )}

          {sortedLeaders.length > 0 && (
            <div className="leadership-index-list" aria-label="Jump to team member">
              {sortedLeaders.map((leader, idx) => {
                const slug = leader.slug || slugify(leader.name);
                const profileUrl = `/leadership/${slug}`;
                const isSelected = activeIndex === idx;
                return (
                  <div
                    key={leader.id || leader.name}
                    className={`leadership-index-row ${isSelected ? 'is-active' : ''}`}
                  >
                    <button
                      type="button"
                      className="leadership-index-jump"
                      onClick={() => scrollToLeader(idx)}
                      aria-label={`Jump to ${leader.name}`}
                    >
                      <span className="leadership-index-avatar">
                        <ResilientAvatar src={leader.avatar_url} name={leader.name} />
                      </span>
                      <span className="leadership-index-copy">
                        <strong className="leadership-index-name">{leader.name}</strong>
                        <small className="leadership-index-role">{leader.role}</small>
                      </span>
                    </button>
                    <a
                      href={profileUrl}
                      className="leadership-index-profile"
                      aria-label={`Open full profile for ${leader.name}`}
                    >
                      <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
