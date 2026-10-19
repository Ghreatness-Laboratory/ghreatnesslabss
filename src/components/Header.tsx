import React, { useEffect, useState } from 'react';
import { House, Search, Phone, Menu, X, ShieldAlert } from 'lucide-react';
import { pages, Link } from './SharedSections';
import { useCms } from '../context/CmsContext';

import { SearchModal } from './SearchModal';

export function Header({
  path,
  onNavigate,
}: {
  path: string;
  onNavigate?: (to: string) => void;
}) {
  const { data } = useCms();
  const { settings } = data;
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
    <header>
      <div className="announcement">
        <span>{settings.status}</span>
        <div className="announcement-actions">
          <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          <Link to="/admin" className="admin-quick-link" aria-label="Open Studio CMS Admin">
            <ShieldAlert size={12} />
            <span>Admin CMS</span>
          </Link>
        </div>
      </div>
      <nav>
        <Link className="wordmark" to="/">
          {settings.wordmark || 'GHREATNESSLABS'}
        </Link>
        <div className="navicons">
          <Link className="navicon" aria-label="Home" to="/">
            <House />
          </Link>
          <button
            className="navicon"
            aria-label="Search site"
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen(true);
              setNavOpen(false);
            }}
          >
            <Search />
          </button>
          <Link className="navicon" aria-label="Contact Us" to="/contact">
            <Phone />
          </Link>
          <span className="nav-divider" aria-hidden="true" />
          <button
            className="navicon nav-menu"
            aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={navOpen}
            onClick={() => {
              setNavOpen(!navOpen);
              setSearchOpen(false);
            }}
          >
            {navOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Full-featured Live Site Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleLinkClick}
      />

      {navOpen && (
        <div className="nav-drawer">
          <span className="label">Navigate</span>
          {pages.map(([to, name]) => (
            <a
              key={to}
              href={to}
              className={path === to ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(to);
              }}
            >
              {name}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
