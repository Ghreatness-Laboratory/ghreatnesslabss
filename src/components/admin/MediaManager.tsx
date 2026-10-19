import React, { useState, useRef, useMemo } from 'react';
import {
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  Building,
  Layers,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  X,
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { MediaItem } from '../../types/cms';
import {
  validateImageFile,
  validateImageUrl,
  uploadMediaFile,
  createMediaItemFromUrl,
} from '../../lib/mediaStorage';

type AddMode = 'upload' | 'url';

export function MediaManager() {
  const {
    data,
    saveRecord,
    deleteRecord,
    assignMediaToSpot,
    replaceMediaItem,
    isSupabaseConnected,
    notify,
  } = useCms();

  const [activeMode, setActiveMode] = useState<AddMode>('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpot, setFilterSpot] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadSpot, setUploadSpot] = useState<MediaItem['assigned_spot']>('unassigned');
  const [uploadAssignedId, setUploadAssignedId] = useState<string>('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // URL State
  const [urlInput, setUrlInput] = useState('');
  const [urlAltText, setUrlAltText] = useState('');
  const [urlSpot, setUrlSpot] = useState<MediaItem['assigned_spot']>('unassigned');
  const [urlAssignedId, setUrlAssignedId] = useState<string>('');
  const [urlPreviewInfo, setUrlPreviewInfo] = useState<{
    valid: boolean;
    width?: number;
    height?: number;
    error?: string;
  } | null>(null);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [isSavingUrl, setIsSavingUrl] = useState(false);

  // Replace Modal State
  const [replacingItem, setReplacingItem] = useState<MediaItem | null>(null);
  const [replaceMode, setReplaceMode] = useState<'upload' | 'url'>('upload');
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreviewUrl, setReplacePreviewUrl] = useState<string | null>(null);
  const [replaceUrlInput, setReplaceUrlInput] = useState('');
  const [isReplacing, setIsReplacing] = useState(false);

  // Delete Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copied indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    setFileError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setFileError(validation.error || 'Invalid file format or size.');
      setSelectedFile(null);
      setUploadPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    // Friendly alt text default
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setUploadAltText(nameWithoutExt);

    const objectUrl = URL.createObjectURL(file);
    setUploadPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Clear upload form
  const handleCancelUpload = () => {
    setSelectedFile(null);
    if (uploadPreviewUrl) {
      URL.revokeObjectURL(uploadPreviewUrl);
      setUploadPreviewUrl(null);
    }
    setUploadAltText('');
    setUploadSpot('unassigned');
    setUploadAssignedId('');
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Perform File Upload & Save
  const handleSaveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setFileError(null);

    try {
      let assignedLabel = '';
      if (uploadSpot === 'team_member' && uploadAssignedId) {
        const leader = data.leadership.find((l) => l.id === uploadAssignedId);
        assignedLabel = leader ? `${leader.name} (${leader.role})` : 'Team Member';
      } else if (uploadSpot === 'partner_logo' && uploadAssignedId) {
        const client = data.clients.find((c) => c.id === uploadAssignedId);
        assignedLabel = client ? client.name : 'Partner Logo';
      } else if (uploadSpot === 'project' && uploadAssignedId) {
        const proj = data.projects.find((p) => p.id === uploadAssignedId);
        assignedLabel = proj ? proj.title : 'Project';
      } else if (uploadSpot === 'hero') {
        assignedLabel = 'Hero Brand Visual';
      }

      const newMedia = await uploadMediaFile(
        selectedFile,
        uploadAltText,
        uploadSpot,
        uploadAssignedId || undefined,
        assignedLabel || undefined
      );

      // Save to media collection
      await saveRecord('media', newMedia);

      // If assigned to a spot, cascade to target model
      if (uploadSpot !== 'unassigned') {
        await assignMediaToSpot(newMedia.id, uploadSpot, uploadAssignedId, assignedLabel);
      }

      notify('Image successfully saved to Media Library!', 'success');
      handleCancelUpload();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setFileError(msg);
      notify(`Upload failed: ${msg}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle URL Validation
  const handleValidateUrl = async () => {
    if (!urlInput.trim()) return;
    setIsValidatingUrl(true);
    setUrlPreviewInfo(null);

    const res = await validateImageUrl(urlInput);
    setUrlPreviewInfo(res);
    setIsValidatingUrl(false);

    if (res.valid) {
      try {
        const urlObj = new URL(urlInput);
        const namePart = urlObj.pathname.split('/').pop() || 'external image';
        if (!urlAltText) {
          setUrlAltText(namePart.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
      } catch {
        // Keep fallback
      }
    }
  };

  // Save by URL
  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsSavingUrl(true);
    try {
      let assignedLabel = '';
      if (urlSpot === 'team_member' && urlAssignedId) {
        const leader = data.leadership.find((l) => l.id === urlAssignedId);
        assignedLabel = leader ? `${leader.name} (${leader.role})` : 'Team Member';
      } else if (urlSpot === 'partner_logo' && urlAssignedId) {
        const client = data.clients.find((c) => c.id === urlAssignedId);
        assignedLabel = client ? client.name : 'Partner Logo';
      } else if (urlSpot === 'project' && urlAssignedId) {
        const proj = data.projects.find((p) => p.id === urlAssignedId);
        assignedLabel = proj ? proj.title : 'Project';
      } else if (urlSpot === 'hero') {
        assignedLabel = 'Hero Brand Visual';
      }

      const newMedia = await createMediaItemFromUrl(
        urlInput,
        urlAltText,
        urlSpot,
        urlAssignedId || undefined,
        assignedLabel || undefined
      );

      await saveRecord('media', newMedia);

      if (urlSpot !== 'unassigned') {
        await assignMediaToSpot(newMedia.id, urlSpot, urlAssignedId, assignedLabel);
      }

      notify('Image URL saved to Media Library!', 'success');
      setUrlInput('');
      setUrlAltText('');
      setUrlSpot('unassigned');
      setUrlAssignedId('');
      setUrlPreviewInfo(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save URL image';
      notify(msg, 'error');
    } finally {
      setIsSavingUrl(false);
    }
  };

  // Copy Image URL to clipboard
  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    notify('Image URL copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Spot assignment change handler for existing grid card
  const handleGridSpotChange = async (
    item: MediaItem,
    newSpot: MediaItem['assigned_spot'],
    targetId?: string
  ) => {
    let targetLabel = '';
    if (newSpot === 'team_member' && targetId) {
      const leader = data.leadership.find((l) => l.id === targetId);
      targetLabel = leader ? `${leader.name} (${leader.role})` : 'Team Member';
    } else if (newSpot === 'partner_logo' && targetId) {
      const client = data.clients.find((c) => c.id === targetId);
      targetLabel = client ? client.name : 'Partner Logo';
    } else if (newSpot === 'project' && targetId) {
      const proj = data.projects.find((p) => p.id === targetId);
      targetLabel = proj ? proj.title : 'Project';
    } else if (newSpot === 'hero') {
      targetLabel = 'Hero Brand Visual';
    } else if (newSpot === 'unassigned') {
      targetLabel = 'Unassigned';
    }

    await assignMediaToSpot(item.id, newSpot, targetId, targetLabel);
  };

  // Alt Text update on blur
  const handleAltTextBlur = (item: MediaItem, newAlt: string) => {
    if (newAlt === item.alt_text) return;
    const updated: MediaItem = {
      ...item,
      alt_text: newAlt.trim() || item.filename,
      updated_at: new Date().toISOString(),
    };
    saveRecord('media', updated);
  };

  // Replace Image execution
  const handleExecuteReplace = async () => {
    if (!replacingItem) return;
    setIsReplacing(true);

    try {
      let newUrl = '';
      let newFilename = replacingItem.filename;
      let newStoragePath = replacingItem.storage_path;

      if (replaceMode === 'upload' && replaceFile) {
        const uploaded = await uploadMediaFile(
          replaceFile,
          replacingItem.alt_text,
          replacingItem.assigned_spot,
          replacingItem.assigned_id,
          replacingItem.assigned_label
        );
        newUrl = uploaded.url;
        newFilename = uploaded.filename;
        newStoragePath = uploaded.storage_path;
      } else if (replaceMode === 'url' && replaceUrlInput.trim()) {
        const val = await validateImageUrl(replaceUrlInput);
        if (!val.valid) {
          throw new Error(val.error || 'Invalid replacement URL');
        }
        newUrl = replaceUrlInput.trim();
        newStoragePath = undefined;
      } else {
        throw new Error('Please select a file or provide an image URL');
      }

      await replaceMediaItem(replacingItem.id, newUrl, newFilename, newStoragePath);
      setReplacingItem(null);
      setReplaceFile(null);
      setReplacePreviewUrl(null);
      setReplaceUrlInput('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Replacement failed';
      notify(msg, 'error');
    } finally {
      setIsReplacing(false);
    }
  };

  // Delete Image execution
  const handleExecuteDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);

    try {
      await deleteRecord('media', deletingItem.id);
      setDeletingItem(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      notify(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & search media items
  const filteredMedia = useMemo(() => {
    const list = Array.isArray(data.media) ? data.media : [];
    return list.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.filename?.toLowerCase().includes(q);
        const matchesAlt = item.alt_text?.toLowerCase().includes(q);
        const matchesLabel = item.assigned_label?.toLowerCase().includes(q);
        if (!matchesName && !matchesAlt && !matchesLabel) return false;
      }

      // Spot filter
      if (filterSpot !== 'all') {
        if (item.assigned_spot !== filterSpot) return false;
      }

      // Source filter
      if (filterSource !== 'all') {
        if (item.source !== filterSource) return false;
      }

      return true;
    });
  }, [data.media, searchQuery, filterSpot, filterSource]);

  return (
    <div className="admin-panel media-manager-panel">
      {/* Panel Header */}
      <div className="admin-panel-head">
        <div>
          <h2>Media Library & Assets</h2>
          <p>
            Upload, manage, and assign images to hero displays, leadership team members, partner logos,
            and project ventures. Backed by persistent storage with automated compression.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400 font-mono">
            {data.media?.length || 0} Total Assets
          </span>
          {isSupabaseConnected ? (
            <span className="text-[11px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Supabase Storage
            </span>
          ) : (
            <span className="text-[11px] bg-amber-950/80 text-amber-400 border border-amber-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Local Live Mode
            </span>
          )}
        </div>
      </div>

      {/* Add Image Section */}
      <div className="media-add-box">
        <div className="media-tabs-header">
          <button
            type="button"
            className={`media-tab-btn ${activeMode === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveMode('upload')}
          >
            <Upload size={15} /> Upload from Device
          </button>
          <button
            type="button"
            className={`media-tab-btn ${activeMode === 'url' ? 'active' : ''}`}
            onClick={() => setActiveMode('url')}
          >
            <LinkIcon size={15} /> Paste Image URL
          </button>
        </div>

        {/* Tab 1: Upload from Device */}
        {activeMode === 'upload' && (
          <div className="media-tab-content">
            {!selectedFile ? (
              <div
                className={`media-dropzone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="media-dropzone-icon">
                  <Upload size={28} />
                </div>
                <div className="media-dropzone-text">
                  <p className="font-semibold text-neutral-200">
                    Click to browse or drag and drop image here
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Accepts <b>JPG, PNG, WebP, SVG</b> • Max <b>5MB</b> per file
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-2 font-mono">
                    Large photos automatically compressed & scaled for crisp 60fps performance
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveUpload} className="media-preview-form">
                <div className="media-preview-layout">
                  <div className="media-preview-visual">
                    {uploadPreviewUrl && (
                      <img
                        src={uploadPreviewUrl}
                        alt="Upload preview"
                        className="media-preview-img"
                      />
                    )}
                    <span className="media-source-pill upload">UPLOAD PREVIEW</span>
                  </div>

                  <div className="media-preview-fields">
                    <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                      <div>
                        <h4 className="font-semibold text-white text-sm">{selectedFile.name}</h4>
                        <span className="text-xs text-neutral-400 font-mono">
                          {(selectedFile.size / 1024).toFixed(0)} KB • {selectedFile.type || 'image'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCancelUpload}
                        className="admin-btn admin-btn-sm"
                        title="Choose a different file"
                      >
                        Change File
                      </button>
                    </div>

                    <div className="admin-field mt-3">
                      <label>Descriptive Alt Text (for SEO & Accessibility)</label>
                      <input
                        type="text"
                        required
                        value={uploadAltText}
                        onChange={(e) => setUploadAltText(e.target.value)}
                        placeholder="e.g. Portrait of Systems Architect Gideon Greatness"
                      />
                    </div>

                    <div className="admin-form-row mt-2">
                      <div className="admin-field">
                        <label>Assign to Spot on Site</label>
                        <select
                          value={uploadSpot}
                          onChange={(e) => {
                            const val = e.target.value as MediaItem['assigned_spot'];
                            setUploadSpot(val);
                            setUploadAssignedId('');
                          }}
                        >
                          <option value="unassigned">Unassigned (Save to Media Pool)</option>
                          <option value="hero">Hero Brand Visual / Mark</option>
                          <option value="team_member">Team Member Avatar</option>
                          <option value="partner_logo">Partner / Client Logo</option>
                          <option value="project">Project Case Study Hero</option>
                          <option value="general">General Asset</option>
                        </select>
                      </div>

                      {uploadSpot === 'team_member' && (
                        <div className="admin-field">
                          <label>Select Team Member</label>
                          <select
                            required
                            value={uploadAssignedId}
                            onChange={(e) => setUploadAssignedId(e.target.value)}
                          >
                            <option value="">-- Choose Leader --</option>
                            {data.leadership.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.name} ({l.role})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {uploadSpot === 'partner_logo' && (
                        <div className="admin-field">
                          <label>Select Partner / Client</label>
                          <select
                            required
                            value={uploadAssignedId}
                            onChange={(e) => setUploadAssignedId(e.target.value)}
                          >
                            <option value="">-- Choose Client --</option>
                            {data.clients.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {uploadSpot === 'project' && (
                        <div className="admin-field">
                          <label>Select Project</label>
                          <select
                            required
                            value={uploadAssignedId}
                            onChange={(e) => setUploadAssignedId(e.target.value)}
                          >
                            <option value="">-- Choose Project --</option>
                            {data.projects.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {fileError && (
                      <div className="media-error-box mt-2">
                        <AlertTriangle size={15} />
                        <span>{fileError}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-4">
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="button button-solid justify-center"
                      >
                        {isUploading ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" /> Uploading & Optimizing...
                          </>
                        ) : (
                          <>
                            <Upload size={15} /> Save to Media Library
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelUpload}
                        disabled={isUploading}
                        className="admin-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {fileError && !selectedFile && (
              <div className="media-error-box mt-3">
                <AlertTriangle size={16} />
                <span>{fileError}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Paste Image URL */}
        {activeMode === 'url' && (
          <form onSubmit={handleSaveUrl} className="media-tab-content">
            <div className="admin-field">
              <label>External Image URL (must begin with https://)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setUrlPreviewInfo(null);
                  }}
                  placeholder="https://images.unsplash.com/... or https://domain.com/logo.svg"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={handleValidateUrl}
                  disabled={isValidatingUrl || !urlInput.trim()}
                  className="admin-btn flex-shrink-0"
                >
                  {isValidatingUrl ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Verify URL
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* URL Preview Card */}
            {urlPreviewInfo && (
              <div className="mt-3">
                {urlPreviewInfo.valid ? (
                  <div className="media-url-verified-card">
                    <div className="media-url-thumb">
                      <img src={urlInput} alt="URL preview" />
                    </div>
                    <div className="media-url-info">
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> Image Verified & Ready
                      </span>
                      <p className="text-xs text-neutral-400 mt-1 font-mono">
                        Dimensions: {urlPreviewInfo.width} × {urlPreviewInfo.height} px
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="media-error-box">
                    <AlertTriangle size={15} />
                    <span>{urlPreviewInfo.error || 'Failed to load image from URL.'}</span>
                  </div>
                )}
              </div>
            )}

            <div className="admin-form-row mt-3">
              <div className="admin-field">
                <label>Alt Text / Description</label>
                <input
                  type="text"
                  required
                  value={urlAltText}
                  onChange={(e) => setUrlAltText(e.target.value)}
                  placeholder="e.g. Partner organization emblem"
                />
              </div>

              <div className="admin-field">
                <label>Assign to Spot on Site</label>
                <select
                  value={urlSpot}
                  onChange={(e) => {
                    const val = e.target.value as MediaItem['assigned_spot'];
                    setUrlSpot(val);
                    setUrlAssignedId('');
                  }}
                >
                  <option value="unassigned">Unassigned (Save to Media Pool)</option>
                  <option value="hero">Hero Brand Visual / Mark</option>
                  <option value="team_member">Team Member Avatar</option>
                  <option value="partner_logo">Partner / Client Logo</option>
                  <option value="project">Project Case Study Hero</option>
                  <option value="general">General Asset</option>
                </select>
              </div>
            </div>

            {urlSpot === 'team_member' && (
              <div className="admin-field mt-2">
                <label>Select Team Member</label>
                <select
                  required
                  value={urlAssignedId}
                  onChange={(e) => setUrlAssignedId(e.target.value)}
                >
                  <option value="">-- Choose Leader --</option>
                  {data.leadership.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {urlSpot === 'partner_logo' && (
              <div className="admin-field mt-2">
                <label>Select Partner / Client</label>
                <select
                  required
                  value={urlAssignedId}
                  onChange={(e) => setUrlAssignedId(e.target.value)}
                >
                  <option value="">-- Choose Client --</option>
                  {data.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {urlSpot === 'project' && (
              <div className="admin-field mt-2">
                <label>Select Project</label>
                <select
                  required
                  value={urlAssignedId}
                  onChange={(e) => setUrlAssignedId(e.target.value)}
                >
                  <option value="">-- Choose Project --</option>
                  {data.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isSavingUrl || !urlInput.trim()}
              className="button button-solid mt-4 justify-center"
            >
              {isSavingUrl ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <LinkIcon size={14} /> Save URL to Media Library
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Media Filter & Search Toolbar */}
      <div className="media-toolbar">
        <div className="media-search-box">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search assets by filename, alt text, or spot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-neutral-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="media-filters">
          <div className="media-filter-group">
            <span className="media-filter-label">Spot:</span>
            <select
              value={filterSpot}
              onChange={(e) => setFilterSpot(e.target.value)}
              className="media-select-sm"
            >
              <option value="all">All Spots ({data.media?.length || 0})</option>
              <option value="team_member">Team Members</option>
              <option value="partner_logo">Partner Logos</option>
              <option value="hero">Hero Visual</option>
              <option value="project">Projects</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>

          <div className="media-filter-group">
            <span className="media-filter-label">Source:</span>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="media-select-sm"
            >
              <option value="all">All Sources</option>
              <option value="upload">Uploaded Files</option>
              <option value="url">External URLs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="media-empty-state">
          <ImageIcon size={32} />
          <h4 className="font-semibold text-white mt-3">No matching images found</h4>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm">
            {searchQuery || filterSpot !== 'all' || filterSource !== 'all'
              ? 'Try adjusting your search query or filters to find what you need.'
              : 'Add your first image using the upload or URL box above.'}
          </p>
        </div>
      ) : (
        <div className="media-grid">
          {filteredMedia.map((item) => {
            const isAssigned = item.assigned_spot && item.assigned_spot !== 'unassigned';
            return (
              <div key={item.id} className="media-card">
                {/* Visual Thumbnail */}
                <div className="media-card-thumb-wrap">
                  <img
                    src={item.url}
                    alt={item.alt_text}
                    className="media-card-img"
                    loading="lazy"
                  />
                  <div className="media-card-badge-row">
                    <span className={`media-source-pill ${item.source}`}>
                      {item.source === 'upload' ? 'UPLOADED' : 'URL'}
                    </span>
                    {isAssigned && (
                      <span className="media-spot-pill" title={item.assigned_label || item.assigned_spot}>
                        {item.assigned_spot === 'team_member' && <Users size={11} />}
                        {item.assigned_spot === 'partner_logo' && <Building size={11} />}
                        {item.assigned_spot === 'project' && <Layers size={11} />}
                        {item.assigned_spot === 'hero' && <Sparkles size={11} />}
                        <span className="truncate max-w-[120px]">
                          {item.assigned_label || item.assigned_spot}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="media-card-body">
                  <div className="flex items-center justify-between">
                    <span className="media-card-filename" title={item.filename}>
                      {item.filename}
                    </span>
                    {item.size_bytes && (
                      <span className="media-card-filesize">
                        {(item.size_bytes / 1024).toFixed(0)} KB
                      </span>
                    )}
                  </div>

                  {/* Editable Alt Text */}
                  <div className="media-card-field">
                    <label>Alt Text</label>
                    <input
                      type="text"
                      defaultValue={item.alt_text}
                      onBlur={(e) => handleAltTextBlur(item, e.target.value)}
                      placeholder="Image alt description..."
                      title="Click to edit alt text (saves automatically on blur)"
                    />
                  </div>

                  {/* Spot Assignment Dropdown */}
                  <div className="media-card-field">
                    <label>Assigned Spot</label>
                    <select
                      value={
                        item.assigned_id
                          ? `${item.assigned_spot}:${item.assigned_id}`
                          : item.assigned_spot || 'unassigned'
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes(':')) {
                          const [spot, id] = val.split(':');
                          handleGridSpotChange(item, spot as MediaItem['assigned_spot'], id);
                        } else {
                          handleGridSpotChange(item, val as MediaItem['assigned_spot'], undefined);
                        }
                      }}
                    >
                      <option value="unassigned">Unassigned (Pool)</option>
                      <option value="hero">Hero Brand Visual</option>
                      <optgroup label="Leadership Team Avatars">
                        {data.leadership.map((leader) => (
                          <option key={leader.id} value={`team_member:${leader.id}`}>
                            Team: {leader.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Partner / Client Logos">
                        {data.clients.map((client) => (
                          <option key={client.id} value={`partner_logo:${client.id}`}>
                            Partner: {client.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Project Ventures">
                        {data.projects.map((proj) => (
                          <option key={proj.id} value={`project:${proj.id}`}>
                            Project: {proj.title}
                          </option>
                        ))}
                      </optgroup>
                      <option value="general">General Asset</option>
                    </select>
                  </div>

                  {/* Actions Footer */}
                  <div className="media-card-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm"
                      onClick={() => handleCopyUrl(item)}
                      title="Copy public image link"
                    >
                      {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                      {copiedId === item.id ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm"
                      onClick={() => {
                        setReplacingItem(item);
                        setReplaceFile(null);
                        setReplacePreviewUrl(null);
                        setReplaceUrlInput('');
                      }}
                      title="Replace image with new file or URL without breaking pages"
                    >
                      <RefreshCw size={12} /> Replace
                    </button>
                    <button
                      type="button"
                      className="admin-btn-icon text-rose-400 hover:text-rose-300 ml-auto"
                      onClick={() => setDeletingItem(item)}
                      title="Delete image"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Replace Image Modal */}
      {replacingItem && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card max-w-lg">
            <div className="admin-modal-head">
              <h3>Replace Image</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setReplacingItem(null)}
              >
                &times;
              </button>
            </div>

            <div className="p-4">
              <p className="text-xs text-neutral-300 mb-3">
                Replacing <b>{replacingItem.filename}</b> will update all pages where this image is
                currently featured ({replacingItem.assigned_label || 'Media Pool'}) without breaking
                any layout.
              </p>

              <div className="media-tabs-header mb-3">
                <button
                  type="button"
                  className={`media-tab-btn ${replaceMode === 'upload' ? 'active' : ''}`}
                  onClick={() => setReplaceMode('upload')}
                >
                  <Upload size={14} /> New File
                </button>
                <button
                  type="button"
                  className={`media-tab-btn ${replaceMode === 'url' ? 'active' : ''}`}
                  onClick={() => setReplaceMode('url')}
                >
                  <LinkIcon size={14} /> New URL
                </button>
              </div>

              {replaceMode === 'upload' ? (
                <div>
                  <input
                    ref={replaceFileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setReplaceFile(file);
                        setReplacePreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                  />
                  <div
                    onClick={() => replaceFileInputRef.current?.click()}
                    className="border border-dashed border-[#333] hover:border-neutral-400 p-4 rounded-xl text-center cursor-pointer transition-colors"
                  >
                    {replacePreviewUrl ? (
                      <div className="flex items-center gap-3 justify-center">
                        <img
                          src={replacePreviewUrl}
                          alt="Replacement preview"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="text-left text-xs">
                          <p className="font-semibold text-white">{replaceFile?.name}</p>
                          <p className="text-neutral-400">Click to choose a different file</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-300">
                        Click to select replacement JPG, PNG, WebP, or SVG file
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="admin-field">
                  <label>Replacement Image URL</label>
                  <input
                    type="url"
                    value={replaceUrlInput}
                    onChange={(e) => setReplaceUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-5">
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => setReplacingItem(null)}
                  disabled={isReplacing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="button button-solid"
                  onClick={handleExecuteReplace}
                  disabled={isReplacing || (replaceMode === 'upload' && !replaceFile) || (replaceMode === 'url' && !replaceUrlInput.trim())}
                >
                  {isReplacing ? 'Replacing...' : 'Apply Replacement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card max-w-md">
            <div className="admin-modal-head">
              <h3>Delete Image</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setDeletingItem(null)}
              >
                &times;
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-3 p-3 bg-rose-950/40 border border-rose-900/60 rounded-xl mb-3">
                <AlertTriangle size={24} className="text-rose-400 flex-shrink-0" />
                <div className="text-xs text-rose-200">
                  <p className="font-semibold">Are you sure you want to delete this image?</p>
                  <p className="text-rose-300/80 mt-0.5">
                    Filename: <b>{deletingItem.filename}</b>
                  </p>
                </div>
              </div>

              {deletingItem.assigned_spot !== 'unassigned' && (
                <p className="text-xs text-amber-300 bg-amber-950/40 border border-amber-900/60 p-2.5 rounded-lg mb-3">
                  ⚠️ This image is currently assigned to <b>{deletingItem.assigned_label || deletingItem.assigned_spot}</b>.
                  Deleting it will remove the assignment without breaking the page.
                </p>
              )}

              {deletingItem.source === 'upload' && deletingItem.storage_path && (
                <p className="text-xs text-neutral-400 mb-3 font-mono">
                  The uploaded file in persistent storage will also be deleted.
                </p>
              )}

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => setDeletingItem(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="button button-solid bg-rose-600 hover:bg-rose-500 border-rose-600 text-white"
                  onClick={handleExecuteDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
