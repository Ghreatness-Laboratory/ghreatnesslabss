import { getSupabaseClient, persistRecordToRemote } from './supabase';

export interface ContactSubmissionPayload {
  id?: string;
  name: string;
  email: string;
  company: string;
  service_category: string;
  message: string;
  created_at?: string;
  status?: string;
}

export interface ProjectInquiryPayload {
  id?: string;
  name: string;
  email: string;
  company: string;
  project_type: string;
  budget_range: string;
  timeline: string;
  description: string;
  created_at?: string;
  status?: string;
}

const STORAGE_KEY_CONTACT_LOG = 'ghreatness_contact_submissions_cache';
const STORAGE_KEY_INQUIRY_LOG = 'ghreatness_project_inquiries_cache';

/**
 * Submit general contact form inquiry
 * 1. Inserts into Supabase `contact_submissions` table (or local storage fallback)
 * 2. Triggers Supabase Edge Function or Resend notification webhook
 */
export async function submitContactInquiry(
  payload: ContactSubmissionPayload
): Promise<{ success: boolean; message?: string }> {
  const submission = {
    id: payload.id || `contact-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    company: (payload.company || '').trim(),
    service_category: payload.service_category || 'General Scoping',
    message: payload.message.trim(),
    created_at: new Date().toISOString(),
    status: 'new',
  };

  // 1. Cache locally so offline / local admin preview can see it
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_CONTACT_LOG) || '[]');
    localStorage.setItem(STORAGE_KEY_CONTACT_LOG, JSON.stringify([submission, ...existing]));
  } catch (err) {
    console.warn('[Notifications] Failed to save local contact submission log:', err);
  }

  // 2. Persist to Supabase if configured
  const supabase = getSupabaseClient();
  let remoteOk = false;
  if (supabase) {
    try {
      const { error } = await supabase.from('contact_submissions').insert([submission]);
      if (error) {
        console.warn('[Notifications] Supabase insert warning on contact_submissions:', error.message);
      } else {
        remoteOk = true;
      }
    } catch (err) {
      console.warn('[Notifications] Supabase contact write error:', err);
    }
  }

  // 3. Trigger Edge Function / Email Notification
  if (supabase) {
    try {
      // Trigger Supabase edge function 'notify-contact'
      await supabase.functions.invoke('notify-contact', {
        body: {
          type: 'contact_submission',
          submission,
        },
      });
    } catch {
      // Non-blocking if edge function is not deployed yet in developer project
    }
  }

  return {
    success: true,
    message: 'Inquiry received. A senior partner will contact you within 1 business day.',
  };
}

/**
 * Submit structured project intake inquiry
 * 1. Inserts into Supabase `project_inquiries` table (or local storage fallback)
 * 2. Triggers Supabase Edge Function or Resend notification webhook
 */
export async function submitProjectInquiry(
  payload: ProjectInquiryPayload
): Promise<{ success: boolean; message?: string }> {
  const inquiry = {
    id: payload.id || `inquiry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    company: (payload.company || '').trim(),
    project_type: payload.project_type,
    budget_range: payload.budget_range,
    timeline: payload.timeline,
    description: payload.description.trim(),
    created_at: new Date().toISOString(),
    status: 'new',
  };

  // 1. Cache locally
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_INQUIRY_LOG) || '[]');
    localStorage.setItem(STORAGE_KEY_INQUIRY_LOG, JSON.stringify([inquiry, ...existing]));
  } catch (err) {
    console.warn('[Notifications] Failed to save local project inquiry log:', err);
  }

  // 2. Persist to Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('project_inquiries').insert([inquiry]);
      if (error) {
        console.warn('[Notifications] Supabase insert warning on project_inquiries:', error.message);
      }
    } catch (err) {
      console.warn('[Notifications] Supabase inquiry write error:', err);
    }

    // 3. Trigger Edge Function Notification
    try {
      await supabase.functions.invoke('notify-contact', {
        body: {
          type: 'project_inquiry',
          inquiry,
        },
      });
    } catch {
      // Non-blocking
    }
  }

  return {
    success: true,
    message: 'Project brief received. Our systems engineering team will review and reply within 1 business day.',
  };
}
