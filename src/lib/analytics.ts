/**
 * Safe custom event tracking helper for application analytics
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean | null | undefined>
) {
  try {
    // Clean null / undefined values
    const cleanProps: Record<string, string | number | boolean> = {};
    if (properties) {
      Object.entries(properties).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          cleanProps[key] = val;
        }
      });
    }

    if (import.meta.env.DEV) {
      console.log(`[Analytics] 📊 Event tracked: "${eventName}"`, cleanProps);
    }
  } catch (err) {
    // Non-blocking
    console.debug('[Analytics] Event tracking error:', err);
  }
}

export function trackConsultationClick(channel: 'email' | 'whatsapp' | 'modal' | 'sticky', label?: string) {
  trackEvent('consultation_clicked', {
    channel,
    label: label || 'default',
    timestamp: Date.now(),
  });
}

export function trackContactSubmit(serviceCategory: string) {
  trackEvent('contact_form_submitted', {
    service_category: serviceCategory,
    timestamp: Date.now(),
  });
}

export function trackIntakeSubmit(projectType: string, budgetRange: string, timeline: string) {
  trackEvent('intake_form_submitted', {
    project_type: projectType,
    budget_range: budgetRange,
    timeline,
    timestamp: Date.now(),
  });
}

export function trackSearchUsage(query: string, resultCount: number) {
  trackEvent('site_search_executed', {
    query: query.slice(0, 50),
    result_count: resultCount,
  });
}

export function trackProjectDetailView(slug: string, title: string) {
  trackEvent('project_detail_viewed', {
    project_slug: slug,
    project_title: title,
  });
}
