import { getSupabaseClient } from './supabase';
import { MediaItem } from '../types/cms';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: string;
}

export function validateImageFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Type check
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const isSvg = fileType === 'image/svg+xml' || fileName.endsWith('.svg');
  const isJpg = fileType === 'image/jpeg' || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg');
  const isPng = fileType === 'image/png' || fileName.endsWith('.png');
  const isWebp = fileType === 'image/webp' || fileName.endsWith('.webp');

  if (!isSvg && !isJpg && !isPng && !isWebp) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type || 'unknown'}). Only JPG, PNG, WebP, and SVG files are accepted.`,
    };
  }

  // Size check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeInMb}MB) exceeds the maximum allowed limit of 5MB.`,
    };
  }

  return {
    valid: true,
    mimeType: isSvg ? 'image/svg+xml' : isWebp ? 'image/webp' : isPng ? 'image/png' : 'image/jpeg',
  };
}

export async function validateImageUrl(
  rawUrl: string
): Promise<{ valid: boolean; width?: number; height?: number; error?: string }> {
  const url = rawUrl.trim();
  if (!url) {
    return { valid: false, error: 'Please enter an image URL.' };
  }

  if (!url.startsWith('https://')) {
    return {
      valid: false,
      error: 'Image URL must use secure https:// protocol.',
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      img.src = '';
      resolve({
        valid: false,
        error: 'Image timed out while loading. Please verify that the URL is public and CORS-accessible.',
      });
    }, 9000);

    img.onload = () => {
      clearTimeout(timeout);
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        resolve({
          valid: true,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      } else {
        resolve({
          valid: false,
          error: 'The URL loaded but did not contain valid image dimensions.',
        });
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve({
        valid: false,
        error: 'Unable to load image from this URL. Please verify the link is a direct image resource.',
      });
    };

    img.src = url;
  });
}

/**
 * Client-side compression and resizing for raster images
 * Preserves SVG in original vector format
 */
export async function compressAndResizeImage(
  file: File,
  maxDimension = 1920,
  quality = 0.85
): Promise<{ blob: Blob; width: number; height: number; filename: string }> {
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  if (isSvg) {
    return {
      blob: file,
      width: 0,
      height: 0,
      filename: file.name,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file for processing'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image bitmap'));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Resize down if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ blob: file, width, height, filename: file.name });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP if possible, fallback to JPEG
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ blob: file, width, height, filename: file.name });
              return;
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            resolve({
              blob,
              width,
              height,
              filename: cleanName,
            });
          },
          'image/webp',
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Stores uploaded file in Supabase Storage bucket 'media'
 * or falls back to in-browser data URI if remote Supabase is offline
 */
export async function uploadMediaFile(
  file: File,
  altText: string,
  spot: MediaItem['assigned_spot'] = 'unassigned',
  assignedId?: string,
  assignedLabel?: string
): Promise<MediaItem> {
  const { blob, width, height, filename } = await compressAndResizeImage(file);
  const client = getSupabaseClient();
  const timestamp = Date.now();
  const sanitizedName = filename.toLowerCase().replace(/[^a-z0-9.]/g, '-');
  const storagePath = `uploads/${timestamp}_${sanitizedName}`;

  let finalUrl = '';
  let storedInStorage = false;

  if (client) {
    try {
      const { data: uploadData, error: uploadError } = await client.storage
        .from('media')
        .upload(storagePath, blob, {
          contentType: blob.type || file.type || 'image/jpeg',
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: pubData } = client.storage.from('media').getPublicUrl(storagePath);
        if (pubData?.publicUrl) {
          finalUrl = pubData.publicUrl;
          storedInStorage = true;
        }
      } else {
        console.warn('[GhreatnessLabs] Supabase Storage upload skipped/failed, using fallback:', uploadError);
      }
    } catch (storageErr) {
      console.warn('[GhreatnessLabs] Storage exception, falling back to data URL:', storageErr);
    }
  }

  // Fallback to Data URL for instant preview & offline persistence
  if (!finalUrl) {
    finalUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  const mediaItem: MediaItem = {
    id: `media-${timestamp}-${Math.random().toString(36).substring(2, 7)}`,
    url: finalUrl,
    storage_path: storedInStorage ? storagePath : undefined,
    filename,
    alt_text: altText.trim() || filename,
    assigned_spot: spot,
    assigned_id: assignedId,
    assigned_label: assignedLabel,
    source: 'upload',
    mime_type: blob.type || file.type,
    size_bytes: blob.size,
    width: width || undefined,
    height: height || undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return mediaItem;
}

/**
 * Creates a MediaItem record from a verified external URL
 */
export async function createMediaItemFromUrl(
  url: string,
  altText: string,
  spot: MediaItem['assigned_spot'] = 'unassigned',
  assignedId?: string,
  assignedLabel?: string
): Promise<MediaItem> {
  const validation = await validateImageUrl(url);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image URL');
  }

  // Derive friendly filename from URL
  let filename = 'external-image.jpg';
  try {
    const urlObj = new URL(url);
    const pathnameParts = urlObj.pathname.split('/');
    const lastPart = pathnameParts[pathnameParts.length - 1];
    if (lastPart && lastPart.includes('.')) {
      filename = decodeURIComponent(lastPart);
    } else {
      filename = `${urlObj.hostname}-asset.jpg`;
    }
  } catch {
    // Keep fallback
  }

  const timestamp = Date.now();
  const mediaItem: MediaItem = {
    id: `media-${timestamp}-${Math.random().toString(36).substring(2, 7)}`,
    url: url.trim(),
    filename,
    alt_text: altText.trim() || filename,
    assigned_spot: spot,
    assigned_id: assignedId,
    assigned_label: assignedLabel,
    source: 'url',
    width: validation.width,
    height: validation.height,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return mediaItem;
}

/**
 * Deletes an uploaded file from Supabase Storage bucket
 */
export async function deleteStoredFile(storagePath?: string): Promise<boolean> {
  if (!storagePath) return true;
  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { error } = await client.storage.from('media').remove([storagePath]);
    if (error) {
      console.warn('[GhreatnessLabs] Failed to delete file from storage bucket:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[GhreatnessLabs] Storage delete exception:', err);
    return false;
  }
}
