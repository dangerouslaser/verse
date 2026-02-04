/**
 * Utilities for handling Kodi image URLs
 */

import type { KodiArt } from '@/api/types/common';

/**
 * Get the base URL for Kodi instance
 */
export function getKodiBaseUrl(): string {
  // In development, use proxy via Vite
  if (import.meta.env.DEV) {
    return '';
  }
  // In production, use the current origin
  return window.location.origin;
}

/**
 * Convert Kodi image path to full URL
 * Kodi returns images in the format: image://encoded_path/
 */
export function getImageUrl(imagePath?: string): string | undefined {
  if (!imagePath) {
    return undefined;
  }

  // If it's already a full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Kodi image paths start with 'image://'
  // These need to be URL-encoded (including the image:// prefix) for Kodi's /image endpoint
  if (imagePath.startsWith('image://')) {
    const baseUrl = getKodiBaseUrl();
    const encodedPath = encodeURIComponent(imagePath);
    return `${baseUrl}/image/${encodedPath}`;
  }

  // If it's a local path, encode it with image:// prefix
  const baseUrl = getKodiBaseUrl();
  const fullPath = `image://${encodeURIComponent(imagePath)}`;
  const encodedPath = encodeURIComponent(fullPath);
  return `${baseUrl}/image/${encodedPath}`;
}

/**
 * Get the best poster image from art object
 */
export function getPosterUrl(art?: KodiArt): string | undefined {
  if (!art) {
    return undefined;
  }

  // Try different poster types in order of preference
  return (
    getImageUrl(art.poster) ||
    getImageUrl(art.thumb) ||
    getImageUrl(art.icon) ||
    undefined
  );
}

/**
 * Get the best fanart/backdrop image from art object
 */
export function getFanartUrl(art?: KodiArt): string | undefined {
  if (!art) {
    return undefined;
  }

  return (
    getImageUrl(art.fanart) ||
    getImageUrl(art.landscape) ||
    getImageUrl(art.banner) ||
    undefined
  );
}

/**
 * Get the best thumbnail image from art object
 */
export function getThumbUrl(art?: KodiArt): string | undefined {
  if (!art) {
    return undefined;
  }

  return (
    getImageUrl(art.thumb) ||
    getImageUrl(art.poster) ||
    getImageUrl(art.icon) ||
    undefined
  );
}

/**
 * Get the clearlogo image from art object
 */
export function getClearLogoUrl(art?: KodiArt): string | undefined {
  if (!art) {
    return undefined;
  }

  return getImageUrl(art.clearlogo) || getImageUrl(art.clearart) || undefined;
}

/**
 * Generate a placeholder image URL for when images fail to load
 */
export function getPlaceholderUrl(type: 'poster' | 'fanart' | 'thumb' = 'poster'): string {
  // Return a data URI with a simple gradient
  const colors: Record<string, string> = {
    poster: 'rgb(30,30,40)',
    fanart: 'rgb(20,20,30)',
    thumb: 'rgb(25,25,35)',
  };

  const color = colors[type];
  // Simple SVG placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="400" height="600" fill="${color}"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
