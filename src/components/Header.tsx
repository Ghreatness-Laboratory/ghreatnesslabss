import React, { useEffect, useState } from 'react';
import { House, Search, Phone, Menu, X } from 'lucide-react';
import { site } from '../content';
import { pages, Link } from './SharedSections';

export function Header({
  path,
  onNavigate,
}: {
  path: string;
  onNavigate?: (to: string) => void;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const results = pages.filter(([, name]) =>
    name.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    setNavOpen(false);
    setSearchOpen(false);
    setQuery('');
  }, [path]);

  const handleLinkClick = (to: string) => {
    if (onNavigate) onNavigate(to);
    setNavOpen(false);
    setSearchOpen(false);
  };

  return (
    <header>
      <div className="announcement">
        <span>{site.status}</span>
        <a href="mailto:studio@ghreatness.io">studio@ghreatness.io</a>
      </div>
      <nav>
        <Link className="wordmark" to="/">
          GHREATNESSLABS
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
              setSearchOpen(!searchOpen);
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

      {searchOpen && (
        <div className="search-panel" role="dialog" aria-label="Site search">
          <label htmlFor="site-search">Search site</label>
          <div className="search-field">
            <Search />
            <input
              id="site-search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a page"
            />
            <button aria-label="Close search" onClick={() => setSearchOpen(false)}>
              <X />
            </button>
          </div>
          <div className="search-results">
            {results.length ? (
              results.map(([to, name]) => (
                <a
                  key={to}
                  href={to}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(to);
                  }}
                >
                  {name}
                </a>
              ))
            ) : (
              <p>No pages match “{query}”.</p>
            )}
          </div>
        </div>
      )}

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
