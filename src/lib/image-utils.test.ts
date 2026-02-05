import { describe, it, expect } from 'vitest';
import {
  getKodiBaseUrl,
  getImageUrl,
  getPosterUrl,
  getFanartUrl,
  getThumbUrl,
  getThumbnailUrl,
  getClearLogoUrl,
  getPlaceholderUrl,
} from './image-utils';
import type { KodiArt } from '@/api/types/common';

describe('getKodiBaseUrl', () => {
  it('returns empty string in dev mode', () => {
    const result = getKodiBaseUrl();
    expect(result).toBe('');
  });
});

describe('getImageUrl', () => {
  it('returns undefined for empty path', () => {
    expect(getImageUrl()).toBeUndefined();
    expect(getImageUrl('')).toBeUndefined();
  });

  it('returns full URL unchanged', () => {
    expect(getImageUrl('http://example.com/image.jpg')).toBe('http://example.com/image.jpg');
    expect(getImageUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
  });

  it('encodes Kodi image paths', () => {
    const result = getImageUrl('image://path/to/image/');
    expect(result).toContain('/image/');
    expect(result).toContain(encodeURIComponent('image://path/to/image/'));
  });

  it('encodes local paths with image:// prefix', () => {
    const result = getImageUrl('/local/path/image.jpg');
    expect(result).toContain('/image/');
  });
});

describe('getPosterUrl', () => {
  it('returns undefined for missing art', () => {
    expect(getPosterUrl()).toBeUndefined();
  });

  it('prefers poster over other types', () => {
    const art: KodiArt = {
      poster: 'image://poster/',
      thumb: 'image://thumb/',
      icon: 'image://icon/',
    };
    const result = getPosterUrl(art);
    expect(result).toContain(encodeURIComponent('image://poster/'));
  });

  it('falls back to thumb if no poster', () => {
    const art: KodiArt = {
      thumb: 'image://thumb/',
      icon: 'image://icon/',
    };
    const result = getPosterUrl(art);
    expect(result).toContain(encodeURIComponent('image://thumb/'));
  });

  it('falls back to icon if no poster or thumb', () => {
    const art: KodiArt = {
      icon: 'image://icon/',
    };
    const result = getPosterUrl(art);
    expect(result).toContain(encodeURIComponent('image://icon/'));
  });
});

describe('getFanartUrl', () => {
  it('returns undefined for missing art', () => {
    expect(getFanartUrl()).toBeUndefined();
  });

  it('prefers fanart over other types', () => {
    const art: KodiArt = {
      fanart: 'image://fanart/',
      landscape: 'image://landscape/',
      banner: 'image://banner/',
    };
    const result = getFanartUrl(art);
    expect(result).toContain(encodeURIComponent('image://fanart/'));
  });

  it('falls back to landscape if no fanart', () => {
    const art: KodiArt = {
      landscape: 'image://landscape/',
      banner: 'image://banner/',
    };
    const result = getFanartUrl(art);
    expect(result).toContain(encodeURIComponent('image://landscape/'));
  });
});

describe('getThumbUrl', () => {
  it('returns undefined for missing art', () => {
    expect(getThumbUrl()).toBeUndefined();
  });

  it('prefers thumb over other types', () => {
    const art: KodiArt = {
      thumb: 'image://thumb/',
      poster: 'image://poster/',
      icon: 'image://icon/',
    };
    const result = getThumbUrl(art);
    expect(result).toContain(encodeURIComponent('image://thumb/'));
  });
});

describe('getThumbnailUrl', () => {
  it('is an alias for getThumbUrl', () => {
    const art: KodiArt = {
      thumb: 'image://thumb/',
    };
    expect(getThumbnailUrl(art)).toBe(getThumbUrl(art));
  });
});

describe('getClearLogoUrl', () => {
  it('returns undefined for missing art', () => {
    expect(getClearLogoUrl()).toBeUndefined();
  });

  it('prefers clearlogo over clearart', () => {
    const art: KodiArt = {
      clearlogo: 'image://clearlogo/',
      clearart: 'image://clearart/',
    };
    const result = getClearLogoUrl(art);
    expect(result).toContain(encodeURIComponent('image://clearlogo/'));
  });

  it('falls back to clearart if no clearlogo', () => {
    const art: KodiArt = {
      clearart: 'image://clearart/',
    };
    const result = getClearLogoUrl(art);
    expect(result).toContain(encodeURIComponent('image://clearart/'));
  });
});

describe('getPlaceholderUrl', () => {
  it('returns data URI for poster type', () => {
    const result = getPlaceholderUrl('poster');
    expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
    // Decode and check the SVG contains the right color
    const base64Part = result.split(',')[1] ?? '';
    const decoded = atob(base64Part);
    expect(decoded).toContain('rgb(30,30,40)');
  });

  it('returns data URI for fanart type', () => {
    const result = getPlaceholderUrl('fanart');
    const base64Part = result.split(',')[1] ?? '';
    const decoded = atob(base64Part);
    expect(decoded).toContain('rgb(20,20,30)');
  });

  it('returns data URI for thumb type', () => {
    const result = getPlaceholderUrl('thumb');
    const base64Part = result.split(',')[1] ?? '';
    const decoded = atob(base64Part);
    expect(decoded).toContain('rgb(25,25,35)');
  });

  it('defaults to poster type', () => {
    const result = getPlaceholderUrl();
    const base64Part = result.split(',')[1] ?? '';
    const decoded = atob(base64Part);
    expect(decoded).toContain('rgb(30,30,40)');
  });
});
