import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  Users,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  AlertTriangle,
  Eye,
  Globe,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Linkedin,
  Twitter,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Download,
  Copy,
  FileText,
  Compass,
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { ProjectItem, HoldingItem, LeaderItem } from '../../types/cms';
import { MediaPickerModal } from './MediaPickerModal';
import { generateSitemapXml, syncSitemapToFile } from '../../lib/sitemapGenerator';

// Helper for strict https URL validation
export function isValidHttpsUrl(urlString?: string): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  if (!trimmed.startsWith('https://')) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' && parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

// Helper to slugify string
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

export function LinksManager() {
  const {
    data,
    saveRecord,
    deleteRecord,
    reorderRecords,
    updateSettings,
    notify,
  } = useCms();

  const [activeTab, setActiveTab] = useState<'projects' | 'holding' | 'leadership' | 'sitemap'>('projects');
  const [copiedSitemap, setCopiedSitemap] = useState(false);
  const [isSyncingSitemap, setIsSyncingSitemap] = useState(false);

  // Media Picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<
    'project_cover' | 'holding_logo' | 'leader_avatar' | 'parent_holding_logo' | null
  >(null);
  const [currentMediaUrl, setCurrentMediaUrl] = useState('');

  // Delete confirmation modal state
  const [itemToDelete, setItemToDelete] = useState<{
    table: 'projects' | 'holding' | 'leadership';
    id: string;
    title: string;
  } | null>(null);

  // Form states for creating / editing
  const [projectModal, setProjectModal] = useState<{
    isOpen: boolean;
    isNew: boolean;
    data: Partial<ProjectItem>;
    errors: Record<string, string>;
  }>({
    isOpen: false,
    isNew: true,
    data: {},
    errors: {},
  });

  const [holdingModal, setHoldingModal] = useState<{
    isOpen: boolean;
    isNew: boolean;
    data: Partial<HoldingItem>;
    errors: Record<string, string>;
  }>({
    isOpen: false,
    isNew: true,
    data: {},
    errors: {},
  });

  const [leaderModal, setLeaderModal] = useState<{
    isOpen: boolean;
    isNew: boolean;
    data: Partial<LeaderItem>;
    errors: Record<string, string>;
  }>({
    isOpen: false,
    isNew: true,
    data: {},
    errors: {},
  });

  // Parent Holding Group quick banner editor
  const [parentHoldingForm, setParentHoldingForm] = useState({
    name: data.settings.holdingGroupName || 'Ghreatness Group',
    url: data.settings.holdingGroupUrl || 'https://group.ghreatnesslab.com.ng',
    logo: data.settings.holdingGroupLogo || '/logo-mark.svg',
    description:
      data.settings.holdingGroupDescription ||
      'Parent collective fostering digital technology, ventures, and infrastructure.',
  });
  const [savingParentHolding, setSavingParentHolding] = useState(false);

  // Reorder handlers
  const handleMoveUp = async (
    table: 'projects' | 'holding' | 'leadership',
    index: number
  ) => {
    if (index <= 0) return;
    await reorderRecords(table, index, index - 1);
    notify('Order updated and synced to live site!', 'success');
  };

  const handleMoveDown = async (
    table: 'projects' | 'holding' | 'leadership',
    index: number,
    total: number
  ) => {
    if (index >= total - 1) return;
    await reorderRecords(table, index, index + 1);
    notify('Order updated and synced to live site!', 'success');
  };

  // Open Media Picker for specific target
  const openMediaPicker = (
    target: 'project_cover' | 'holding_logo' | 'leader_avatar' | 'parent_holding_logo',
    current: string = ''
  ) => {
    setMediaPickerTarget(target);
    setCurrentMediaUrl(current);
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaPickerTarget === 'project_cover') {
      setProjectModal((prev) => ({
        ...prev,
        data: { ...prev.data, image_url: url, hero_image_url: url },
      }));
    } else if (mediaPickerTarget === 'holding_logo') {
      setHoldingModal((prev) => ({
        ...prev,
        data: { ...prev.data, logo_url: url },
      }));
    } else if (mediaPickerTarget === 'leader_avatar') {
      setLeaderModal((prev) => ({
        ...prev,
        data: { ...prev.data, avatar_url: url },
      }));
    } else if (mediaPickerTarget === 'parent_holding_logo') {
      setParentHoldingForm((prev) => ({ ...prev, logo: url }));
    }
    setMediaPickerOpen(false);
  };

  // Delete Action
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await deleteRecord(itemToDelete.table, itemToDelete.id);
    notify(`Deleted "${itemToDelete.title}" successfully.`, 'info');
    if (itemToDelete.table === 'projects') {
      const updated = data.projects.filter((p) => p.id !== itemToDelete.id);
      syncSitemapToFile({ ...data, projects: updated });
    } else if (itemToDelete.table === 'leadership') {
      const updated = data.leadership.filter((l) => l.id !== itemToDelete.id);
      syncSitemapToFile({ ...data, leadership: updated });
    }
    setItemToDelete(null);
  };

  const handleDownloadSitemap = () => {
    const xml = generateSitemapXml(data);
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sitemap.xml');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Downloaded updated sitemap.xml', 'success');
  };

  const handleCopySitemap = () => {
    const xml = generateSitemapXml(data);
    navigator.clipboard.writeText(xml);
    setCopiedSitemap(true);
    notify('Copied sitemap.xml to clipboard', 'success');
    setTimeout(() => setCopiedSitemap(false), 2000);
  };

  const handleSyncSitemap = async () => {
    setIsSyncingSitemap(true);
    const ok = await syncSitemapToFile(data);
    setIsSyncingSitemap(false);
    if (ok) {
      notify('Updated public/sitemap.xml on server!', 'success');
    } else {
      notify('Sitemap generated! You can copy or download below.', 'info');
    }
  };

  // -------------------------------------------------------------
  // PROJECT FORM HANDLERS
  // -------------------------------------------------------------
  const openAddProject = () => {
    const nextOrder = data.projects.length + 1;
    setProjectModal({
      isOpen: true,
      isNew: true,
      data: {
        id: `proj-${Date.now()}`,
        title: '',
        description: '',
        live_url: '',
        image_url: '',
        published: true,
        category_tag: 'Digital System',
        slug: '',
        sort_order: nextOrder,
      },
      errors: {},
    });
  };

  const openEditProject = (item: ProjectItem) => {
    setProjectModal({
      isOpen: true,
      isNew: false,
      data: { ...item },
      errors: {},
    });
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const proj = projectModal.data;

    if (!proj.title?.trim()) {
      errors.title = 'Project title is required.';
    }

    if (!proj.description?.trim()) {
      errors.description = 'Short description is required.';
    } else if (proj.description.length > 160) {
      errors.description = `Description exceeds 160 characters (currently ${proj.description.length}).`;
    }

    if (!proj.live_url?.trim()) {
      errors.live_url = 'Live website URL is required.';
    } else if (!isValidHttpsUrl(proj.live_url)) {
      errors.live_url = 'Must be a valid https link (e.g. https://example.com).';
    }

    if (Object.keys(errors).length > 0) {
      setProjectModal((prev) => ({ ...prev, errors }));
      return;
    }

    const finalSlug = proj.slug?.trim() || slugify(proj.title || `project-${Date.now()}`);

    const completeRecord: ProjectItem = {
      id: proj.id || `proj-${Date.now()}`,
      title: proj.title!.trim(),
      description: proj.description!.trim(),
      live_url: proj.live_url!.trim(),
      project_url: proj.project_url || `/projects/${finalSlug}`,
      slug: finalSlug,
      category_tag: proj.category_tag || 'Systems Platform',
      image_url: proj.image_url?.trim() || undefined,
      hero_image_url: proj.hero_image_url?.trim() || proj.image_url?.trim() || undefined,
      published: proj.published !== false,
      sort_order: proj.sort_order ?? data.projects.length + 1,
      detail: proj.detail || proj.description,
      challenge: proj.challenge,
      approach: proj.approach,
      result: proj.result,
      tech_stack: proj.tech_stack || ['React', 'TypeScript', 'Tailwind CSS'],
    };

    await saveRecord('projects', completeRecord);
    notify(`Saved project "${completeRecord.title}"! Changes are live.`, 'success');
    setProjectModal((prev) => ({ ...prev, isOpen: false }));
    const updatedProjects = data.projects.some((p) => p.id === completeRecord.id)
      ? data.projects.map((p) => (p.id === completeRecord.id ? completeRecord : p))
      : [...data.projects, completeRecord];
    syncSitemapToFile({ ...data, projects: updatedProjects });
  };

  // -------------------------------------------------------------
  // HOLDING GROUP FORM HANDLERS
  // -------------------------------------------------------------
  const openAddHolding = () => {
    const nextOrder = data.holding.length + 1;
    setHoldingModal({
      isOpen: true,
      isNew: true,
      data: {
        id: `hold-${Date.now()}`,
        company_name: '',
        description: '',
        website_url: '',
        logo_url: '',
        icon_name: 'building-2',
        sort_order: nextOrder,
      },
      errors: {},
    });
  };

  const openEditHolding = (item: HoldingItem) => {
    setHoldingModal({
      isOpen: true,
      isNew: false,
      data: { ...item },
      errors: {},
    });
  };

  const handleSaveHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const hold = holdingModal.data;

    if (!hold.company_name?.trim()) {
      errors.company_name = 'Company or holding name is required.';
    }

    if (!hold.description?.trim()) {
      errors.description = 'Short description is required.';
    }

    if (hold.website_url && !isValidHttpsUrl(hold.website_url)) {
      errors.website_url = 'Website must be a valid https link (e.g. https://example.com).';
    }

    if (Object.keys(errors).length > 0) {
      setHoldingModal((prev) => ({ ...prev, errors }));
      return;
    }

    const completeRecord: HoldingItem = {
      id: hold.id || `hold-${Date.now()}`,
      company_name: hold.company_name!.trim(),
      description: hold.description!.trim(),
      website_url: hold.website_url?.trim() || undefined,
      logo_url: hold.logo_url?.trim() || undefined,
      icon_name: hold.icon_name || 'building-2',
      sort_order: hold.sort_order ?? data.holding.length + 1,
    };

    await saveRecord('holding', completeRecord);
    notify(`Saved holding entry "${completeRecord.company_name}"!`, 'success');
    setHoldingModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSaveParentHoldingBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parentHoldingForm.url && !isValidHttpsUrl(parentHoldingForm.url)) {
      notify('Parent holding group URL must start with https://', 'error');
      return;
    }

    setSavingParentHolding(true);
    await updateSettings({
      holdingGroupName: parentHoldingForm.name.trim(),
      holdingGroupUrl: parentHoldingForm.url.trim(),
      holdingGroupLogo: parentHoldingForm.logo.trim(),
      holdingGroupDescription: parentHoldingForm.description.trim(),
    });
    setSavingParentHolding(false);
    notify('Parent Holding Banner configuration updated and live!', 'success');
  };

  // -------------------------------------------------------------
  // LEADERSHIP FORM HANDLERS
  // -------------------------------------------------------------
  const openAddLeader = () => {
    const nextOrder = data.leadership.length + 1;
    setLeaderModal({
      isOpen: true,
      isNew: true,
      data: {
        id: `lead-${Date.now()}`,
        name: '',
        role: '',
        bio: '',
        full_profile: '',
        slug: '',
        avatar_url: '',
        social_links: {
          linkedin: '',
          twitter: '',
        },
        sort_order: nextOrder,
      },
      errors: {},
    });
  };

  const openEditLeader = (item: LeaderItem) => {
    setLeaderModal({
      isOpen: true,
      isNew: false,
      data: {
        ...item,
        slug: item.slug || slugify(item.name),
        social_links: {
          linkedin: item.social_links?.linkedin || '',
          twitter: item.social_links?.twitter || '',
        },
      },
      errors: {},
    });
  };

  const handleSaveLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const lead = leaderModal.data;

    if (!lead.name?.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!lead.role?.trim()) {
      errors.role = 'Role / title is required.';
    }

    if (!lead.bio?.trim()) {
      errors.bio = 'Brief bio is required.';
    } else if (lead.bio.length > 300) {
      errors.bio = `Brief bio exceeds 300 characters (currently ${lead.bio.length}).`;
    }

    const linkedin = lead.social_links?.linkedin?.trim();
    if (linkedin && !isValidHttpsUrl(linkedin)) {
      errors.linkedin = 'LinkedIn URL must start with https://';
    }

    const twitter = lead.social_links?.twitter?.trim();
    if (twitter && !isValidHttpsUrl(twitter)) {
      errors.twitter = 'X/Twitter URL must start with https://';
    }

    if (Object.keys(errors).length > 0) {
      setLeaderModal((prev) => ({ ...prev, errors }));
      return;
    }

    const finalSlug = slugify(lead.slug?.trim() || lead.name || `leader-${Date.now()}`);

    const completeRecord: LeaderItem = {
      id: lead.id || `lead-${Date.now()}`,
      name: lead.name!.trim(),
      role: lead.role!.trim(),
      bio: lead.bio!.trim(),
      full_profile: lead.full_profile?.trim() || lead.bio!.trim(),
      slug: finalSlug,
      avatar_url: lead.avatar_url?.trim() || undefined,
      social_links: {
        linkedin: linkedin || undefined,
        twitter: twitter || undefined,
      },
      sort_order: lead.sort_order ?? data.leadership.length + 1,
    };

    await saveRecord('leadership', completeRecord);
    notify(`Saved leadership profile for "${completeRecord.name}"! Page is live at /leadership/${completeRecord.slug}`, 'success');
    setLeaderModal((prev) => ({ ...prev, isOpen: false }));
    const updatedLeaders = data.leadership.some((l) => l.id === completeRecord.id)
      ? data.leadership.map((l) => (l.id === completeRecord.id ? completeRecord : l))
      : [...data.leadership, completeRecord];
    syncSitemapToFile({ ...data, leadership: updatedLeaders });
  };

  // Sorted collections
  const sortedProjects = [...data.projects].sort((a, b) => a.sort_order - b.sort_order);
  const sortedHolding = [...data.holding].sort((a, b) => a.sort_order - b.sort_order);
  const sortedLeadership = [...data.leadership].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="links-manager-wrap p-6 max-w-6xl mx-auto">
      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        currentUrl={currentMediaUrl}
        title={
          mediaPickerTarget === 'project_cover'
            ? 'Select Project Cover Image'
            : mediaPickerTarget === 'holding_logo'
            ? 'Select Holding Group Logo'
            : mediaPickerTarget === 'leader_avatar'
            ? 'Select Leader Profile Photo'
            : 'Select Parent Holding Group Logo'
        }
      />

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-neutral-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 m-0">Confirm Delete</h3>
            </div>
            <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
              Are you sure you want to delete{' '}
              <strong className="text-neutral-900">"{itemToDelete.title}"</strong>?
              This will immediately remove the entry and its links from the live site.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="links-manager-header mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-neutral-900 text-white">
                Live Links &amp; Profiles
              </span>
              <span className="text-xs text-neutral-400">· /admin/links</span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 m-0">
              Projects, Holding Group &amp; Leadership Manager
            </h1>
            <p className="text-xs text-neutral-500 m-0 mt-1">
              Manage live external links, cover assets, briefs, holding affiliations, and profile pages.
              All updates sync to the live website instantly without a redeploy.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'projects' && (
              <button
                type="button"
                onClick={openAddProject}
                className="admin-btn admin-btn-solid flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
              >
                <Plus size={16} /> Add Project
              </button>
            )}
            {activeTab === 'holding' && (
              <button
                type="button"
                onClick={openAddHolding}
                className="admin-btn admin-btn-solid flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
              >
                <Plus size={16} /> Add Holding Company
              </button>
            )}
            {activeTab === 'leadership' && (
              <button
                type="button"
                onClick={openAddLeader}
                className="admin-btn admin-btn-solid flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
              >
                <Plus size={16} /> Add Leadership Profile
              </button>
            )}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-neutral-200 mt-6 gap-2">
          <button
            type="button"
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'projects'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
            onClick={() => setActiveTab('projects')}
          >
            <Briefcase size={16} />
            <span>Projects &amp; Work</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
              {sortedProjects.length}
            </span>
          </button>

          <button
            type="button"
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'holding'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
            onClick={() => setActiveTab('holding')}
          >
            <Building2 size={16} />
            <span>Holding Group</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
              {sortedHolding.length}
            </span>
          </button>

          <button
            type="button"
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'leadership'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
            onClick={() => setActiveTab('leadership')}
          >
            <Users size={16} />
            <span>Leadership Profiles</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
              {sortedLeadership.length}
            </span>
          </button>

          <button
            type="button"
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'sitemap'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
            onClick={() => setActiveTab('sitemap')}
          >
            <Compass size={16} />
            <span>Google SEO &amp; Sitemap</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
              {9 + sortedProjects.filter((p) => p.published !== false).length + sortedLeadership.length} URLs
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PROJECTS */}
      {/* ========================================================= */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 flex items-center justify-between">
            <div className="text-xs text-neutral-600">
              Showing <strong>{sortedProjects.length}</strong> projects (
              {sortedProjects.filter((p) => p.published !== false).length} published on live site).
              Use arrow buttons to adjust display order.
            </div>
            <a
              href="/projects"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1"
            >
              View live projects page <ExternalLink size={12} />
            </a>
          </div>

          <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-sm">
            {sortedProjects.map((proj, idx) => {
              const coverImg = proj.image_url || proj.hero_image_url;
              const isPublished = proj.published !== false;

              return (
                <div
                  key={proj.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50/70 transition-colors"
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Order Controls */}
                    <div className="flex flex-col gap-1 shrink-0 pt-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveUp('projects', idx)}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 disabled:opacity-20"
                        title="Move Up"
                        aria-label={`Move ${proj.title} up`}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sortedProjects.length - 1}
                        onClick={() => handleMoveDown('projects', idx, sortedProjects.length)}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 disabled:opacity-20"
                        title="Move Down"
                        aria-label={`Move ${proj.title} down`}
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Cover Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {coverImg ? (
                        <img
                          src={coverImg}
                          alt={proj.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <ImageIcon size={20} className="text-neutral-400" />
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                          {proj.category_tag}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-neutral-900 m-0 mb-1">{proj.title}</h3>
                      <p className="text-xs text-neutral-600 line-clamp-1 m-0 mb-2">
                        {proj.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs">
                        {proj.live_url ? (
                          <a
                            href={proj.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-neutral-800 hover:underline flex items-center gap-1"
                          >
                            <Globe size={12} className="text-neutral-400" />
                            <span className="font-mono text-[11px] truncate max-w-[200px]">
                              {proj.live_url}
                            </span>
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="text-neutral-400 flex items-center gap-1">
                            <AlertTriangle size={12} /> No live link set
                          </span>
                        )}
                        <span className="text-neutral-300">·</span>
                        <span className="text-neutral-500 font-mono text-[11px]">
                          /projects/{proj.slug}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => openEditProject(proj)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setItemToDelete({
                          table: 'projects',
                          id: proj.id,
                          title: proj.title,
                        })
                      }
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: HOLDING GROUP */}
      {/* ========================================================= */}
      {activeTab === 'holding' && (
        <div className="space-y-8">
          {/* Section 2.1: Parent Holding Group Global Banner Configuration */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-white">
                Global Banner
              </span>
              <h2 className="text-base font-bold text-neutral-900 m-0">
                Holding Group Affiliation Banner
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mb-6">
              Controls the official "GhreatnessLabs is part of [Holding Group Name]" card shown in the About section and near the footer.
            </p>

            <form onSubmit={handleSaveParentHoldingBanner} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Holding Group Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={parentHoldingForm.name}
                    onChange={(e) =>
                      setParentHoldingForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Ghreatness Group"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Holding Group Official Website URL (https://) *
                  </label>
                  <input
                    type="url"
                    required
                    value={parentHoldingForm.url}
                    onChange={(e) =>
                      setParentHoldingForm((prev) => ({ ...prev, url: e.target.value }))
                    }
                    placeholder="https://group.ghreatnesslab.com.ng"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Holding Group Logo Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={parentHoldingForm.logo}
                    onChange={(e) =>
                      setParentHoldingForm((prev) => ({ ...prev, logo: e.target.value }))
                    }
                    placeholder="/logo-mark.svg or image URL"
                    className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() => openMediaPicker('parent_holding_logo', parentHoldingForm.logo)}
                    className="px-4 py-2 text-xs font-semibold border border-neutral-300 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors shrink-0"
                  >
                    Browse Media
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Brief Holding Collective Description
                </label>
                <textarea
                  rows={2}
                  value={parentHoldingForm.description}
                  onChange={(e) =>
                    setParentHoldingForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              {/* Live Preview Box */}
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                  Live Banner Preview (as rendered on About &amp; Footer)
                </span>
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={parentHoldingForm.logo || '/logo-mark.svg'}
                      alt="Logo preview"
                      className="w-9 h-9 object-contain rounded bg-white p-1 border border-neutral-200"
                    />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 m-0">
                        GhreatnessLabs is part of <strong>{parentHoldingForm.name}</strong>
                      </p>
                      <p className="text-xs text-neutral-500 m-0 mt-0.5 line-clamp-1">
                        {parentHoldingForm.description}
                      </p>
                    </div>
                  </div>
                  <a
                    href={parentHoldingForm.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold shrink-0 hover:bg-neutral-800 flex items-center gap-1.5"
                  >
                    <span>Visit {parentHoldingForm.name}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingParentHolding}
                  className="admin-btn admin-btn-solid text-xs font-semibold px-5 py-2.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  {savingParentHolding ? 'Saving...' : 'Save Parent Holding Settings'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2.2: Holding Group Companies List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-neutral-900 m-0">
                Holding Group Ecosystem Entities ({sortedHolding.length})
              </h3>
              <a
                href="/holding-group"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1"
              >
                View holding group page <ExternalLink size={12} />
              </a>
            </div>

            <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-sm">
              {sortedHolding.map((company, idx) => (
                <div
                  key={company.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50/70 transition-colors"
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Reorder */}
                    <div className="flex flex-col gap-1 shrink-0 pt-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveUp('holding', idx)}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 disabled:opacity-20"
                        title="Move Up"
                        aria-label={`Move ${company.company_name} up`}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sortedHolding.length - 1}
                        onClick={() => handleMoveDown('holding', idx, sortedHolding.length)}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 disabled:opacity-20"
                        title="Move Down"
                        aria-label={`Move ${company.company_name} down`}
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Logo */}
                    <div className="w-14 h-14 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center p-2">
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt={company.company_name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <Building2 size={20} className="text-neutral-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-neutral-900 m-0 mb-1">
                        {company.company_name}
                      </h4>
                      <p className="text-xs text-neutral-600 line-clamp-1 m-0 mb-2">
                        {company.description}
                      </p>
                      {company.website_url ? (
                        <a
                          href={company.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-neutral-800 hover:underline inline-flex items-center gap-1 text-xs"
                        >
                          <Globe size={12} className="text-neutral-400" />
                          <span className="font-mono text-[11px]">{company.website_url}</span>
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-neutral-400 text-xs">No website URL set</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => openEditHolding(company)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setItemToDelete({
                          table: 'holding',
                          id: company.id,
                          title: company.company_name,
                        })
                      }
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: LEADERSHIP PROFILES */}
      {/* ========================================================= */}
      {activeTab === 'leadership' && (
        <div className="space-y-4">
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 flex items-center justify-between">
            <div className="text-xs text-neutral-600">
              Showing <strong>{sortedLeadership.length}</strong> studio principals and leads.
              Each member has an auto-moving slideshow card and full profile page at{' '}
              <code className="text-neutral-800 font-mono">/leadership/[slug]</code>.
            </div>
            <a
              href="/leadership"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1"
            >
              View live leadership page <ExternalLink size={12} />
            </a>
          </div>

          <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-sm">
            {sortedLeadership.map((leader, idx) => {
              const slug = leader.slug || slugify(leader.name);
              return (
                <div
                  key={leader.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50/70 transition-colors"
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Reorder */}
                    <div className="flex flex-col gap-1 shrink-0 pt-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveUp('leadership', idx)}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 disabled:opacity-20"
                        title="Move Up"
                        aria-label={`Move ${leader.name} up`}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sortedLeadership.length - 1}
                        onClick={() =>
                          handleMoveDown('leadership', idx, sortedLeadership.length)
                        }
                        className="p-1 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 disabled:opacity-20"
                        title="Move Down"
                        aria-label={`Move ${leader.name} down`}
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Photo / Avatar */}
                    <div className="w-16 h-16 rounded-full bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {leader.avatar_url ? (
                        <img
                          src={leader.avatar_url}
                          alt={leader.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Users size={22} className="text-neutral-400" />
                      )}
                    </div>

                    {/* Leader Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-bold text-neutral-900 m-0">{leader.name}</h4>
                        <span className="text-xs text-neutral-400">·</span>
                        <span className="text-xs font-semibold text-neutral-600">{leader.role}</span>
                      </div>
                      <p className="text-xs text-neutral-600 line-clamp-1 m-0 mb-2">
                        {leader.bio}
                      </p>

                      <div className="flex items-center gap-3 text-xs flex-wrap">
                        <a
                          href={`/leadership/${slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neutral-900 font-mono text-[11px] hover:underline flex items-center gap-1"
                        >
                          <span>/leadership/{slug}</span>
                          <ExternalLink size={10} />
                        </a>

                        {leader.social_links?.linkedin && (
                          <a
                            href={leader.social_links.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
                          >
                            <Linkedin size={11} /> LinkedIn
                          </a>
                        )}

                        {leader.social_links?.twitter && (
                          <a
                            href={leader.social_links.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-800 hover:underline flex items-center gap-1 font-mono text-[11px]"
                          >
                            <Twitter size={11} /> X
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => openEditLeader(leader)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
                    >
                      <Edit2 size={13} /> Edit Profile
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setItemToDelete({
                          table: 'leadership',
                          id: leader.id,
                          title: leader.name,
                        })
                      }
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: GOOGLE SEO & SITEMAP */}
      {/* ========================================================= */}
      {activeTab === 'sitemap' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-neutral-900 text-white rounded-2xl p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block mb-2">
                  SEO &amp; Google Discoverability Engine
                </span>
                <h2 className="text-xl font-bold text-white m-0">
                  XML Sitemap &amp; Structured Data Governance
                </h2>
                <p className="text-xs text-neutral-300 m-0 mt-1 max-w-2xl leading-relaxed">
                  Every published project page and leadership profile route is automatically included in <code className="text-emerald-400">/sitemap.xml</code> with ISO lastmod timestamps, canonical tags, Person JSON-LD, and Organization schema.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSyncSitemap}
                  disabled={isSyncingSitemap}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles size={14} />
                  <span>{isSyncingSitemap ? 'Syncing...' : 'Sync to /sitemap.xml'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSitemap}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Download .xml</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySitemap}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5"
                >
                  {copiedSitemap ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedSitemap ? 'Copied!' : 'Copy XML'}</span>
                </button>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Open Live Sitemap</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-neutral-800 text-xs">
              <div>
                <span className="text-neutral-400 block text-[11px]">Total Indexable URLs</span>
                <strong className="text-lg font-mono text-white">
                  {9 + sortedProjects.filter((p) => p.published !== false).length + sortedLeadership.length}
                </strong>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px]">Published Projects</span>
                <strong className="text-lg font-mono text-emerald-400">
                  {sortedProjects.filter((p) => p.published !== false).length}
                </strong>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px]">Leadership Profiles</span>
                <strong className="text-lg font-mono text-emerald-400">
                  {sortedLeadership.length}
                </strong>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px]">Indexing Directives</span>
                <strong className="text-lg font-mono text-white">All Indexable</strong>
              </div>
            </div>
          </div>

          {/* CRITICAL NOTICE: MANUAL EXTERNAL LINKING INSTRUCTION */}
          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-200/70 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={18} />
              </div>
              <div className="text-xs text-amber-950 space-y-1.5">
                <h3 className="text-sm font-bold text-amber-950 m-0">
                  Manual Step Required: Add Short Links on Holding Group &amp; Project Sites
                </h3>
                <p className="leading-relaxed">
                  GhreatnessLabs internally links all projects, holding affiliations, and leadership pages. To complete Google discoverability and build strong domain signals, you must <strong>manually add a short reciprocal link to GhreatnessLabs</strong> on the external sites:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-amber-900 font-medium">
                  <li>
                    <strong>Holding Group Site ({data.settings.holdingGroupUrl || 'https://group.ghreatnesslab.com.ng'}):</strong> Add a link or badge pointing to <code>https://www.ghreatnesslab.com.ng</code>.
                  </li>
                  <li>
                    <strong>Live Project Sites:</strong> Add a footer credit (e.g. <em>"Engineered by GhreatnessLabs"</em> linking to <code>https://www.ghreatnesslab.com.ng</code>).
                  </li>
                </ul>
                <p className="text-[11px] text-amber-800 italic">
                  Note: This is a manual action for your webmaster because AI Studio build agents do not have administrative access to external third-party servers or domain registrars.
                </p>
              </div>
            </div>
          </div>

          {/* Generated Sitemap XML Preview */}
          <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 m-0">Live Sitemap.xml Preview</h3>
                <p className="text-xs text-neutral-500 m-0 mt-0.5">
                  Generated dynamically from active database state with current date timestamps.
                </p>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                https://www.ghreatnesslab.com.ng/sitemap.xml
              </span>
            </div>

            <div className="p-4 bg-neutral-950 text-neutral-200 rounded-xl font-mono text-xs overflow-x-auto max-h-80 leading-relaxed border border-neutral-800">
              <pre>
                <code>{generateSitemapXml(data)}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT PROJECT */}
      {/* ========================================================= */}
      {projectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 className="text-base font-bold text-neutral-900 m-0">
                {projectModal.isNew ? 'Create New Project' : 'Edit Project Entry'}
              </h2>
              <button
                type="button"
                onClick={() => setProjectModal((p) => ({ ...p, isOpen: false }))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProject} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={projectModal.data.title || ''}
                  onChange={(e) =>
                    setProjectModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, title: e.target.value },
                      errors: { ...prev.errors, title: '' },
                    }))
                  }
                  placeholder="e.g. FragNaija Platform"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                {projectModal.errors.title && (
                  <p className="text-xs text-red-600 mt-1">{projectModal.errors.title}</p>
                )}
              </div>

              {/* Short Description with 160-char counter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-700">
                    Short Description (max 160 chars) *
                  </label>
                  <span
                    className={`text-xs font-mono ${
                      (projectModal.data.description?.length || 0) > 160
                        ? 'text-red-600 font-bold'
                        : 'text-neutral-400'
                    }`}
                  >
                    {projectModal.data.description?.length || 0}/160
                  </span>
                </div>
                <textarea
                  rows={2}
                  required
                  maxLength={160}
                  value={projectModal.data.description || ''}
                  onChange={(e) =>
                    setProjectModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, description: e.target.value },
                      errors: { ...prev.errors, description: '' },
                    }))
                  }
                  placeholder="One-line summary of the system and outcomes achieved..."
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                {projectModal.errors.description && (
                  <p className="text-xs text-red-600 mt-1">{projectModal.errors.description}</p>
                )}
              </div>

              {/* Live Website URL with https validation */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Live Website URL (must start with https://) *
                </label>
                <input
                  type="url"
                  required
                  value={projectModal.data.live_url || ''}
                  onChange={(e) =>
                    setProjectModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, live_url: e.target.value },
                      errors: { ...prev.errors, live_url: '' },
                    }))
                  }
                  placeholder="https://fragnaija.com"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                {projectModal.errors.live_url && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle size={13} /> {projectModal.errors.live_url}
                  </p>
                )}
              </div>

              {/* Cover Image Picker */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Cover Image (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={projectModal.data.image_url || ''}
                    onChange={(e) =>
                      setProjectModal((prev) => ({
                        ...prev,
                        data: {
                          ...prev.data,
                          image_url: e.target.value,
                          hero_image_url: e.target.value,
                        },
                      }))
                    }
                    placeholder="Image URL or pick from media manager"
                    className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      openMediaPicker('project_cover', projectModal.data.image_url || '')
                    }
                    className="px-4 py-2 text-xs font-semibold border border-neutral-300 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <ImageIcon size={14} /> Browse Media
                  </button>
                </div>
              </div>

              {/* Category Tag & Published Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={projectModal.data.category_tag || ''}
                    onChange={(e) =>
                      setProjectModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, category_tag: e.target.value },
                      }))
                    }
                    placeholder="e.g. Esports platform"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Publishing Status
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setProjectModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, published: prev.data.published === false },
                      }))
                    }
                    className={`w-full px-4 py-2 text-xs font-semibold rounded-lg border flex items-center justify-between transition-colors ${
                      projectModal.data.published !== false
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-neutral-300 bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    <span>
                      {projectModal.data.published !== false ? 'Published (Visible)' : 'Draft (Hidden)'}
                    </span>
                    {projectModal.data.published !== false ? (
                      <ToggleRight size={20} className="text-emerald-600" />
                    ) : (
                      <ToggleLeft size={20} className="text-neutral-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* LIVE CARD PREVIEW BEFORE SAVING */}
              <div className="pt-4 border-t border-neutral-200">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                  Live Card Preview (as rendered on live site)
                </span>
                <div className="max-w-sm mx-auto bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                  <div className="h-44 bg-neutral-900 relative flex items-center justify-center">
                    {projectModal.data.image_url ? (
                      <img
                        src={projectModal.data.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-neutral-500 text-xs">No cover image</div>
                    )}
                    <span className="absolute top-3 left-3 bg-white text-neutral-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                      {projectModal.data.category_tag || 'PROJECT'}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-neutral-900 m-0 mb-1">
                      {projectModal.data.title || 'Untitled Project'}
                    </h3>
                    <p className="text-xs text-neutral-600 m-0 mb-4 line-clamp-2 leading-relaxed">
                      {projectModal.data.description || 'Short project description will appear here.'}
                    </p>
                    <a
                      href={projectModal.data.live_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-neutral-800 transition-colors"
                      onClick={(e) => {
                        if (!projectModal.data.live_url) e.preventDefault();
                      }}
                    >
                      <span>Visit site</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setProjectModal((p) => ({ ...p, isOpen: false }))}
                  className="px-4 py-2 text-xs font-semibold text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Save Project &amp; Apply to Live Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ADD / EDIT HOLDING ITEM */}
      {/* ========================================================= */}
      {holdingModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 className="text-base font-bold text-neutral-900 m-0">
                {holdingModal.isNew ? 'Add Holding Group Company' : 'Edit Holding Company'}
              </h2>
              <button
                type="button"
                onClick={() => setHoldingModal((h) => ({ ...h, isOpen: false }))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveHolding} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Company / Venture Name *
                </label>
                <input
                  type="text"
                  required
                  value={holdingModal.data.company_name || ''}
                  onChange={(e) =>
                    setHoldingModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, company_name: e.target.value },
                      errors: { ...prev.errors, company_name: '' },
                    }))
                  }
                  placeholder="e.g. FragNaija"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                {holdingModal.errors.company_name && (
                  <p className="text-xs text-red-600 mt-1">{holdingModal.errors.company_name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Short Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={holdingModal.data.description || ''}
                  onChange={(e) =>
                    setHoldingModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, description: e.target.value },
                      errors: { ...prev.errors, description: '' },
                    }))
                  }
                  placeholder="What this holding company or ecosystem venture does..."
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                {holdingModal.errors.description && (
                  <p className="text-xs text-red-600 mt-1">{holdingModal.errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Website URL (https://)
                </label>
                <input
                  type="url"
                  value={holdingModal.data.website_url || ''}
                  onChange={(e) =>
                    setHoldingModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, website_url: e.target.value },
                      errors: { ...prev.errors, website_url: '' },
                    }))
                  }
                  placeholder="https://fragnaija.com"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                {holdingModal.errors.website_url && (
                  <p className="text-xs text-red-600 mt-1">{holdingModal.errors.website_url}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Company Logo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={holdingModal.data.logo_url || ''}
                    onChange={(e) =>
                      setHoldingModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, logo_url: e.target.value },
                      }))
                    }
                    placeholder="Logo URL or pick from media manager"
                    className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      openMediaPicker('holding_logo', holdingModal.data.logo_url || '')
                    }
                    className="px-4 py-2 text-xs font-semibold border border-neutral-300 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <ImageIcon size={14} /> Browse Media
                  </button>
                </div>
              </div>

              {/* LIVE CARD PREVIEW */}
              <div className="pt-4 border-t border-neutral-200">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                  Live Card Preview
                </span>
                <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    {holdingModal.data.logo_url ? (
                      <img
                        src={holdingModal.data.logo_url}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 size={20} className="text-neutral-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-neutral-900 m-0">
                      {holdingModal.data.company_name || 'Company Name'}
                    </h4>
                    <p className="text-xs text-neutral-500 m-0 line-clamp-1">
                      {holdingModal.data.description || 'Description will appear here'}
                    </p>
                  </div>
                  {holdingModal.data.website_url && (
                    <a
                      href={holdingModal.data.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-neutral-900 text-white rounded text-xs font-semibold shrink-0 flex items-center gap-1"
                    >
                      <span>Visit</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setHoldingModal((h) => ({ ...h, isOpen: false }))}
                  className="px-4 py-2 text-xs font-semibold text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ADD / EDIT LEADERSHIP PROFILE */}
      {/* ========================================================= */}
      {leaderModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 className="text-base font-bold text-neutral-900 m-0">
                {leaderModal.isNew ? 'Create Leadership Profile' : 'Edit Leadership Profile'}
              </h2>
              <button
                type="button"
                onClick={() => setLeaderModal((l) => ({ ...l, isOpen: false }))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLeader} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={leaderModal.data.name || ''}
                    onChange={(e) =>
                      setLeaderModal((prev) => ({
                        ...prev,
                        data: {
                          ...prev.data,
                          name: e.target.value,
                          slug: prev.data.slug || slugify(e.target.value),
                        },
                        errors: { ...prev.errors, name: '' },
                      }))
                    }
                    placeholder="e.g. Gideon Greatness"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  {leaderModal.errors.name && (
                    <p className="text-xs text-red-600 mt-1">{leaderModal.errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Role / Position *
                  </label>
                  <input
                    type="text"
                    required
                    value={leaderModal.data.role || ''}
                    onChange={(e) =>
                      setLeaderModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, role: e.target.value },
                        errors: { ...prev.errors, role: '' },
                      }))
                    }
                    placeholder="e.g. Founder & Creative Director"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  {leaderModal.errors.role && (
                    <p className="text-xs text-red-600 mt-1">{leaderModal.errors.role}</p>
                  )}
                </div>
              </div>

              {/* URL Slug */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  URL Slug (path will be: /leadership/[slug]) *
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-neutral-100 border border-r-0 border-neutral-300 text-xs text-neutral-500 rounded-l-lg font-mono">
                    /leadership/
                  </span>
                  <input
                    type="text"
                    required
                    value={leaderModal.data.slug || ''}
                    onChange={(e) =>
                      setLeaderModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, slug: slugify(e.target.value) },
                      }))
                    }
                    placeholder="gideon-greatness"
                    className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-r-lg font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              {/* Photo */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Profile Photo (Photo from Media Manager, Upload or URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={leaderModal.data.avatar_url || ''}
                    onChange={(e) =>
                      setLeaderModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, avatar_url: e.target.value },
                      }))
                    }
                    placeholder="Image URL or pick from media manager"
                    className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      openMediaPicker('leader_avatar', leaderModal.data.avatar_url || '')
                    }
                    className="px-4 py-2 text-xs font-semibold border border-neutral-300 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <ImageIcon size={14} /> Browse Media
                  </button>
                </div>
              </div>

              {/* Brief Bio (max 300 chars) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-700">
                    Brief Bio (max 300 chars, used on cards &amp; meta description) *
                  </label>
                  <span
                    className={`text-xs font-mono ${
                      (leaderModal.data.bio?.length || 0) > 300
                        ? 'text-red-600 font-bold'
                        : 'text-neutral-400'
                    }`}
                  >
                    {leaderModal.data.bio?.length || 0}/300
                  </span>
                </div>
                <textarea
                  rows={2}
                  required
                  maxLength={300}
                  value={leaderModal.data.bio || ''}
                  onChange={(e) =>
                    setLeaderModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, bio: e.target.value },
                      errors: { ...prev.errors, bio: '' },
                    }))
                  }
                  placeholder="One-line summary of leadership focus and expertise..."
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                {leaderModal.errors.bio && (
                  <p className="text-xs text-red-600 mt-1">{leaderModal.errors.bio}</p>
                )}
              </div>

              {/* Full Profile Text */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Profile Biography (Detailed background for profile page)
                </label>
                <textarea
                  rows={4}
                  value={leaderModal.data.full_profile || ''}
                  onChange={(e) =>
                    setLeaderModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, full_profile: e.target.value },
                    }))
                  }
                  placeholder="Full career history, architectural focus, background, and governance role at GhreatnessLabs..."
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    LinkedIn URL (Optional, https://)
                  </label>
                  <input
                    type="url"
                    value={leaderModal.data.social_links?.linkedin || ''}
                    onChange={(e) =>
                      setLeaderModal((prev) => ({
                        ...prev,
                        data: {
                          ...prev.data,
                          social_links: {
                            ...prev.data.social_links,
                            linkedin: e.target.value,
                          },
                        },
                        errors: { ...prev.errors, linkedin: '' },
                      }))
                    }
                    placeholder="https://www.linkedin.com/in/username"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  {leaderModal.errors.linkedin && (
                    <p className="text-xs text-red-600 mt-1">{leaderModal.errors.linkedin}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    X / Twitter URL (Optional, https://)
                  </label>
                  <input
                    type="url"
                    value={leaderModal.data.social_links?.twitter || ''}
                    onChange={(e) =>
                      setLeaderModal((prev) => ({
                        ...prev,
                        data: {
                          ...prev.data,
                          social_links: {
                            ...prev.data.social_links,
                            twitter: e.target.value,
                          },
                        },
                        errors: { ...prev.errors, twitter: '' },
                      }))
                    }
                    placeholder="https://x.com/username"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  {leaderModal.errors.twitter && (
                    <p className="text-xs text-red-600 mt-1">{leaderModal.errors.twitter}</p>
                  )}
                </div>
              </div>

              {/* LIVE PREVIEW OF CARD & SLIDESHOW */}
              <div className="pt-4 border-t border-neutral-200">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                  Live Slideshow &amp; Profile Card Preview
                </span>
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-200 shrink-0 border border-neutral-300">
                    {leaderModal.data.avatar_url ? (
                      <img
                        src={leaderModal.data.avatar_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-neutral-600">
                        {(leaderModal.data.name || 'G')[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-neutral-900 m-0">
                      {leaderModal.data.name || 'Leader Name'}
                    </h4>
                    <small className="text-xs text-neutral-500 block mb-1">
                      {leaderModal.data.role || 'Role'}
                    </small>
                    <p className="text-xs text-neutral-600 m-0 line-clamp-2">
                      {leaderModal.data.bio || 'Brief bio text preview...'}
                    </p>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono shrink-0">
                    /leadership/{slugify(leaderModal.data.slug || leaderModal.data.name || 'slug')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setLeaderModal((l) => ({ ...l, isOpen: false }))}
                  className="px-4 py-2 text-xs font-semibold text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Save Profile &amp; Generate URL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
