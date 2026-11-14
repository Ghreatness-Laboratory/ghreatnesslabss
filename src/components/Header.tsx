import React, { useEffect, useState } from 'react';
import { Search, Menu, X, ArrowUpRight } from 'lucide-react';
import { pages, Link } from './SharedSections';
import { GhreatnessMark } from './GhreatnessLogo';
import { SearchModal } from './SearchModal';

export function Header({
  path,
  onNavigate,
}: {
  path: string;
  onNavigate?: (to: string) => void;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
    setSearchOpen(false);
  }, [path]);

  const handleLinkClick = (to: string) => {
    if (onNavigate) onNavigate(to);
    setNavOpen(false);
    setSearchOpen(false);
  };

  return (
    <header className="app-header">
      <nav className="app-topbar" aria-label="Top bar">
        <Link
          className="app-brand-lockup"
          to="/"
          aria-label="Ghreatness Laboratory — Return to homepage"
        >
          <span className="app-brand-tile" aria-hidden="true">
            <GhreatnessMark size={18} theme="light" />
          </span>
          <span className="app-brand-wordmark">
            <span className="app-brand-title">GHREATNESS</span>
            <span className="app-brand-sub">LABORATORY</span>
          </span>
        </Link>

        <div className="app-topbar-actions">
          <button
            type="button"
            className="app-icon-btn"
            aria-label="Search site"
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen(true);
              setNavOpen(false);
            }}
          >
            <Search size={18} strokeWidth={1.8} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="app-icon-btn"
            aria-label={navOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={navOpen}
            onClick={() => {
              setNavOpen((prev) => !prev);
              setSearchOpen(false);
            }}
          >
            {navOpen ? (
              <X size={18} strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <Menu size={18} strokeWidth={1.8} aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleLinkClick}
      />

      {navOpen && (
        <>
          <div
            className="nav-drawer-backdrop"
            aria-hidden="true"
            onClick={() => setNavOpen(false)}
          />
          <div className="nav-drawer" role="dialog" aria-label="Site navigation">
            <span className="nav-drawer-label">Navigate</span>
            <div className="nav-drawer-list">
              {pages.map(([to, name]) => (
                <a
                  key={to}
                  href={to}
                  className={`nav-drawer-link ${path === to ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(to);
                  }}
                >
                  <span>{name}</span>
                  <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
