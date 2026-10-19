import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  CmsData,
  SiteSettings,
  StatItem,
  AboutCard,
  CapabilityItem,
  ServiceItem,
  HoldingItem,
  ProjectItem,
  LeaderItem,
  ClientItem,
  TestimonialItem,
  FaqItem,
  PageCopyItem,
  MediaItem,
} from '../types/cms';
import { defaultCmsData } from '../lib/defaultData';
import {
  fetchRemoteCmsData,
  getSupabaseConfig,
  persistRecordToRemote,
  persistSettingsToRemote,
  deleteRecordFromRemote,
} from '../lib/supabase';
import { deleteStoredFile } from '../lib/mediaStorage';

const CMS_STORAGE_KEY = 'ghreatness_cms_data_cache';

interface CmsContextValue {
  data: CmsData;
  isSupabaseConnected: boolean;
  isUsingFallback: boolean;
  isLoading: boolean;
  lastSynced: Date | null;
  errorMessage: string | null;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<boolean>;
  saveRecord: <K extends keyof CmsData>(
    table: K,
    record: CmsData[K] extends (infer U)[] ? U : never
  ) => Promise<boolean>;
  deleteRecord: (table: keyof CmsData, id: string) => Promise<boolean>;
  reorderRecords: (table: keyof CmsData, fromIndex: number, toIndex: number) => Promise<boolean>;
  assignMediaToSpot: (
    mediaId: string,
    spot: MediaItem['assigned_spot'],
    targetId?: string,
    targetLabel?: string
  ) => Promise<boolean>;
  replaceMediaItem: (
    mediaId: string,
    newUrl: string,
    newFilename?: string,
    newStoragePath?: string
  ) => Promise<boolean>;
  resetToDefaults: () => Promise<void>;
  refreshData: () => Promise<void>;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
}

const CmsContext = createContext<CmsContextValue | null>(null);

function loadLocalCache(): CmsData {
  try {
    const cached = localStorage.getItem(CMS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        settings: { ...defaultCmsData.settings, ...(parsed.settings || {}) },
        stats: Array.isArray(parsed.stats) ? parsed.stats : defaultCmsData.stats,
        aboutCards: Array.isArray(parsed.aboutCards)
          ? parsed.aboutCards
          : defaultCmsData.aboutCards,
        capabilities: Array.isArray(parsed.capabilities)
          ? parsed.capabilities
          : defaultCmsData.capabilities,
        services: Array.isArray(parsed.services) ? parsed.services : defaultCmsData.services,
        holding: Array.isArray(parsed.holding) ? parsed.holding : defaultCmsData.holding,
        projects: Array.isArray(parsed.projects) ? parsed.projects : defaultCmsData.projects,
        leadership: Array.isArray(parsed.leadership)
          ? parsed.leadership
          : defaultCmsData.leadership,
        clients: Array.isArray(parsed.clients) ? parsed.clients : defaultCmsData.clients,
        testimonials: Array.isArray(parsed.testimonials)
          ? parsed.testimonials
          : defaultCmsData.testimonials,
        faqs: Array.isArray(parsed.faqs) ? parsed.faqs : defaultCmsData.faqs,
        pages: Array.isArray(parsed.pages) ? parsed.pages : defaultCmsData.pages,
        media: Array.isArray(parsed.media) ? parsed.media : defaultCmsData.media,
      };
    }
  } catch (err) {
    console.warn('[GhreatnessLabs] Error reading local CMS cache:', err);
  }
  return defaultCmsData;
}

function saveLocalCache(data: CmsData) {
  try {
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('[GhreatnessLabs] Error saving local CMS cache:', err);
  }
}

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CmsData>(loadLocalCache);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>
  >([]);

  const notify = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const config = getSupabaseConfig();
    if (!config.url || !config.anonKey) {
      setIsSupabaseConnected(false);
      setIsUsingFallback(true);
      setIsLoading(false);
      return;
    }

    try {
      const remote = await fetchRemoteCmsData();
      if (remote) {
        setData((prev) => {
          const updated: CmsData = {
            settings: remote.settings ? { ...prev.settings, ...remote.settings } : prev.settings,
            stats: remote.stats && remote.stats.length > 0 ? (remote.stats as StatItem[]) : prev.stats,
            aboutCards:
              remote.aboutCards && remote.aboutCards.length > 0
                ? (remote.aboutCards as AboutCard[])
                : prev.aboutCards,
            capabilities:
              remote.capabilities && remote.capabilities.length > 0
                ? (remote.capabilities as CapabilityItem[])
                : prev.capabilities,
            services:
              remote.services && remote.services.length > 0
                ? (remote.services as ServiceItem[])
                : prev.services,
            holding:
              remote.holding && remote.holding.length > 0
                ? (remote.holding as HoldingItem[])
                : prev.holding,
            projects:
              remote.projects && remote.projects.length > 0
                ? (remote.projects as ProjectItem[])
                : prev.projects,
            leadership:
              remote.leadership && remote.leadership.length > 0
                ? (remote.leadership as LeaderItem[])
                : prev.leadership,
            clients:
              remote.clients && remote.clients.length > 0
                ? (remote.clients as ClientItem[])
                : prev.clients,
            testimonials:
              remote.testimonials && remote.testimonials.length > 0
                ? (remote.testimonials as TestimonialItem[])
                : prev.testimonials,
            faqs:
              remote.faqs && remote.faqs.length > 0
                ? (remote.faqs as FaqItem[])
                : prev.faqs,
            pages:
              remote.pages && remote.pages.length > 0
                ? (remote.pages as PageCopyItem[])
                : prev.pages,
            media:
              remote.media && remote.media.length > 0
                ? (remote.media as MediaItem[])
                : prev.media,
          };
          saveLocalCache(updated);
          return updated;
        });
        setIsSupabaseConnected(true);
        setIsUsingFallback(false);
        setLastSynced(new Date());
      } else {
        setIsSupabaseConnected(false);
        setIsUsingFallback(true);
      }
    } catch (err) {
      console.warn('[GhreatnessLabs] Sync failed, keeping local fallback:', err);
      setIsSupabaseConnected(false);
      setIsUsingFallback(true);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to sync with Supabase');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const updateSettings = useCallback(
    async (partial: Partial<SiteSettings>): Promise<boolean> => {
      let success = true;
      const updated: SiteSettings = { ...data.settings, ...partial };

      // Optimistic state
      setData((prev) => {
        const next = { ...prev, settings: updated };
        saveLocalCache(next);
        return next;
      });

      if (isSupabaseConnected) {
        const remoteOk = await persistSettingsToRemote(updated);
        if (!remoteOk) {
          notify('Saved locally. Remote Supabase update failed (check RLS policies).', 'info');
        } else {
          notify('Site settings updated in Supabase & live site!', 'success');
        }
      } else {
        notify('Site settings saved to local live CMS!', 'success');
      }

      return success;
    },
    [data.settings, isSupabaseConnected, notify]
  );

  const saveRecord = useCallback(
    async <K extends keyof CmsData>(
      table: K,
      record: CmsData[K] extends (infer U)[] ? U : never
    ): Promise<boolean> => {
      const rec = record as unknown as { id: string; sort_order?: number };
      const tableKey = table as keyof CmsData;

      setData((prev) => {
        const currentList = prev[tableKey];
        if (!Array.isArray(currentList)) return prev;

        const existsIndex = (currentList as Array<{ id: string }>).findIndex(
          (item) => item.id === rec.id
        );
        let updatedList: unknown[];

        if (existsIndex >= 0) {
          updatedList = [...currentList];
          updatedList[existsIndex] = rec;
        } else {
          updatedList = [...currentList, rec];
        }

        const next = { ...prev, [tableKey]: updatedList };
        saveLocalCache(next);
        return next;
      });

      if (isSupabaseConnected) {
        const tableNameMap: Record<string, string> = {
          aboutCards: 'about_cards',
          holding: 'holding_group',
          media: 'media_library',
        };
        const remoteTableName = tableNameMap[table] || table;
        const remoteOk = await persistRecordToRemote(
          remoteTableName,
          rec as Record<string, unknown>
        );
        if (!remoteOk) {
          notify(`Saved locally. Supabase write failed on ${remoteTableName}.`, 'info');
        } else {
          notify('Record saved successfully!', 'success');
        }
      } else {
        notify('Saved to local live CMS!', 'success');
      }

      return true;
    },
    [isSupabaseConnected, notify]
  );

  const deleteRecord = useCallback(
    async (table: keyof CmsData, id: string): Promise<boolean> => {
      // If deleting from media, trigger file deletion in Supabase Storage if uploaded
      if (table === 'media') {
        const targetMedia = data.media.find((m) => m.id === id);
        if (targetMedia && targetMedia.source === 'upload' && targetMedia.storage_path) {
          deleteStoredFile(targetMedia.storage_path).catch((err) =>
            console.warn('[GhreatnessLabs] Error deleting stored file:', err)
          );
        }

        // If it was assigned to leadership or clients, gracefully detach
        if (targetMedia && targetMedia.assigned_id) {
          if (targetMedia.assigned_spot === 'team_member') {
            setData((prev) => {
              const updatedLeaders = prev.leadership.map((l) =>
                l.id === targetMedia.assigned_id && l.avatar_url === targetMedia.url
                  ? { ...l, avatar_url: undefined }
                  : l
              );
              const next = { ...prev, leadership: updatedLeaders };
              saveLocalCache(next);
              return next;
            });
          } else if (targetMedia.assigned_spot === 'partner_logo') {
            setData((prev) => {
              const updatedClients = prev.clients.map((c) =>
                c.id === targetMedia.assigned_id && c.logo_url === targetMedia.url
                  ? { ...c, logo_url: undefined }
                  : c
              );
              const next = { ...prev, clients: updatedClients };
              saveLocalCache(next);
              return next;
            });
          }
        }
      }

      setData((prev) => {
        const currentList = prev[table];
        if (!Array.isArray(currentList)) return prev;

        const updatedList = (currentList as Array<{ id: string }>).filter(
          (item) => item.id !== id
        );
        const next = { ...prev, [table]: updatedList };
        saveLocalCache(next);
        return next;
      });

      if (isSupabaseConnected) {
        const tableNameMap: Record<string, string> = {
          aboutCards: 'about_cards',
          holding: 'holding_group',
          media: 'media_library',
        };
        const remoteTableName = tableNameMap[table] || table;
        await deleteRecordFromRemote(remoteTableName, id);
      }

      notify('Record removed.', 'info');
      return true;
    },
    [data.media, isSupabaseConnected, notify]
  );

  const assignMediaToSpot = useCallback(
    async (
      mediaId: string,
      spot: MediaItem['assigned_spot'],
      targetId?: string,
      targetLabel?: string
    ): Promise<boolean> => {
      let mediaUrl = '';

      setData((prev) => {
        const currentMedia = prev.media.find((m) => m.id === mediaId);
        if (!currentMedia) return prev;
        mediaUrl = currentMedia.url;

        // 1. Update media item
        const updatedMediaList = prev.media.map((m) =>
          m.id === mediaId
            ? {
                ...m,
                assigned_spot: spot,
                assigned_id: targetId,
                assigned_label: targetLabel,
                updated_at: new Date().toISOString(),
              }
            : m
        );

        let updatedLeaders = prev.leadership;
        let updatedClients = prev.clients;
        let updatedProjects = prev.projects;

        // 2. Cascade assignment to target surface
        if (spot === 'team_member' && targetId) {
          updatedLeaders = prev.leadership.map((l) =>
            l.id === targetId ? { ...l, avatar_url: mediaUrl } : l
          );
        } else if (spot === 'partner_logo' && targetId) {
          updatedClients = prev.clients.map((c) =>
            c.id === targetId ? { ...c, logo_url: mediaUrl } : c
          );
        } else if (spot === 'project' && targetId) {
          updatedProjects = prev.projects.map((p) =>
            p.id === targetId ? { ...p, hero_image_url: mediaUrl } : p
          );
        }

        const next: CmsData = {
          ...prev,
          media: updatedMediaList,
          leadership: updatedLeaders,
          clients: updatedClients,
          projects: updatedProjects,
        };

        saveLocalCache(next);
        return next;
      });

      // Persist to remote Supabase if connected
      if (isSupabaseConnected) {
        const targetMedia = data.media.find((m) => m.id === mediaId);
        if (targetMedia) {
          persistRecordToRemote('media_library', {
            ...targetMedia,
            assigned_spot: spot,
            assigned_id: targetId,
            assigned_label: targetLabel,
            updated_at: new Date().toISOString(),
          }).catch(() => {});
        }

        if (spot === 'team_member' && targetId) {
          const leader = data.leadership.find((l) => l.id === targetId);
          if (leader) {
            persistRecordToRemote('leadership', { ...leader, avatar_url: mediaUrl }).catch(() => {});
          }
        } else if (spot === 'partner_logo' && targetId) {
          const client = data.clients.find((c) => c.id === targetId);
          if (client) {
            persistRecordToRemote('clients', { ...client, logo_url: mediaUrl }).catch(() => {});
          }
        }
      }

      notify(`Image successfully assigned to ${targetLabel || spot}!`, 'success');
      return true;
    },
    [data.clients, data.leadership, data.media, isSupabaseConnected, notify]
  );

  const replaceMediaItem = useCallback(
    async (
      mediaId: string,
      newUrl: string,
      newFilename?: string,
      newStoragePath?: string
    ): Promise<boolean> => {
      setData((prev) => {
        const existing = prev.media.find((m) => m.id === mediaId);
        if (!existing) return prev;

        const oldUrl = existing.url;

        // If old one was stored in Supabase Storage and we are replacing it, delete the old file
        if (existing.source === 'upload' && existing.storage_path && existing.storage_path !== newStoragePath) {
          deleteStoredFile(existing.storage_path).catch(() => {});
        }

        const updatedMedia = prev.media.map((m) =>
          m.id === mediaId
            ? {
                ...m,
                url: newUrl,
                filename: newFilename || m.filename,
                storage_path: newStoragePath !== undefined ? newStoragePath : m.storage_path,
                updated_at: new Date().toISOString(),
              }
            : m
        );

        // Cascade URL update to any entities currently using the oldUrl
        const updatedLeaders = prev.leadership.map((l) =>
          l.avatar_url === oldUrl || l.id === existing.assigned_id ? { ...l, avatar_url: newUrl } : l
        );
        const updatedClients = prev.clients.map((c) =>
          c.logo_url === oldUrl || c.id === existing.assigned_id ? { ...c, logo_url: newUrl } : c
        );
        const updatedProjects = prev.projects.map((p) =>
          p.hero_image_url === oldUrl || p.id === existing.assigned_id ? { ...p, hero_image_url: newUrl } : p
        );

        const next: CmsData = {
          ...prev,
          media: updatedMedia,
          leadership: updatedLeaders,
          clients: updatedClients,
          projects: updatedProjects,
        };

        saveLocalCache(next);
        return next;
      });

      notify('Image replaced successfully! Associated surfaces updated.', 'success');
      return true;
    },
    [notify]
  );

  const reorderRecords = useCallback(
    async (table: keyof CmsData, fromIndex: number, toIndex: number): Promise<boolean> => {
      let updatedItems: Array<{ id: string; sort_order: number }> = [];

      setData((prev) => {
        const currentList = prev[table];
        if (!Array.isArray(currentList)) return prev;

        const list = [...(currentList as Array<{ id: string; sort_order: number }>)];
        if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) {
          return prev;
        }

        const [moved] = list.splice(fromIndex, 1);
        list.splice(toIndex, 0, moved);

        // Normalize sort_orders
        updatedItems = list.map((item, idx) => ({
          ...item,
          sort_order: idx + 1,
        }));

        const next = { ...prev, [table]: updatedItems };
        saveLocalCache(next);
        return next;
      });

      if (isSupabaseConnected && updatedItems.length > 0) {
        const tableNameMap: Record<string, string> = {
          aboutCards: 'about_cards',
          holding: 'holding_group',
        };
        const remoteTableName = tableNameMap[table] || table;
        for (const item of updatedItems) {
          persistRecordToRemote(remoteTableName, item as Record<string, unknown>).catch(
            () => {}
          );
        }
      }

      notify('Order updated', 'success');
      return true;
    },
    [isSupabaseConnected, notify]
  );

  const resetToDefaults = useCallback(async () => {
    setData(defaultCmsData);
    saveLocalCache(defaultCmsData);
    notify('Reset all content back to factory defaults.', 'info');
  }, [notify]);

  const value = useMemo(
    () => ({
      data,
      isSupabaseConnected,
      isUsingFallback,
      isLoading,
      lastSynced,
      errorMessage,
      updateSettings,
      saveRecord,
      deleteRecord,
      reorderRecords,
      assignMediaToSpot,
      replaceMediaItem,
      resetToDefaults,
      refreshData,
      notify,
      toasts,
    }),
    [
      data,
      isSupabaseConnected,
      isUsingFallback,
      isLoading,
      lastSynced,
      errorMessage,
      updateSettings,
      saveRecord,
      deleteRecord,
      reorderRecords,
      assignMediaToSpot,
      replaceMediaItem,
      resetToDefaults,
      refreshData,
      notify,
      toasts,
    ]
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms(): CmsContextValue {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
}
