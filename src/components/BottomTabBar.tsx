import React, { useEffect, useState } from 'react';
import { Home, Layers, Briefcase, Building2, MessageCircle } from 'lucide-react';
import { ConsultationModal } from './ConsultationModal';

interface BottomTabBarProps {
  path: string;
  onNavigate?: (to: string) => void;
}

const TAB_ITEMS = [
  { to: '/', label: 'Home', icon: Home, match: (p: string) => p === '/' },
  { to: '/services', label: 'Services', icon: Layers, match: (p: string) => p.startsWith('/services') },
  { to: '__cta__', label: 'Consult', icon: MessageCircle, match: () => false },
  { to: '/projects', label: 'Work', icon: Briefcase, match: (p: string) => p.startsWith('/projects') },
  { to: '/about', label: 'About', icon: Building2, match: (p: string) => p.startsWith('/about') },
] as const;

export function BottomTabBar({ path, onNavigate }: BottomTabBarProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Global listener so any "Book a consultation" button opens the ConsultationModal
  useEffect(() => {
    const handleTrigger = (e: MouseEvent) => {
      const target = (e.target as Element).closest<HTMLElement>(
        '.button-solid, [data-consultation-trigger]'
      );
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

  const handleTabClick = (e: React.MouseEvent, to: string) => {
    e.preventDefault();
    if (to === '__cta__') {
      setModalOpen(true);
      return;
    }
    if (onNavigate) {
      onNavigate(to);
    } else {
      window.location.href = to;
    }
  };

  return (
    <>
      <nav className="app-bottom-tab-bar" aria-label="Primary mobile navigation">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          if (item.to === '__cta__') {
            return (
              <button
                key="cta"
                type="button"
                className="bottom-tab-cta"
                onClick={() => setModalOpen(true)}
                aria-label="Open consultation and studio chat"
              >
                <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
              </button>
            );
          }

          const isActive = item.match(path);
          return (
            <a
              key={item.to}
              href={item.to}
              onClick={(e) => handleTabClick(e, item.to)}
              className={`bottom-tab-item ${isActive ? 'is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <ConsultationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
}

export default BottomTabBar;
