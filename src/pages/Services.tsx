import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { SectionHead, ServiceList, Button } from '../components/SharedSections';

function readTabFromUrl(): 'digital' | 'it' {
  if (typeof window === 'undefined') return 'digital';
  const hash = window.location.hash.replace('#', '').toLowerCase();
  const queryTab = new URLSearchParams(window.location.search).get('tab')?.toLowerCase();
  const raw = hash || queryTab;
  return raw === 'it' || raw === 'technology' ? 'it' : 'digital';
}

export default function Services() {
  const { data } = useCms();
  const [activeTab, setActiveTab] = useState<'digital' | 'it'>(readTabFromUrl);

  useEffect(() => {
    const syncTabFromUrl = () => {
      setActiveTab(readTabFromUrl());
    };
    window.addEventListener('hashchange', syncTabFromUrl);
    window.addEventListener('popstate', syncTabFromUrl);
    return () => {
      window.removeEventListener('hashchange', syncTabFromUrl);
      window.removeEventListener('popstate', syncTabFromUrl);
    };
  }, []);

  const handleSelectTab = (tab: 'digital' | 'it') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const nextUrl = `${window.location.pathname}${window.location.search}#${tab}`;
      window.history.replaceState(null, '', nextUrl);
    }
  };

  const pageCopy = data.pages.find((p) => p.page_slug === 'services' && p.section_key === 'hero');

  const title = pageCopy?.title || 'Full-spectrum capabilities';
  const subtitle = pageCopy?.subtitle || 'under one roof.';
  const intro =
    pageCopy?.content ||
    'Digital craft and technology delivery, brought together around the work that will make the greatest difference.';

  const digitalServices = data.services
    .filter((s) => s.category === 'digital')
    .sort((a, b) => a.sort_order - b.sort_order);

  const technologyServices = data.services
    .filter((s) => s.category === 'technology')
    .sort((a, b) => a.sort_order - b.sort_order);

  const activeItems = activeTab === 'digital' ? digitalServices : technologyServices;

  return (
    <section className="section page-intro services-page-section">
      <SectionHead
        as="h1"
        label="Practice areas"
        title={title}
        accent={subtitle}
        copy={intro}
      />

      <div className="segmented-control" role="tablist" aria-label="Service categories">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'digital'}
          className={`segmented-tab ${activeTab === 'digital' ? 'is-active' : ''}`}
          onClick={() => handleSelectTab('digital')}
        >
          Digital ({digitalServices.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'it'}
          className={`segmented-tab ${activeTab === 'it' ? 'is-active' : ''}`}
          onClick={() => handleSelectTab('it')}
        >
          IT ({technologyServices.length})
        </button>
      </div>

      <div className="service-tab-panel" role="tabpanel">
        <div className="service-panel-caption">
          <span>
            {activeTab === 'digital'
              ? 'Creative work that carries further.'
              : 'Systems made to perform.'}
          </span>
        </div>
        <ServiceList items={activeItems} />
      </div>

      <div className="center-action">
        <Button solid>
          <span>Book a consultation</span>
          <ArrowRight size={16} strokeWidth={2} className="btn-arrow-green" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
