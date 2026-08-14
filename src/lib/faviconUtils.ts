import { useEffect } from 'react';

export const DEFAULT_FAVICON_URL = '/rakomart-official-logo.jpg';
export const FIXED_SEO_TITLE = 'RakoMart - Choose Better, Choose RakoMart';
export const FIXED_SEO_DESCRIPTION = "At RakoMart, we don't just sell products — we curate better choices for your lifestyle. From daily essentials to authentic skincare, we are committed to superior quality and a seamless shopping experience.";

/**
 * Dynamically updates the HTML head favicon links
 * with cache-busting version parameter and ensures fixed SEO title is maintained.
 */
export function updateDOMFavicon(faviconUrl?: string, faviconUpdatedAt?: number) {
  // Ensure the fixed production title is always maintained
  if (typeof document !== 'undefined' && document.title !== FIXED_SEO_TITLE) {
    document.title = FIXED_SEO_TITLE;
  }

  const urlToUse = faviconUrl && faviconUrl.trim() !== '' ? faviconUrl : DEFAULT_FAVICON_URL;
  const v = faviconUpdatedAt || 1;
  const isDataUrl = urlToUse.startsWith('data:');
  const finalHref = isDataUrl ? urlToUse : `${urlToUse}${urlToUse.includes('?') ? '&' : '?'}v=${v}`;

  // 1. Primary Favicon Link
  let linkIcon = document.getElementById('app-favicon') as HTMLLinkElement | null;
  if (!linkIcon) {
    linkIcon = document.createElement('link');
    linkIcon.id = 'app-favicon';
    linkIcon.rel = 'icon';
    document.head.appendChild(linkIcon);
  }

  if (urlToUse.endsWith('.svg') || urlToUse.startsWith('data:image/svg+xml')) {
    linkIcon.type = 'image/svg+xml';
  } else if (urlToUse.endsWith('.ico') || urlToUse.startsWith('data:image/x-icon') || urlToUse.startsWith('data:image/vnd.microsoft.icon')) {
    linkIcon.type = 'image/x-icon';
  } else {
    linkIcon.type = 'image/png';
  }
  linkIcon.href = finalHref;

  // 2. Shortcut Icon Link
  let linkShortcut = document.getElementById('app-shortcut-favicon') as HTMLLinkElement | null;
  if (!linkShortcut) {
    linkShortcut = document.createElement('link');
    linkShortcut.id = 'app-shortcut-favicon';
    linkShortcut.rel = 'shortcut icon';
    document.head.appendChild(linkShortcut);
  }
  linkShortcut.href = finalHref;

  // 3. Apple Touch Icon Link (Used by Google mobile and Apple devices as site icon)
  let linkApple = document.getElementById('app-apple-touch-icon') as HTMLLinkElement | null;
  if (!linkApple) {
    linkApple = document.createElement('link');
    linkApple.id = 'app-apple-touch-icon';
    linkApple.rel = 'apple-touch-icon';
    document.head.appendChild(linkApple);
  }
  linkApple.href = finalHref;
}

/**
 * React hook to synchronize document favicon with Cloud Firestore settings
 */
export function useFavicon(faviconUrl?: string, faviconUpdatedAt?: number) {
  useEffect(() => {
    updateDOMFavicon(faviconUrl, faviconUpdatedAt);
  }, [faviconUrl, faviconUpdatedAt]);
}
