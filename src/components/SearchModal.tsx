import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Layers,
  Briefcase,
  Building,
  Users,
  FileText,
  HelpCircle,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { getSupabaseClient } from '../lib/supabase';
import { pages } from './SharedSections';
import { trackSearchUsage } from '../lib/analytics';

export interface SearchResultItem {
  id: string;
  title: string;
  pageName: string;
  url: string;
  snippet?: string;
  type: 'service' | 'project' | 'holding' | 'leadership' | 'page' | 'faq';
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (to: string) => void;
}

export function SearchModal({ isOpen, onClose, onNavigate }: SearchModalProps) {
  const { data } = useCms();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setDebouncedQuery('');
      setResults([]);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key and scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounce query input (~200ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Execute search across Supabase tables and local CMS data
  useEffect(() => {
    const q = debouncedQuery.toLowerCase();
    if (!q) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    let isCurrent = true;

    async function performSearch() {
      const combinedResults: SearchResultItem[] = [];
      const seenIds = new Set<string>();

      // 1. Search Pages
      pages.forEach(([url, name]) => {
        if (name.toLowerCase().includes(q)) {
          const item: SearchResultItem = {
            id: `page-${url}`,
            title: name,
            pageName: 'Page Navigation',
            url,
            snippet: `Explore the ${name} section of GhreatnessLabs.`,
            type: 'page',
          };
          combinedResults.push(item);
          seenIds.add(item.id);
        }
      });

      // 2. Search Services (Digital + IT)
      (data.services || []).forEach((srv) => {
        const matchesTitle = srv.title.toLowerCase().includes(q);
        const matchesCat = (srv.category || '').toLowerCase().includes(q);
        const matchesDesc = (srv.description || '').toLowerCase().includes(q);

        if (matchesTitle || matchesCat || matchesDesc) {
          const id = `srv-${srv.id || srv.title}`;
          if (!seenIds.has(id)) {
            combinedResults.push({
              id,
              title: srv.title,
              pageName: `Services · ${srv.category === 'digital' ? 'Digital Systems' : 'Technology Infrastructure'}`,
              url: '/services',
              snippet: srv.description,
              type: 'service',
            });
            seenIds.add(id);
          }
        }
      });

      // 3. Search Selected Ventures & Projects
      (data.projects || []).forEach((proj) => {
        const matchesTitle = proj.title.toLowerCase().includes(q);
        const matchesCat = (proj.category_tag || '').toLowerCase().includes(q);
        const matchesDesc = (proj.description || '').toLowerCase().includes(q);
        const matchesDetail = (proj.detail || '').toLowerCase().includes(q);

        if (matchesTitle || matchesCat || matchesDesc || matchesDetail) {
          const id = `proj-${proj.id || proj.title}`;
          const projectUrl = proj.slug
            ? `/projects/${proj.slug}`
            : proj.project_url && proj.project_url.startsWith('/projects')
            ? proj.project_url
            : `/projects/${proj.id}`;

          if (!seenIds.has(id)) {
            combinedResults.push({
              id,
              title: proj.title,
              pageName: `Projects · ${proj.category_tag || 'Venture'}`,
              url: projectUrl,
              snippet: proj.description,
              type: 'project',
            });
            seenIds.add(id);
          }
        }
      });

      // 4. Search Holding Group Companies
      (data.holding || []).forEach((hold) => {
        const matchesName = hold.company_name.toLowerCase().includes(q);
        const matchesDesc = (hold.description || '').toLowerCase().includes(q);

        if (matchesName || matchesDesc) {
          const id = `hold-${hold.id || hold.company_name}`;
          if (!seenIds.has(id)) {
            combinedResults.push({
              id,
              title: hold.company_name,
              pageName: 'Holding Group · Portfolio Company',
              url: '/holding-group',
              snippet: hold.description,
              type: 'holding',
            });
            seenIds.add(id);
          }
        }
      });

      // 5. Search Leadership Team
      (data.leadership || []).forEach((ldr) => {
        const matchesName = ldr.name.toLowerCase().includes(q);
        const matchesRole = ldr.role.toLowerCase().includes(q);
        const matchesBio = (ldr.bio || '').toLowerCase().includes(q);

        if (matchesName || matchesRole || matchesBio) {
          const id = `lead-${ldr.id || ldr.name}`;
          if (!seenIds.has(id)) {
            combinedResults.push({
              id,
              title: ldr.name,
              pageName: `Leadership · ${ldr.role}`,
              url: '/leadership',
              snippet: ldr.bio,
              type: 'leadership',
            });
            seenIds.add(id);
          }
        }
      });

      // 6. Search FAQs
      (data.faqs || []).forEach((faq) => {
        const matchesQ = faq.question.toLowerCase().includes(q);
        const matchesA = faq.answer.toLowerCase().includes(q);

        if (matchesQ || matchesA) {
          const id = `faq-${faq.id}`;
          if (!seenIds.has(id)) {
            combinedResults.push({
              id,
              title: faq.question,
              pageName: 'Frequently Asked Questions',
              url: '/#faq',
              snippet: faq.answer,
              type: 'faq',
            });
            seenIds.add(id);
          }
        }
      });

      // 7. Supabase remote query with `ilike` for partial matching
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const pattern = `%${q}%`;
          const [srvRes, projRes, holdRes, leadRes] = await Promise.all([
            supabase
              .from('services')
              .select('id, title, category, description')
              .or(`title.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern}`)
              .limit(5),
            supabase
              .from('projects')
              .select('id, title, category_tag, description')
              .or(`title.ilike.${pattern},description.ilike.${pattern},category_tag.ilike.${pattern}`)
              .limit(5),
            supabase
              .from('holding_group')
              .select('id, company_name, description')
              .or(`company_name.ilike.${pattern},description.ilike.${pattern}`)
              .limit(5),
            supabase
              .from('leadership')
              .select('id, name, role, bio')
              .or(`name.ilike.${pattern},role.ilike.${pattern},bio.ilike.${pattern}`)
              .limit(5),
          ]);

          if (srvRes.data) {
            srvRes.data.forEach((s) => {
              const id = `srv-${s.id}`;
              if (!seenIds.has(id)) {
                combinedResults.push({
                  id,
                  title: s.title,
                  pageName: `Services · ${s.category === 'digital' ? 'Digital Systems' : 'Technology Infrastructure'}`,
                  url: '/services',
                  snippet: s.description,
                  type: 'service',
                });
                seenIds.add(id);
              }
            });
          }

          if (projRes.data) {
            projRes.data.forEach((p) => {
              const id = `proj-${p.id}`;
              if (!seenIds.has(id)) {
                combinedResults.push({
                  id,
                  title: p.title,
                  pageName: `Projects · ${p.category_tag || 'Venture'}`,
                  url: '/projects',
                  snippet: p.description,
                  type: 'project',
                });
                seenIds.add(id);
              }
            });
          }

          if (holdRes.data) {
            holdRes.data.forEach((h) => {
              const id = `hold-${h.id}`;
              if (!seenIds.has(id)) {
                combinedResults.push({
                  id,
                  title: h.company_name,
                  pageName: 'Holding Group · Portfolio Company',
                  url: '/holding-group',
                  snippet: h.description,
                  type: 'holding',
                });
                seenIds.add(id);
              }
            });
          }

          if (leadRes.data) {
            leadRes.data.forEach((l) => {
              const id = `lead-${l.id}`;
              if (!seenIds.has(id)) {
                combinedResults.push({
                  id,
                  title: l.name,
                  pageName: `Leadership · ${l.role}`,
                  url: '/leadership',
                  snippet: l.bio,
                  type: 'leadership',
                });
                seenIds.add(id);
              }
            });
          }
        } catch (err) {
          // Fallback gracefully to in-memory search
          console.warn('[SearchModal] Supabase search error:', err);
        }
      }

      if (isCurrent) {
        setResults(combinedResults);
        setIsSearching(false);
        trackSearchUsage(debouncedQuery, combinedResults.length);
      }
    }

    performSearch();

    return () => {
      isCurrent = false;
    };
  }, [debouncedQuery, data]);

  if (!isOpen) return null;

  const handleSelectResult = (url: string) => {
    if (onNavigate) {
      onNavigate(url);
    } else {
      window.location.href = url;
    }
    onClose();
  };

  const getResultIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'service':
        return <Layers size={16} />;
      case 'project':
        return <Briefcase size={16} />;
      case 'holding':
        return <Building size={16} />;
      case 'leadership':
        return <Users size={16} />;
      case 'faq':
        return <HelpCircle size={16} />;
      case 'page':
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <div
      className="search-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Studio Site Search"
    >
      <div className="search-modal-container">
        {/* Top Input Bar */}
        <div className="search-modal-header">
          <div className="search-modal-input-wrap">
            <Search className="search-modal-icon" size={18} />
            <input
              ref={inputRef}
              type="search"
              className="search-modal-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services, ventures, holding companies, team..."
              aria-label="Search query"
              autoComplete="off"
              spellCheck="false"
            />
            {query && (
              <button
                type="button"
                className="search-modal-clear"
                onClick={() => setQuery('')}
                aria-label="Clear query"
              >
                Clear
              </button>
            )}
          </div>
          <button
            type="button"
            className="search-modal-close"
            onClick={onClose}
            aria-label="Close search (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Status / Result Info */}
        <div className="search-modal-meta">
          {isSearching ? (
            <span className="search-modal-status">
              <Loader2 size={12} className="animate-spin" /> Searching studio records...
            </span>
          ) : debouncedQuery ? (
            <span className="search-modal-status">
              {results.length} result{results.length === 1 ? '' : 's'} for “{debouncedQuery}”
            </span>
          ) : (
            <span className="search-modal-hint">
              Type to search across all services, projects, holding companies, and leadership.
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="search-modal-results">
          {debouncedQuery && results.length > 0 && (
            <div className="search-results-list" role="list">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="search-result-row"
                  onClick={() => handleSelectResult(item.url)}
                  role="listitem"
                >
                  <span className={`search-result-icon-badge search-badge-${item.type}`}>
                    {getResultIcon(item.type)}
                  </span>
                  <div className="search-result-content">
                    <div className="search-result-heading">
                      <span className="search-result-title">{item.title}</span>
                      <span className="search-result-tag">{item.pageName}</span>
                    </div>
                    {item.snippet && (
                      <p className="search-result-snippet">{item.snippet}</p>
                    )}
                  </div>
                  <ArrowRight size={14} className="search-result-arrow" />
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {debouncedQuery && !isSearching && results.length === 0 && (
            <div className="search-empty-state">
              <p className="search-empty-title">No results found for “{debouncedQuery}”</p>
              <p className="search-empty-suggestion">
                Try searching for keywords like <em>Infrastructure</em>, <em>Fintech</em>, <em>Digital Systems</em>, <em>Consultation</em>, or <em>Leadership</em>.
              </p>
            </div>
          )}

          {/* Suggested Quick Searches when query is empty */}
          {!debouncedQuery && (
            <div className="search-quick-suggestions">
              <span className="search-quick-label">Suggested searches</span>
              <div className="search-quick-pills">
                {['Digital Systems', 'IT Solutions', 'Infrastructure', 'Ventures', 'Leadership', 'FAQ'].map(
                  (term) => (
                    <button
                      key={term}
                      type="button"
                      className="search-quick-pill"
                      onClick={() => setQuery(term)}
                    >
                      <Sparkles size={11} /> {term}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="search-modal-footer">
          <span>Press <kbd>ESC</kbd> to exit</span>
          <span>Studio Systems Directory</span>
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
