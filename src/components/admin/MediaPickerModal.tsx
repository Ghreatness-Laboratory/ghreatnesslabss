import React, { useState, useRef } from 'react';
import {
  X,
  Search,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { uploadMediaFile, validateImageFile } from '../../lib/mediaStorage';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
  currentUrl?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Media Image',
  currentUrl = '',
}: MediaPickerModalProps) {
  const { data, saveRecord, notify } = useCms();
  const mediaItems = data.media || [];

  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrl, setSelectedUrl] = useState(currentUrl);
  const [directUrlInput, setDirectUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredItems = mediaItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.filename.toLowerCase().includes(q) ||
      (item.alt_text && item.alt_text.toLowerCase().includes(q)) ||
      item.url.toLowerCase().includes(q)
    );
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid image file.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const newMedia = await uploadMediaFile(
        file,
        file.name.replace(/\.[^/.]+$/, ''),
        'unassigned'
      );
      await saveRecord('media', newMedia);
      setSelectedUrl(newMedia.url);
      setActiveTab('library');
      notify(`Uploaded "${file.name}" to media library!`, 'success');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (!directUrlInput.trim()) return;
    setSelectedUrl(directUrlInput.trim());
    onSelect(directUrlInput.trim());
    onClose();
  };

  const handleConfirmSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-heading"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <ImageIcon size={16} />
            </div>
            <h2 id="media-picker-heading" className="text-base font-semibold text-neutral-900 m-0">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Segmented Mode Selector */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 pt-3 gap-2">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'library'
                ? 'border-neutral-900 text-neutral-900 bg-white rounded-t-lg'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
            onClick={() => setActiveTab('library')}
          >
            Media Library ({mediaItems.length})
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-neutral-900 text-neutral-900 bg-white rounded-t-lg'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
            onClick={() => setActiveTab('upload')}
          >
            Upload New File
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'url'
                ? 'border-neutral-900 text-neutral-900 bg-white rounded-t-lg'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
            onClick={() => setActiveTab('url')}
          >
            Paste Direct URL
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[320px]">
          {activeTab === 'library' && (
            <div>
              {/* Search input */}
              <div className="relative mb-4">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="text"
                  placeholder="Search media by filename, alt text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <ImageIcon size={32} className="mx-auto mb-2 text-neutral-400" />
                  <p className="text-sm">No media items found in library.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="mt-3 text-xs font-semibold underline text-neutral-900 hover:text-neutral-700"
                  >
                    Upload an image now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredItems.map((item) => {
                    const isSelected = selectedUrl === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedUrl(item.url)}
                        className={`group relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all aspect-video flex items-center justify-center bg-neutral-100 ${
                          isSelected
                            ? 'border-neutral-900 ring-2 ring-neutral-900/20'
                            : 'border-transparent hover:border-neutral-300'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.alt_text || item.filename}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-neutral-900 text-white rounded-full p-1 shadow">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[11px] text-white font-medium truncate m-0">
                            {item.filename}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-2xl p-8 text-center bg-neutral-50/50">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 mb-3">
                <Upload size={22} />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 m-0 mb-1">
                Upload image from computer
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                Supports JPG, PNG, WEBP, and SVG formats up to 10MB.
              </p>
              {uploadError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg mb-3">
                  <AlertTriangle size={14} />
                  <span>{uploadError}</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="media-picker-file-input"
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Browse files'}
              </button>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="max-w-md mx-auto py-6">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                External Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/cover-image.jpg"
                  value={directUrlInput}
                  onChange={(e) => setDirectUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Use URL
                </button>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Ensure the image link starts with https:// for production reliability.
              </p>
            </div>
          )}
        </div>

        {/* Footer with Selected Preview & Confirm */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-3 overflow-hidden max-w-sm">
            {selectedUrl ? (
              <>
                <img
                  src={selectedUrl}
                  alt="Selected preview"
                  className="w-10 h-10 object-cover rounded-lg border border-neutral-200 shrink-0"
                />
                <span className="text-xs text-neutral-600 truncate font-mono">{selectedUrl}</span>
              </>
            ) : (
              <span className="text-xs text-neutral-400">No image selected</span>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 border border-neutral-300 rounded-lg hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedUrl}
              onClick={handleConfirmSelect}
              className="px-5 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-40 transition-colors"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
