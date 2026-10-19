import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Key,
  Layers,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Server,
  Settings,
  Shield,
  Trash2,
  Users,
  Briefcase,
  Building,
  Quote,
  FileText,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { GhreatnessLogo, GhreatnessMark } from '../components/GhreatnessLogo';
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
} from '../types/cms';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  getSupabaseClient,
  getStoredPasscode,
} from '../lib/supabase';
import { generateSupabaseSql } from '../lib/sqlGenerator';
import { icons } from '../components/SharedSections';
import { IconPickerModal } from '../components/admin/IconPickerModal';
import { TagManager } from '../components/admin/TagManager';
import { ToastContainer } from '../components/admin/ToastContainer';
import { MediaManager } from '../components/admin/MediaManager';

type TabKey =
  | 'settings'
  | 'media'
  | 'stats'
  | 'about'
  | 'capabilities'
  | 'services'
  | 'holding'
  | 'projects'
  | 'leadership'
  | 'clients'
  | 'testimonials'
  | 'faqs'
  | 'pages'
  | 'supabase';

export default function Admin() {
  const {
    data,
    isSupabaseConnected,
    isUsingFallback,
    updateSettings,
    saveRecord,
    deleteRecord,
    reorderRecords,
    resetToDefaults,
    refreshData,
    notify,
  } = useCms();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ghreatness_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState<'passcode' | 'supabase'>('passcode');
  const [supaEmail, setSupaEmail] = useState('');
  const [supaPassword, setSupaPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin/media')) {
      return 'media';
    }
    return 'settings';
  });

  // Local editing copy for Site Settings (with dirty tracking)
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(data.settings);
  const [isSettingsDirty, setIsSettingsDirty] = useState(false);

  // Icon picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{
    currentIcon: string;
    onSelect: (iconName: string) => void;
  } | null>(null);

  // Modals for adding/editing items
  const [editingItem, setEditingItem] = useState<{
    table: string;
    item: Record<string, unknown>;
    isNew: boolean;
  } | null>(null);

  // Supabase Config form state
  const [supaUrl, setSupaUrl] = useState('');
  const [supaKey, setSupaKey] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    setSettingsForm(data.settings);
    setIsSettingsDirty(false);
  }, [data.settings]);

  useEffect(() => {
    const cfg = getSupabaseConfig();
    setSupaUrl(cfg.url);
    setSupaKey(cfg.anonKey);
  }, []);

  // Handle Passcode / Supabase Auth login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    if (authMode === 'passcode') {
      const validCode = getStoredPasscode();
      if (passcode.trim() === validCode || passcode.trim() === 'ghreatness2026') {
        localStorage.setItem('ghreatness_admin_auth', 'true');
        setIsAuthenticated(true);
        notify('Welcome to GhreatnessLabs CMS Studio', 'success');
      } else {
        setAuthError('Incorrect passcode. Use ghreatness2026 or check your stored passcode.');
      }
      setIsAuthenticating(false);
    } else {
      // Supabase Auth
      const client = getSupabaseClient();
      if (!client) {
        setAuthError('Supabase is not yet configured. Please use Passcode mode.');
        setIsAuthenticating(false);
        return;
      }

      try {
        const { error } = await client.auth.signInWithPassword({
          email: supaEmail,
          password: supaPassword,
        });

        if (error) {
          setAuthError(error.message);
        } else {
          localStorage.setItem('ghreatness_admin_auth', 'true');
          setIsAuthenticated(true);
          notify('Authenticated via Supabase Auth!', 'success');
        }
      } catch (err) {
        setAuthError(err instanceof Error ? err.message : 'Supabase auth failed.');
      } finally {
        setIsAuthenticating(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ghreatness_admin_auth');
    setIsAuthenticated(false);
    notify('Logged out of Admin Studio', 'info');
  };

  // Helper for opening Icon Picker
  const openIconPicker = (currentIcon: string, onSelect: (name: string) => void) => {
    setPickerTarget({ currentIcon, onSelect });
    setPickerOpen(true);
  };

  // Handle saving Site Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(settingsForm);
    setIsSettingsDirty(false);
  };

  // Handle testing & saving Supabase credentials
  const handleTestAndSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(supaUrl, supaKey);
    setTestResult(res);
    setIsTesting(false);

    if (res.success) {
      saveSupabaseConfig(supaUrl, supaKey);
      await refreshData();
      notify('Supabase credentials verified & saved!', 'success');
    } else {
      notify(`Connection test failed: ${res.message}`, 'error');
    }
  };

  const handleClearSupabase = () => {
    if (confirm('Disconnect Supabase credentials and use local live fallback?')) {
      saveSupabaseConfig('', '');
      setSupaUrl('');
      setSupaKey('');
      setTestResult(null);
      refreshData();
      notify('Disconnected from Supabase. Using local CMS fallback.', 'info');
    }
  };

  const handleCopySql = () => {
    const sql = generateSupabaseSql();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    notify('SQL schema copied to clipboard! Paste it into Supabase SQL Editor.', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleDownloadSql = () => {
    const sql = generateSupabaseSql();
    const blob = new Blob([sql], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ghreatnesslabs_supabase_schema.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Downloaded ghreatnesslabs_supabase_schema.sql', 'success');
  };

  // Render Login Screen if unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrap">
        <ToastContainer />
        <div className="admin-login-card">
          <div className="admin-login-head">
            <div className="flex justify-center mb-3">
              <GhreatnessLogo variant="full" height={44} />
            </div>
            <p>Studio content management & Supabase administration</p>
          </div>

          <div className="admin-auth-toggle">
            <button
              type="button"
              className={authMode === 'passcode' ? 'active' : ''}
              onClick={() => {
                setAuthMode('passcode');
                setAuthError('');
              }}
            >
              Studio Passcode
            </button>
            <button
              type="button"
              className={authMode === 'supabase' ? 'active' : ''}
              onClick={() => {
                setAuthMode('supabase');
                setAuthError('');
              }}
            >
              Supabase Auth
            </button>
          </div>

          {authError && (
            <div className="admin-auth-error">
              <AlertTriangle size={16} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            {authMode === 'passcode' ? (
              <div className="admin-field">
                <label>Admin Passcode</label>
                <div className="admin-input-group">
                  <Key size={16} />
                  <input
                    type="password"
                    required
                    autoFocus
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter passcode (default: ghreatness2026)"
                  />
                </div>
                <small className="admin-field-hint">
                  Default access: <code>ghreatness2026</code>
                </small>
              </div>
            ) : (
              <>
                <div className="admin-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={supaEmail}
                    onChange={(e) => setSupaEmail(e.target.value)}
                    placeholder="admin@ghreatness.io"
                  />
                </div>
                <div className="admin-field">
                  <label>Password</label>
                  <input
                    type="password"
                    required
                    value={supaPassword}
                    onChange={(e) => setSupaPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="button button-solid w-full mt-4 justify-center"
            >
              {isAuthenticating ? 'Authenticating...' : 'Sign In to Studio'}
            </button>
          </form>

          <div className="admin-login-footer">
            <a href="/" className="admin-back-link">
              <ArrowLeft size={14} /> Back to live site
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Render Full Admin Panel
  return (
    <div className="admin-layout">
      <ToastContainer />

      {/* Admin Top Navigation Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <a href="/" className="admin-brand flex items-center gap-2" title="Return to public site">
            <GhreatnessLogo variant="full" height={28} />
            <span className="admin-badge">CMS STUDIO</span>
          </a>

          <div className="admin-status-indicator">
            {isSupabaseConnected ? (
              <span className="admin-status-pill connected" title="Connected to remote Supabase project">
                <span className="pulse-dot green" /> Connected to Supabase
              </span>
            ) : (
              <span
                className="admin-status-pill fallback cursor-pointer"
                onClick={() => setActiveTab('supabase')}
                title="Using local reactive cache. Click to connect Supabase."
              >
                <span className="pulse-dot amber" /> Local Live Mode (Click to Connect)
              </span>
            )}
          </div>
        </div>

        <div className="admin-topbar-right">
          <button
            type="button"
            className="admin-btn admin-btn-sm"
            onClick={() => refreshData()}
            title="Sync latest data"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <a href="/" target="_blank" rel="noreferrer" className="admin-btn admin-btn-sm">
            <ExternalLink size={14} /> View Live Site
          </a>
          <button
            type="button"
            className="admin-btn admin-btn-sm admin-btn-danger"
            onClick={() => {
              if (confirm('Are you sure you want to reset all content back to initial factory defaults?')) {
                resetToDefaults();
              }
            }}
            title="Reset to factory defaults"
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-sm"
            onClick={handleLogout}
            title="Sign out of Admin Studio"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="admin-body">
        {/* Sidebar Tabs */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-section">
            <span className="admin-sidebar-heading">Content Areas</span>
            <nav className="admin-nav-list">
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('settings');
                  window.history.pushState({}, '', '/admin');
                }}
              >
                <Settings size={16} />
                <span>Site Settings</span>
                {isSettingsDirty && <span className="admin-dirty-badge" />}
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'media' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('media');
                  window.history.pushState({}, '', '/admin/media');
                }}
              >
                <ImageIcon size={16} />
                <span>Media Library</span>
                <span className="admin-count-badge">{(data.media || []).length}</span>
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                <Sliders size={16} />
                <span>Stats Cards</span>
                <span className="admin-count-badge">{data.stats.length}</span>
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                <Shield size={16} />
                <span>About & Core Values</span>
                <span className="admin-count-badge">{data.aboutCards.length}</span>
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'capabilities' ? 'active' : ''}`}
                onClick={() => setActiveTab('capabilities')}
              >
                <Briefcase size={16} />
                <span>Capabilities</span>
                <span className="admin-count-badge">{data.capabilities.length}</span>
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                <Layers size={16} />
                <span>Services (Digital & IT)</span>
                <span className="admin-count-badge">{data.services.length}</span>
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'holding' ? 'active' : ''}`}
                onClick={() => setActiveTab('holding')}
              >
                <Building size={16} />
                <span>Holding Group</span>
                <span className="admin-count-badge">{data.holding.length}</span>
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveTab('projects')}
              >
                <Eye size={16} />
                <span>Projects / Ventures</span>
                <span className="admin-count-badge">{data.projects.length}</span>
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'leadership' ? 'active' : ''}`}
                onClick={() => setActiveTab('leadership')}
              >
                <Users size={16} />
                <span>Leadership</span>
                <span className="admin-count-badge">{data.leadership.length}</span>
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'clients' ? 'active' : ''}`}
                onClick={() => setActiveTab('clients')}
              >
                <Building size={16} />
                <span>Clients & Partners</span>
                <span className="admin-count-badge">{data.clients.length}</span>
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'testimonials' ? 'active' : ''}`}
                onClick={() => setActiveTab('testimonials')}
              >
                <Quote size={16} />
                <span>Testimonials</span>
                <span className="admin-count-badge">{data.testimonials.length}</span>
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'faqs' ? 'active' : ''}`}
                onClick={() => setActiveTab('faqs')}
              >
                <HelpCircle size={16} />
                <span>FAQs Accordion</span>
                <span className="admin-count-badge">{(data.faqs || []).length}</span>
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'pages' ? 'active' : ''}`}
                onClick={() => setActiveTab('pages')}
              >
                <FileText size={16} />
                <span>Page Copy</span>
                <span className="admin-count-badge">{data.pages.length}</span>
              </button>
            </nav>
          </div>

          <div className="admin-sidebar-section mt-auto pt-4 border-t border-[#222]">
            <span className="admin-sidebar-heading">Database & Integration</span>
            <nav className="admin-nav-list">
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'supabase' ? 'active' : ''}`}
                onClick={() => setActiveTab('supabase')}
              >
                <Server size={16} />
                <span>Supabase & SQL</span>
                {isSupabaseConnected && <span className="admin-status-dot-mini green" />}
              </button>
            </nav>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="admin-content-pane">
          {/* TAB 1: SITE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h2>Site Settings</h2>
                  <p>Global branding, hero typography, announcement bar, contact channels, and footer copy.</p>
                </div>
                {isSettingsDirty && (
                  <span className="admin-dirty-pill">Unsaved Changes</span>
                )}
              </div>

              <form onSubmit={handleSaveSettings} className="admin-form-grid">
                <div className="admin-form-section">
                  <h3>Brand Identity & Hero</h3>
                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label>Studio Wordmark</label>
                      <input
                        type="text"
                        value={settingsForm.wordmark}
                        onChange={(e) => {
                          setSettingsForm({ ...settingsForm, wordmark: e.target.value });
                          setIsSettingsDirty(true);
                        }}
                      />
                    </div>
                    <div className="admin-field">
                      <label>Announcement Bar Text</label>
                      <input
                        type="text"
                        value={settingsForm.status}
                        onChange={(e) => {
                          setSettingsForm({ ...settingsForm, status: e.target.value });
                          setIsSettingsDirty(true);
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-field">
                    <label>Hero Eyebrow Label</label>
                    <input
                      type="text"
                      value={settingsForm.heroEyebrow}
                      onChange={(e) => {
                        setSettingsForm({ ...settingsForm, heroEyebrow: e.target.value });
                        setIsSettingsDirty(true);
                      }}
                    />
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label>Hero Title (Primary)</label>
                      <input
                        type="text"
                        value={settingsForm.heroTitlePrimary}
                        onChange={(e) => {
                          setSettingsForm({ ...settingsForm, heroTitlePrimary: e.target.value });
                          setIsSettingsDirty(true);
                        }}
                      />
                    </div>
                    <div className="admin-field">
                      <label>Hero Title Accent (Secondary)</label>
                      <input
                        type="text"
                        value={settingsForm.heroTitleSecondary}
                        onChange={(e) => {
                          setSettingsForm({ ...settingsForm, heroTitleSecondary: e.target.value });
                          setIsSettingsDirty(true);
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-field">
                    <label>Hero Intro Body Copy</label>
                    <textarea
                      rows={3}
                      value={settingsForm.heroBody}
                      onChange={(e) => {
                        setSettingsForm({ ...settingsForm, heroBody: e.target.value });
                        setIsSettingsDirty(true);
                      }}
                    />
                  </div>

                  <div className="admin-field">
                    <label>Current Studio Availability Text (Dispatch Panel)</label>
                    <input
                      type="text"
                      value={settingsForm.availabilityText}
                      onChange={(e) => {
                        setSettingsForm({ ...settingsForm, availabilityText: e.target.value });
                        setIsSettingsDirty(true);
                      }}
                    />
                  </div>
                </div>

                <div className="admin-form-section">
                  <h3>Contact & Channels</h3>
                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label>Studio Email</label>
                      <input
                        type="email"
                        value={settingsForm.contactEmail}
                        onChange={(e) => {
                          setSettingsForm({ ...settingsForm, contactEmail: e.target.value });
                          setIsSettingsDirty(true);
                        }}
                      />
                    </div>
                    <div className="admin-field">
                      <label>Studio Hotline</label>
                      <input
                        type="text"
                        value={settingsForm.hotline}
                        onChange={(e) => {
                          setSettingsForm({ ...settingsForm, hotline: e.target.value });
                          setIsSettingsDirty(true);
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label>WhatsApp Number (e.g. +2348000000000)</label>
                      <input
                        type="text"
                        value={settingsForm.whatsappNumber}
                        onChange={(e) => {
                          setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value });
                          setIsSettingsDirty(true);
                        }}
                      />
                    </div>
                    <div className="admin-field">
                      <label>Office Address Line</label>
                      <input
                        type="text"
                        value={settingsForm.officeAddress}
                        onChange={(e) => {
                          setSettingsForm({ ...settingsForm, officeAddress: e.target.value });
                          setIsSettingsDirty(true);
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-field">
                    <label>Office City & Country</label>
                    <input
                      type="text"
                      value={settingsForm.officeCity}
                      onChange={(e) => {
                        setSettingsForm({ ...settingsForm, officeCity: e.target.value });
                        setIsSettingsDirty(true);
                      }}
                    />
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label>Instagram URL</label>
                      <input
                        type="url"
                        value={settingsForm.socialInstagram}
                        onChange={(e) => {
                          setSettingsForm({ ...settingsForm, socialInstagram: e.target.value });
                          setIsSettingsDirty(true);
                        }}
                      />
                    </div>
                    <div className="admin-field">
                      <label>X / Twitter URL</label>
                      <input
                        type="url"
                        value={settingsForm.socialTwitter}
                        onChange={(e) => {
                          setSettingsForm({ ...settingsForm, socialTwitter: e.target.value });
                          setIsSettingsDirty(true);
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-field">
                    <label>LinkedIn URL</label>
                    <input
                      type="url"
                      value={settingsForm.socialLinkedin}
                      onChange={(e) => {
                        setSettingsForm({ ...settingsForm, socialLinkedin: e.target.value });
                        setIsSettingsDirty(true);
                      }}
                    />
                  </div>
                </div>

                <div className="admin-form-section">
                  <h3>Footer & Legal Copy</h3>
                  <div className="admin-field">
                    <label>Footer Tagline</label>
                    <input
                      type="text"
                      value={settingsForm.footerTagline}
                      onChange={(e) => {
                        setSettingsForm({ ...settingsForm, footerTagline: e.target.value });
                        setIsSettingsDirty(true);
                      }}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Copyright Text</label>
                    <input
                      type="text"
                      value={settingsForm.copyrightText}
                      onChange={(e) => {
                        setSettingsForm({ ...settingsForm, copyrightText: e.target.value });
                        setIsSettingsDirty(true);
                      }}
                    />
                  </div>
                </div>

                <div className="admin-form-actions">
                  <button type="submit" className="button button-solid">
                    <Save size={16} /> Save Changes
                  </button>
                  {isSettingsDirty && (
                    <button
                      type="button"
                      className="admin-btn"
                      onClick={() => {
                        setSettingsForm(data.settings);
                        setIsSettingsDirty(false);
                      }}
                    >
                      Discard Unsaved Changes
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: STATS */}
          {activeTab === 'stats' && (
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h2>Stats Cards</h2>
                  <p>Key impact metrics displayed across the home and about surfaces.</p>
                </div>
                <button
                  type="button"
                  className="button button-solid"
                  onClick={() =>
                    setEditingItem({
                      table: 'stats',
                      item: {
                        id: `stat-${Date.now()}`,
                        label: 'New Stat',
                        value: '100',
                        caption: 'verified',
                        icon_name: 'badge-check',
                        sort_order: data.stats.length + 1,
                      },
                      isNew: true,
                    })
                  }
                >
                  <Plus size={16} /> Add Stat Card
                </button>
              </div>

              <div className="admin-card-list">
                {[...data.stats]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((stat, idx, arr) => {
                    const Icon = icons[stat.icon_name] || icons['building-2'];
                    return (
                      <div key={stat.id} className="admin-card-row">
                        <div className="admin-reorder-controls">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => reorderRecords('stats', idx, idx - 1)}
                            title="Move up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <span className="admin-order-number">{idx + 1}</span>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => reorderRecords('stats', idx, idx + 1)}
                            title="Move down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        <div className="admin-card-preview-icon">
                          <Icon size={20} />
                        </div>

                        <div className="admin-card-row-info">
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold font-mono">{stat.value}</span>
                            <span className="font-semibold">{stat.label}</span>
                          </div>
                          <p className="text-xs text-neutral-400">{stat.caption}</p>
                        </div>

                        <div className="admin-card-row-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn-sm"
                            onClick={() =>
                              setEditingItem({
                                table: 'stats',
                                item: { ...stat },
                                isNew: false,
                              })
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn-icon text-rose-400 hover:text-rose-300"
                            onClick={() => {
                              if (confirm(`Delete stat "${stat.label}"?`)) {
                                deleteRecord('stats', stat.id);
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT CARDS */}
          {activeTab === 'about' && (
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h2>About & Core Values</h2>
                  <p>The mission, vision, history, and foundational values shaping the studio.</p>
                </div>
                <button
                  type="button"
                  className="button button-solid"
                  onClick={() =>
                    setEditingItem({
                      table: 'aboutCards',
                      item: {
                        id: `about-${Date.now()}`,
                        type: 'core_values',
                        title: 'New Value / Principle',
                        description: 'Write about this principle here...',
                        icon_name: 'shield-check',
                        sort_order: data.aboutCards.length + 1,
                      },
                      isNew: true,
                    })
                  }
                >
                  <Plus size={16} /> Add About Card
                </button>
              </div>

              <div className="admin-card-list">
                {[...data.aboutCards]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((card, idx, arr) => {
                    const Icon = icons[card.icon_name] || icons['target'];
                    return (
                      <div key={card.id} className="admin-card-row">
                        <div className="admin-reorder-controls">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => reorderRecords('aboutCards', idx, idx - 1)}
                            title="Move up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <span className="admin-order-number">{idx + 1}</span>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => reorderRecords('aboutCards', idx, idx + 1)}
                            title="Move down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        <div className="admin-card-preview-icon">
                          <Icon size={20} />
                        </div>

                        <div className="admin-card-row-info">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{card.title}</span>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#222] text-neutral-400">
                              {card.type}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 line-clamp-1">{card.description}</p>
                        </div>

                        <div className="admin-card-row-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn-sm"
                            onClick={() =>
                              setEditingItem({
                                table: 'aboutCards',
                                item: { ...card },
                                isNew: false,
                              })
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn-icon text-rose-400 hover:text-rose-300"
                            onClick={() => {
                              if (confirm(`Delete card "${card.title}"?`)) {
                                deleteRecord('aboutCards', card.id);
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 4: CAPABILITIES */}
          {activeTab === 'capabilities' && (
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h2>Capabilities</h2>
                  <p>Core studio practice areas (Product Design, Engineering, Identity, etc.) with tag pills.</p>
                </div>
                <button
                  type="button"
                  className="button button-solid"
                  onClick={() =>
                    setEditingItem({
                      table: 'capabilities',
                      item: {
                        id: `cap-${Date.now()}`,
                        category_label: 'Specialty',
                        title: 'New Capability',
                        description: 'Detailed description of this capability...',
                        icon_name: 'pen-tool',
                        tags: ['Strategy', 'Execution'],
                        sort_order: data.capabilities.length + 1,
                      },
                      isNew: true,
                    })
                  }
                >
                  <Plus size={16} /> Add Capability
                </button>
              </div>

              <div className="admin-card-list">
                {[...data.capabilities]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((cap, idx, arr) => {
                    const Icon = icons[cap.icon_name] || icons['pen-tool'];
                    return (
                      <div key={cap.id} className="admin-card-row">
                        <div className="admin-reorder-controls">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => reorderRecords('capabilities', idx, idx - 1)}
                            title="Move up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <span className="admin-order-number">{idx + 1}</span>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => reorderRecords('capabilities', idx, idx + 1)}
                            title="Move down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        <div className="admin-card-preview-icon">
                          <Icon size={20} />
                        </div>

                        <div className="admin-card-row-info">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{cap.title}</span>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#222] text-neutral-400">
                              {cap.category_label}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 line-clamp-1">{cap.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {cap.tags.map((t) => (
                              <span key={t} className="text-[10px] bg-[#1a1a1a] border border-[#2a2a2a] px-1.5 py-0.5 rounded text-neutral-300">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="admin-card-row-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn-sm"
                            onClick={() =>
                              setEditingItem({
                                table: 'capabilities',
                                item: { ...cap },
                                isNew: false,
                              })
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn-icon text-rose-400 hover:text-rose-300"
                            onClick={() => {
                              if (confirm(`Delete capability "${cap.title}"?`)) {
                                deleteRecord('capabilities', cap.id);
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 5: SERVICES */}
          {activeTab === 'services' && (
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h2>Services (Digital & IT)</h2>
                  <p>Detailed service items listed on the Services page and Contact inquiry dropdown.</p>
                </div>
                <button
                  type="button"
                  className="button button-solid"
                  onClick={() =>
                    setEditingItem({
                      table: 'services',
                      item: {
                        id: `srv-${Date.now()}`,
                        category: 'digital',
                        title: 'New Service',
                        description: 'What this service offers clients...',
                        icon_name: 'shapes',
                        sort_order: data.services.length + 1,
                      },
                      isNew: true,
                    })
                  }
                >
                  <Plus size={16} /> Add Service
                </button>
              </div>

              <div className="admin-card-list">
                {[...data.services]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((srv, idx, arr) => {
                    const Icon = icons[srv.icon_name] || icons['shapes'];
                    return (
                      <div key={srv.id} className="admin-card-row">
                        <div className="admin-reorder-controls">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => reorderRecords('services', idx, idx - 1)}
                            title="Move up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <span className="admin-order-number">{idx + 1}</span>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => reorderRecords('services', idx, idx + 1)}
                            title="Move down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        <div className="admin-card-preview-icon">
                          <Icon size={20} />
                        </div>

                        <div className="admin-card-row-info">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{srv.title}</span>
                            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${srv.category === 'digital' ? 'bg-sky-950/60 text-sky-400 border border-sky-800/40' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'}`}>
                              {srv.category}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 line-clamp-1">{srv.description}</p>
                        </div>

                        <div className="admin-card-row-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn-sm"
                            onClick={() =>
                              setEditingItem({
                                table: 'services',
                                item: { ...srv },
                                isNew: false,
                              })
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn-icon text-rose-400 hover:text-rose-300"
                            onClick={() => {
                              if (confirm(`Delete service "${srv.title}"?`)) {
                                deleteRecord('services', srv.id);
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 6: HOLDING GROUP */}
          {activeTab === 'holding' && (
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h2>Holding Group Ventures</h2>
                  <p>Companies built, incubated, or backed by GhreatnessLabs.</p>
                </div>
                <button
                  type="button"
                  className="button button-solid"
                  onClick={() =>
                    setEditingItem({
                      table: 'holding',
                      item: {
                        id: `hold-${Date.now()}`,
                        company_name: 'New Venture',
                        description: 'What this company does...',
                        icon_name: 'globe-2',
                        sort_order: data.holding.length + 1,
                      },
                      isNew: true,
                    })
                  }
                >
                  <Plus size={16} /> Add Company
                </button>
              </div>

              <div className="admin-card-list">
                {[...data.holding]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((co, idx, arr) => {
                    const Icon = icons[co.icon_name] || icons['building-2'];
                    return (
                      <div key={co.id} className="admin-card-row">
                        <div className="admin-reorder-controls">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => reorderRecords('holding', idx, idx - 1)}
                            title="Move up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <span className="admin-order-number">{idx + 1}</span>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => reorderRecords('holding', idx, idx + 1)}
                            title="Move down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        <div className="admin-card-preview-icon">
                          <Icon size={20} />
                        </div>

                        <div className="admin-card-row-info">
                          <span className="font-semibold">{co.company_name}</span>
                          <p className="text-xs text-neutral-400 line-clamp-1">{co.description}</p>
                        </div>

                        <div className="admin-card-row-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn-sm"
                            onClick={() =>
                              setEditingItem({
                                table: 'holding',
                                item: { ...co },
                                isNew: false,
                              })
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn-icon text-rose-400 hover:text-rose-300"
                            onClick={() => {
                              if (confirm(`Delete company "${co.company_name}"?`)) {
                                deleteRecord('holding', co.id);
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 7: PROJECTS & CASE STUDIES */}
          {activeTab === 'projects' && (
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h2>Projects & Case Studies</h2>
                  <p>Featured venture case studies displayed across the site.</p>
                </div>
                <button
                  type="button"
                  className="button button-solid"
                  onClick={() =>
                    setEditingItem({
                      table: 'projects',
                      item: {
                        id: `proj-${Date.now()}`,
                        category_tag: 'Platform',
                        title: 'New Case Study',
                        description: 'Short overview...',
                        detail: 'Extended details about the outcome and technical execution...',
                        project_url: '/contact',
                        sort_order: data.projects.length + 1,
                      },
                      isNew: true,
                    })
                  }
                >
                  <Plus size={16} /> Add Project
                </button>
              </div>

              <div className="admin-card-list">
                {[...data.projects]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((proj, idx, arr) => {
                    return (
                      <div key={proj.id} className="admin-card-row">
                        <div className="admin-reorder-controls">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => reorderRecords('projects', idx, idx - 1)}
                            title="Move up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <span className="admin-order-number">{idx + 1}</span>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => reorderRecords('projects', idx, idx + 1)}
                            title="Move down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        <div className="admin-card-row-info">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{proj.title}</span>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#222] text-neutral-400">
                              {proj.category_tag}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 line-clamp-1">{proj.description}</p>
                          {proj.detail && (
                            <p className="text-[11px] text-neutral-500 line-clamp-1">{proj.detail}</p>
                          )}
                        </div>

                        <div className="admin-card-row-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn-sm"
                            onClick={() =>
                              setEditingItem({
                                table: 'projects',
                                item: { ...proj },
                                isNew: false,
                              })
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn-icon text-rose-400 hover:text-rose-300"
                            onClick={() => {
                              if (confirm(`Delete project "${proj.title}"?`)) {
                                deleteRecord('projects', proj.id);
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 8: LEADERSHIP */}
          {activeTab === 'leadership' && (
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h2>Leadership Team</h2>
                  <p>Key minds and directors behind GhreatnessLabs with avatars & social channels.</p>
                </div>
                <button
                  type="button"
                  className="button button-solid"
                  onClick={() =>
                    setEditingItem({
                      table: 'leadership',
                      item: {
                        id: `lead-${Date.now()}`,
                        name: 'New Leader',
                        role: 'Studio Partner',
                        bio: 'Brief background and focus area...',
                        avatar_url: '',
                        social_links: {
                          linkedin: 'https://linkedin.com',
                          twitter: 'https://x.com',
                        },
                        sort_order: data.leadership.length + 1,
                      },
                      isNew: true,
                    })
                  }
                >
                  <Plus size={16} /> Add Team Member
                </button>
              </div>

              <div className="admin-card-list">
                {[...data.leadership]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((lead, idx, arr) => {
                    const initials = lead.name
                      .split(' ')
                      .map((p) => p[0])
                      .join('');
                    return (
                      <div key={lead.id} className="admin-card-row">
                        <div className="admin-reorder-controls">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => reorderRecords('leadership', idx, idx - 1)}
                            title="Move up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <span className="admin-order-number">{idx + 1}</span>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => reorderRecords('leadership', idx, idx + 1)}
                            title="Move down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        <div className="leader-preview-avatar" style={{ width: 40, height: 40, fontSize: 13 }}>
                          {lead.avatar_url ? (
                            <img src={lead.avatar_url} alt={lead.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            initials
                          )}
                        </div>

                        <div className="admin-card-row-info">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{lead.name}</span>
                            <span className="text-xs text-neutral-400">— {lead.role}</span>
                          </div>
                          <p className="text-xs text-neutral-400 line-clamp-1">{lead.bio}</p>
                        </div>

                        <div className="admin-card-row-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn-sm"
                            onClick={() =>
                              setEditingItem({
                                table: 'leadership',
                                item: { ...lead },
                                isNew: false,
                              })
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn-icon text-rose-400 hover:text-rose-300"
                            onClick={() => {
                              if (confirm(`Delete leader "${lead.name}"?`)) {
                                deleteRecord('leadership', lead.id);
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 9: CLIENTS */}
          {activeTab === 'clients' && (
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h2>Clients & Partners</h2>
                  <p>Organizations and logos displayed in the "In Good Company" partner rows.</p>
                </div>
                <button
                  type="button"
                  className="button button-solid"
                  onClick={() =>
                    setEditingItem({
                      table: 'clients',
                      item: {
                        id: `client-${Date.now()}`,
                        name: 'New Client',
                        logo_url: '',
                        sort_order: data.clients.length + 1,
                      },
                      isNew: true,
                    })
                  }
                >
                  <Plus size={16} /> Add Client
                </button>
              </div>

              <div className="admin-card-list">
                {[...data.clients]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((cl, idx, arr) => {
                    return (
                      <div key={cl.id} className="admin-card-row">
                        <div className="admin-reorder-controls">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => reorderRecords('clients', idx, idx - 1)}
                            title="Move up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <span className="admin-order-number">{idx + 1}</span>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => reorderRecords('clients', idx, idx + 1)}
                            title="Move down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        <div className="admin-card-row-info">
                          <span className="font-semibold">{cl.name}</span>
                          {cl.logo_url && <span className="text-xs text-neutral-500">{cl.logo_url}</span>}
                        </div>

                        <div className="admin-card-row-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn-sm"
                            onClick={() =>
                              setEditingItem({
                                table: 'clients',
                                item: { ...cl },
                                isNew: false,
                              })
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn-icon text-rose-400 hover:text-rose-300"
                            onClick={() => {
                              if (confirm(`Delete client "${cl.name}"?`)) {
                                deleteRecord('clients', cl.id);
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 10: TESTIMONIALS */}
          {activeTab === 'testimonials' && (
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h2>Testimonials & Perspectives</h2>
                  <p>Quotes and feedback from global partners and leaders.</p>
                </div>
                <button
                  type="button"
                  className="button button-solid"
                  onClick={() =>
                    setEditingItem({
                      table: 'testimonials',
                      item: {
                        id: `test-${Date.now()}`,
                        quote: '“Insightful quote here...”',
                        author_name: 'Leader Name',
                        author_role: 'Founder',
                        author_company: 'Company',
                        location: 'Lagos, Nigeria',
                        sort_order: data.testimonials.length + 1,
                      },
                      isNew: true,
                    })
                  }
                >
                  <Plus size={16} /> Add Testimonial
                </button>
              </div>

              <div className="admin-card-list">
                {[...data.testimonials]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((t, idx, arr) => {
                    return (
                      <div key={t.id} className="admin-card-row">
                        <div className="admin-reorder-controls">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => reorderRecords('testimonials', idx, idx - 1)}
                            title="Move up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <span className="admin-order-number">{idx + 1}</span>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => reorderRecords('testimonials', idx, idx + 1)}
                            title="Move down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        <div className="admin-card-row-info">
                          <p className="text-sm italic font-serif text-neutral-300">"{t.quote}"</p>
                          <div className="text-xs text-neutral-400 mt-1">
                            <b>{t.author_name}</b> · {t.author_role}, {t.author_company} ({t.location})
                          </div>
                        </div>

                        <div className="admin-card-row-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn-sm"
                            onClick={() =>
                              setEditingItem({
                                table: 'testimonials',
                                item: { ...t },
                                isNew: false,
                              })
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn-icon text-rose-400 hover:text-rose-300"
                            onClick={() => {
                              if (confirm(`Delete testimonial from "${t.author_name}"?`)) {
                                deleteRecord('testimonials', t.id);
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB: FAQS */}
          {activeTab === 'faqs' && (
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h2>Frequently Asked Questions (Accordion)</h2>
                  <p>Questions and answers displayed on the homepage and across the site.</p>
                </div>
                <button
                  type="button"
                  className="button button-solid"
                  onClick={() =>
                    setEditingItem({
                      table: 'faqs',
                      item: {
                        id: `faq-${Date.now()}`,
                        question: 'What is included in...',
                        answer: 'Our senior systems team provides...',
                        sort_order: (data.faqs || []).length + 1,
                      },
                      isNew: true,
                    })
                  }
                >
                  <Plus size={16} /> Add FAQ Question
                </button>
              </div>

              <div className="admin-card-list">
                {[...(data.faqs || [])]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((faq, idx) => {
                    return (
                      <div key={faq.id} className="admin-card-row">
                        <div className="admin-card-row-info">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono uppercase bg-[#222] px-2 py-0.5 rounded text-neutral-300">
                              #{faq.sort_order}
                            </span>
                            <span className="font-semibold text-base text-white">
                              {faq.question}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                            {faq.answer}
                          </p>
                        </div>
                        <div className="admin-card-row-actions">
                          <button
                            type="button"
                            className="admin-btn-icon"
                            disabled={idx === 0}
                            onClick={() => reorderRecords('faqs', idx, idx - 1)}
                            title="Move Up"
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button
                            type="button"
                            className="admin-btn-icon"
                            disabled={idx === (data.faqs || []).length - 1}
                            onClick={() => reorderRecords('faqs', idx, idx + 1)}
                            title="Move Down"
                          >
                            <ArrowDown size={16} />
                          </button>
                          <button
                            type="button"
                            className="admin-btn-icon"
                            onClick={() =>
                              setEditingItem({
                                table: 'faqs',
                                item: { ...faq },
                                isNew: false,
                              })
                            }
                            title="Edit"
                          >
                            <Sliders size={16} />
                          </button>
                          <button
                            type="button"
                            className="admin-btn-icon text-rose-400 hover:text-rose-300"
                            onClick={() => {
                              if (confirm(`Delete FAQ "${faq.question}"?`)) {
                                deleteRecord('faqs', faq.id);
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 11: PAGE COPY */}
          {activeTab === 'pages' && (
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h2>Page Copy & Narratives</h2>
                  <p>Introductory headings and narrative content across each sub-page.</p>
                </div>
                <button
                  type="button"
                  className="button button-solid"
                  onClick={() =>
                    setEditingItem({
                      table: 'pages',
                      item: {
                        id: `page-${Date.now()}`,
                        page_slug: 'about',
                        section_key: 'custom-section',
                        title: 'Section Heading',
                        subtitle: 'Accent Subtitle',
                        content: 'Narrative copy here...',
                        updated_at: new Date().toISOString(),
                      },
                      isNew: true,
                    })
                  }
                >
                  <Plus size={16} /> Add Page Copy Block
                </button>
              </div>

              <div className="admin-card-list">
                {data.pages.map((p) => {
                  return (
                    <div key={p.id} className="admin-card-row">
                      <div className="admin-card-row-info">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono uppercase bg-[#222] px-2 py-0.5 rounded text-neutral-300">
                            /{p.page_slug} : {p.section_key}
                          </span>
                          <span className="font-semibold text-sm">
                            {p.title} <em>{p.subtitle}</em>
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 line-clamp-2 mt-1">{p.content}</p>
                      </div>

                      <div className="admin-card-row-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm"
                          onClick={() =>
                            setEditingItem({
                              table: 'pages',
                              item: { ...p },
                              isNew: false,
                            })
                          }
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-btn-icon text-rose-400 hover:text-rose-300"
                          onClick={() => {
                            if (confirm(`Delete page block "${p.page_slug}/${p.section_key}"?`)) {
                              deleteRecord('pages', p.id);
                            }
                          }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: MEDIA LIBRARY & ASSET MANAGER */}
          {activeTab === 'media' && <MediaManager />}

          {/* TAB 12: SUPABASE SETUP & SQL MIGRATION */}
          {activeTab === 'supabase' && (
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h2>Supabase Connection & SQL Migration</h2>
                  <p>Connect your Supabase project to sync data in the cloud with Row Level Security.</p>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`admin-conn-box ${isSupabaseConnected ? 'connected' : 'fallback'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
                    <Server size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">
                      {isSupabaseConnected ? 'Connected to Supabase Project' : 'Using Local Live Mode (Fallback)'}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {isSupabaseConnected
                        ? 'All updates are being securely read and persisted to your Supabase tables.'
                        : 'Edits are saved locally in instant live storage. Enter your credentials below to connect cloud sync.'}
                    </p>
                  </div>
                </div>
                {isSupabaseConnected && (
                  <button type="button" className="admin-btn admin-btn-sm" onClick={handleClearSupabase}>
                    Disconnect
                  </button>
                )}
              </div>

              {/* Supabase Connection Form */}
              <form onSubmit={handleTestAndSaveSupabase} className="admin-form-section mt-6">
                <h3>Project Credentials</h3>
                <p className="text-xs text-neutral-400 mb-4">
                  Find these in your Supabase Dashboard under <b>Project Settings → API</b>.
                </p>

                <div className="admin-field">
                  <label>Project URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://xyzcompany.supabase.co"
                    value={supaUrl}
                    onChange={(e) => setSupaUrl(e.target.value)}
                  />
                </div>

                <div className="admin-field">
                  <label>Anon Public Key</label>
                  <input
                    type="text"
                    required
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supaKey}
                    onChange={(e) => setSupaKey(e.target.value)}
                  />
                  <small className="admin-field-hint">
                    Safe to use in frontend. Stored securely in your browser cache.
                  </small>
                </div>

                {testResult && (
                  <div className={`admin-test-result ${testResult.success ? 'success' : 'error'}`}>
                    {testResult.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="admin-form-actions">
                  <button type="submit" disabled={isTesting} className="button button-solid">
                    {isTesting ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
                    {isTesting ? 'Verifying...' : 'Save & Test Connection'}
                  </button>
                  {supaUrl && (
                    <button type="button" onClick={handleClearSupabase} className="admin-btn">
                      Clear Credentials
                    </button>
                  )}
                </div>
              </form>

              {/* SQL Migration & Schema Generator */}
              <div className="admin-form-section mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div>
                    <h3>SQL Schema & Seed Generator</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Includes <code>CREATE TABLE</code>, public read & authenticated write <code>RLS</code> policies, and complete seed data matching all studio copy.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleCopySql} className="admin-btn admin-btn-sm">
                      {copiedSql ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      {copiedSql ? 'Copied!' : 'Copy SQL Script'}
                    </button>
                    <button type="button" onClick={handleDownloadSql} className="admin-btn admin-btn-sm">
                      <Download size={14} /> Download .sql
                    </button>
                  </div>
                </div>

                <div className="admin-code-box">
                  <pre>
                    <code>{generateSupabaseSql().slice(0, 1600)}...</code>
                  </pre>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Tip: Copy this script, open your <b>Supabase Project Dashboard → SQL Editor → New query</b>, paste, and click <b>Run</b>!
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: EDIT / ADD RECORD */}
      {editingItem && (
        <div className="admin-modal-backdrop" onClick={() => setEditingItem(null)} role="dialog" aria-modal="true">
          <div className="admin-modal-card admin-modal-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>
                {editingItem.isNew ? 'Add' : 'Edit'} {editingItem.table} Record
              </h3>
              <button
                type="button"
                className="admin-btn-icon"
                onClick={() => setEditingItem(null)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveRecord(editingItem.table as keyof CmsData, editingItem.item as never);
                setEditingItem(null);
              }}
              className="admin-modal-body"
            >
              {/* Dynamic fields based on editingItem.table */}
              {editingItem.table === 'stats' && (
                <>
                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label>Label</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.item.label || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, label: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="admin-field">
                      <label>Metric Value (Number or text)</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.item.value || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, value: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="admin-field">
                    <label>Caption</label>
                    <input
                      type="text"
                      required
                      value={String(editingItem.item.caption || '')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, caption: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Icon</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() =>
                          openIconPicker(String(editingItem.item.icon_name || 'building-2'), (name) => {
                            setEditingItem({
                              ...editingItem,
                              item: { ...editingItem.item, icon_name: name },
                            });
                          })
                        }
                      >
                        Choose Icon ({String(editingItem.item.icon_name || 'building-2')})
                      </button>
                    </div>
                  </div>
                </>
              )}

              {editingItem.table === 'aboutCards' && (
                <>
                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label>Card Type</label>
                      <select
                        value={String(editingItem.item.type || 'core_values')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, type: e.target.value },
                          })
                        }
                      >
                        <option value="mission">Mission</option>
                        <option value="vision">Vision</option>
                        <option value="core_values">Core Values</option>
                        <option value="history">History (How we started)</option>
                        <option value="what_we_do">What We Do</option>
                      </select>
                    </div>
                    <div className="admin-field">
                      <label>Title</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.item.title || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, title: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="admin-field">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      required
                      value={String(editingItem.item.description || '')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, description: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Icon</label>
                    <button
                      type="button"
                      className="admin-btn"
                      onClick={() =>
                        openIconPicker(String(editingItem.item.icon_name || 'target'), (name) => {
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, icon_name: name },
                          });
                        })
                      }
                    >
                      Choose Icon ({String(editingItem.item.icon_name || 'target')})
                    </button>
                  </div>
                </>
              )}

              {editingItem.table === 'capabilities' && (
                <>
                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label>Category Label</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.item.category_label || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, category_label: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="admin-field">
                      <label>Title</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.item.title || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, title: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="admin-field">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      required
                      value={String(editingItem.item.description || '')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, description: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Icon</label>
                    <button
                      type="button"
                      className="admin-btn"
                      onClick={() =>
                        openIconPicker(String(editingItem.item.icon_name || 'pen-tool'), (name) => {
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, icon_name: name },
                          });
                        })
                      }
                    >
                      Choose Icon ({String(editingItem.item.icon_name || 'pen-tool')})
                    </button>
                  </div>
                  <TagManager
                    tags={(editingItem.item.tags as string[]) || []}
                    onChange={(newTags) =>
                      setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, tags: newTags },
                      })
                    }
                  />
                </>
              )}

              {editingItem.table === 'services' && (
                <>
                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label>Category</label>
                      <select
                        value={String(editingItem.item.category || 'digital')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, category: e.target.value },
                          })
                        }
                      >
                        <option value="digital">Digital Services (01)</option>
                        <option value="technology">Information Technology (02)</option>
                      </select>
                    </div>
                    <div className="admin-field">
                      <label>Service Title</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.item.title || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, title: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="admin-field">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      required
                      value={String(editingItem.item.description || '')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, description: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Icon</label>
                    <button
                      type="button"
                      className="admin-btn"
                      onClick={() =>
                        openIconPicker(String(editingItem.item.icon_name || 'shapes'), (name) => {
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, icon_name: name },
                          });
                        })
                      }
                    >
                      Choose Icon ({String(editingItem.item.icon_name || 'shapes')})
                    </button>
                  </div>
                </>
              )}

              {editingItem.table === 'holding' && (
                <>
                  <div className="admin-field">
                    <label>Company Name</label>
                    <input
                      type="text"
                      required
                      value={String(editingItem.item.company_name || '')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, company_name: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      required
                      value={String(editingItem.item.description || '')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, description: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Icon</label>
                    <button
                      type="button"
                      className="admin-btn"
                      onClick={() =>
                        openIconPicker(String(editingItem.item.icon_name || 'globe-2'), (name) => {
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, icon_name: name },
                          });
                        })
                      }
                    >
                      Choose Icon ({String(editingItem.item.icon_name || 'globe-2')})
                    </button>
                  </div>
                </>
              )}

              {editingItem.table === 'projects' && (
                <>
                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label>Category Tag</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.item.category_tag || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, category_tag: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="admin-field">
                      <label>Project Title</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.item.title || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, title: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="admin-field">
                    <label>Short Description</label>
                    <textarea
                      rows={2}
                      required
                      value={String(editingItem.item.description || '')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, description: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Extended Detail</label>
                    <textarea
                      rows={2}
                      value={String(editingItem.item.detail || '')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, detail: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Destination / Action Link URL</label>
                    <input
                      type="text"
                      value={String(editingItem.item.project_url || '/contact')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, project_url: e.target.value },
                        })
                      }
                    />
                  </div>
                </>
              )}

              {editingItem.table === 'leadership' && (
                <>
                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label>Name</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.item.name || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, name: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="admin-field">
                      <label>Role</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.item.role || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, role: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="admin-field">
                    <label>Bio</label>
                    <textarea
                      rows={3}
                      required
                      value={String(editingItem.item.bio || '')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, bio: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Avatar Image URL (Optional - defaults to name initials)</label>
                    <input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={String(editingItem.item.avatar_url || '')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, avatar_url: e.target.value },
                        })
                      }
                    />
                  </div>
                </>
              )}

              {editingItem.table === 'clients' && (
                <>
                  <div className="admin-field">
                    <label>Client / Partner Name</label>
                    <input
                      type="text"
                      required
                      value={String(editingItem.item.name || '')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, name: e.target.value },
                        })
                      }
                    />
                  </div>
                </>
              )}

              {editingItem.table === 'testimonials' && (
                <>
                  <div className="admin-field">
                    <label>Quote Text</label>
                    <textarea
                      rows={3}
                      required
                      value={String(editingItem.item.quote || '')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, quote: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label>Author Name</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.item.author_name || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, author_name: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="admin-field">
                      <label>Author Role</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.item.author_role || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, author_role: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label>Author Company</label>
                      <input
                        type="text"
                        value={String(editingItem.item.author_company || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, author_company: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="admin-field">
                      <label>Location</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.item.location || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, location: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {editingItem.table === 'pages' && (
                <>
                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label>Page Slug</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.item.page_slug || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, page_slug: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="admin-field">
                      <label>Section Key</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.item.section_key || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, section_key: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label>Title</label>
                      <input
                        type="text"
                        value={String(editingItem.item.title || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, title: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="admin-field">
                      <label>Accent Subtitle</label>
                      <input
                        type="text"
                        value={String(editingItem.item.subtitle || '')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, subtitle: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="admin-field">
                    <label>Content Narrative</label>
                    <textarea
                      rows={4}
                      required
                      value={String(editingItem.item.content || '')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, content: e.target.value },
                        })
                      }
                    />
                  </div>
                </>
              )}

              {editingItem.table === 'faqs' && (
                <>
                  <div className="admin-field">
                    <label>Question</label>
                    <input
                      type="text"
                      required
                      value={String(editingItem.item.question || '')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, question: e.target.value },
                        })
                      }
                      placeholder="e.g. How do studio engagements typically start?"
                    />
                  </div>
                  <div className="admin-field">
                    <label>Answer</label>
                    <textarea
                      rows={5}
                      required
                      value={String(editingItem.item.answer || '')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, answer: e.target.value },
                        })
                      }
                      placeholder="Detailed explanation of the process or answer..."
                    />
                  </div>
                  <div className="admin-field">
                    <label>Sort Order</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={Number(editingItem.item.sort_order || 1)}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, sort_order: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                </>
              )}

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn" onClick={() => setEditingItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="button button-solid">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ICON PICKER MODAL */}
      {pickerOpen && pickerTarget && (
        <IconPickerModal
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
          currentIcon={pickerTarget.currentIcon}
          onSelect={pickerTarget.onSelect}
        />
      )}
    </div>
  );
}
