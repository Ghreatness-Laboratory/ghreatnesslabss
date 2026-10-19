import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CmsData, SiteSettings } from '../types/cms';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  source: 'env' | 'storage' | 'none';
}

const STORAGE_KEY_URL = 'ghreatness_supabase_url';
const STORAGE_KEY_ANON = 'ghreatness_supabase_anon_key';
const STORAGE_KEY_PASSCODE = 'ghreatness_admin_passcode';

export function getStoredPasscode(): string {
  return localStorage.getItem(STORAGE_KEY_PASSCODE) || 'ghreatness2026';
}

export function setStoredPasscode(code: string): void {
  localStorage.setItem(STORAGE_KEY_PASSCODE, code);
}

export function getSupabaseConfig(): SupabaseConfig {
  const storedUrl = localStorage.getItem(STORAGE_KEY_URL);
  const storedKey = localStorage.getItem(STORAGE_KEY_ANON);

  if (storedUrl && storedKey) {
    return { url: storedUrl.trim(), anonKey: storedKey.trim(), source: 'storage' };
  }

  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (envUrl && envKey) {
    return { url: envUrl.trim(), anonKey: envKey.trim(), source: 'env' };
  }

  return { url: '', anonKey: '', source: 'none' };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (!url || !anonKey) {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
    cachedClient = null;
    return;
  }
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  cachedClient = null;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return cachedClient;
  } catch (err) {
    console.warn('[GhreatnessLabs] Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(
  testUrl?: string,
  testKey?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const url = testUrl || getSupabaseConfig().url;
    const key = testKey || getSupabaseConfig().anonKey;

    if (!url || !key) {
      return { success: false, message: 'URL and Anon key must not be empty.' };
    }

    const client = createClient(url, key);
    // Try pinging site_settings or schema
    const { error } = await client.from('site_settings').select('id').limit(1);

    if (error) {
      // If table doesn't exist yet, it's connected to Supabase but needs SQL migration
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: true,
          message:
            'Connected to Supabase project! (Tables not yet found — please run the SQL Migration script)',
        };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Successfully connected and verified Supabase tables!' };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Connection failed: ${errorMsg}` };
  }
}

// Convert DB snake_case to SiteSettings camelCase
function mapDbSettings(row: Record<string, unknown>): SiteSettings {
  return {
    id: String(row.id || 'default-settings'),
    wordmark: String(row.wordmark || 'GHREATNESSLABS'),
    status: String(row.status || ''),
    heroEyebrow: String(row.hero_eyebrow || ''),
    heroTitlePrimary: String(row.hero_title_primary || ''),
    heroTitleSecondary: String(row.hero_title_secondary || ''),
    heroBody: String(row.hero_body || ''),
    contactEmail: String(row.contact_email || 'studio@ghreatness.io'),
    hotline: String(row.hotline || '+234 800 000 0000'),
    whatsappNumber: String(row.whatsapp_number || '+2348000000000'),
    officeAddress: String(row.office_address || 'Victoria Island'),
    officeCity: String(row.office_city || 'Lagos, Nigeria'),
    socialInstagram: String(row.social_instagram || 'https://instagram.com'),
    socialTwitter: String(row.social_twitter || 'https://x.com'),
    socialLinkedin: String(row.social_linkedin || 'https://linkedin.com'),
    footerTagline: String(row.footer_tagline || ''),
    copyrightText: String(row.copyright_text || '© 2026 GHREATNESSLABS. All rights reserved.'),
    availabilityText: String(row.availability_text || 'Q2 projects'),
  };
}

// Convert SiteSettings camelCase to DB snake_case
function mapSettingsToDb(settings: SiteSettings): Record<string, unknown> {
  return {
    id: settings.id || 'default-settings',
    wordmark: settings.wordmark,
    status: settings.status,
    hero_eyebrow: settings.heroEyebrow,
    hero_title_primary: settings.heroTitlePrimary,
    hero_title_secondary: settings.heroTitleSecondary,
    hero_body: settings.heroBody,
    contact_email: settings.contactEmail,
    hotline: settings.hotline,
    whatsapp_number: settings.whatsappNumber,
    office_address: settings.officeAddress,
    office_city: settings.officeCity,
    social_instagram: settings.socialInstagram,
    social_twitter: settings.socialTwitter,
    social_linkedin: settings.socialLinkedin,
    footer_tagline: settings.footerTagline,
    copyright_text: settings.copyrightText,
    availability_text: settings.availabilityText,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchRemoteCmsData(): Promise<Partial<CmsData> | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [
      settingsRes,
      statsRes,
      aboutRes,
      capsRes,
      srvRes,
      holdingRes,
      projectsRes,
      leadersRes,
      clientsRes,
      testimRes,
      faqsRes,
      pagesRes,
    ] = await Promise.all([
      client.from('site_settings').select('*').limit(1).maybeSingle(),
      client.from('stats').select('*').order('sort_order', { ascending: true }),
      client.from('about_cards').select('*').order('sort_order', { ascending: true }),
      client.from('capabilities').select('*').order('sort_order', { ascending: true }),
      client.from('services').select('*').order('sort_order', { ascending: true }),
      client.from('holding_group').select('*').order('sort_order', { ascending: true }),
      client.from('projects').select('*').order('sort_order', { ascending: true }),
      client.from('leadership').select('*').order('sort_order', { ascending: true }),
      client.from('clients').select('*').order('sort_order', { ascending: true }),
      client.from('testimonials').select('*').order('sort_order', { ascending: true }),
      client.from('faqs').select('*').order('sort_order', { ascending: true }),
      client.from('pages').select('*'),
    ]);

    const partialData: Partial<CmsData> = {};

    if (settingsRes.data) {
      partialData.settings = mapDbSettings(settingsRes.data);
    }
    if (statsRes.data && statsRes.data.length > 0) {
      partialData.stats = statsRes.data;
    }
    if (aboutRes.data && aboutRes.data.length > 0) {
      partialData.aboutCards = aboutRes.data;
    }
    if (capsRes.data && capsRes.data.length > 0) {
      partialData.capabilities = capsRes.data;
    }
    if (srvRes.data && srvRes.data.length > 0) {
      partialData.services = srvRes.data;
    }
    if (holdingRes.data && holdingRes.data.length > 0) {
      partialData.holding = holdingRes.data;
    }
    if (projectsRes.data && projectsRes.data.length > 0) {
      partialData.projects = projectsRes.data;
    }
    if (leadersRes.data && leadersRes.data.length > 0) {
      partialData.leadership = leadersRes.data;
    }
    if (clientsRes.data && clientsRes.data.length > 0) {
      partialData.clients = clientsRes.data;
    }
    if (testimRes.data && testimRes.data.length > 0) {
      partialData.testimonials = testimRes.data;
    }
    if (faqsRes.data && faqsRes.data.length > 0) {
      partialData.faqs = faqsRes.data;
    }
    if (pagesRes.data && pagesRes.data.length > 0) {
      partialData.pages = pagesRes.data;
    }

    return Object.keys(partialData).length > 0 ? partialData : null;
  } catch (err) {
    console.warn('[GhreatnessLabs] Error querying Supabase data:', err);
    return null;
  }
}

export async function persistSettingsToRemote(settings: SiteSettings): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const dbPayload = mapSettingsToDb(settings);
    const { error } = await client.from('site_settings').upsert(dbPayload);
    if (error) {
      console.error('[GhreatnessLabs] Failed to save site_settings:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[GhreatnessLabs] Remote save exception:', err);
    return false;
  }
}

export async function persistRecordToRemote(
  table: string,
  record: Record<string, unknown>
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from(table).upsert(record);
    if (error) {
      console.error(`[GhreatnessLabs] Failed to save record to ${table}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[GhreatnessLabs] Remote save exception on ${table}:`, err);
    return false;
  }
}

export async function deleteRecordFromRemote(table: string, id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from(table).delete().eq('id', id);
    if (error) {
      console.error(`[GhreatnessLabs] Failed to delete from ${table}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[GhreatnessLabs] Remote delete exception on ${table}:`, err);
    return false;
  }
}
