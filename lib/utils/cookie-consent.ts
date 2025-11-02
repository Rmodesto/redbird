/**
 * Cookie Consent Management Utilities
 * Handles GDPR/CCPA compliant cookie preferences
 */

export type CookiePreferences = {
  functional: boolean; // Always true (required)
  analytics: boolean;
  advertising: boolean;
  timestamp: number;
};

const CONSENT_KEY = 'subway-sounds-cookie-consent';
const CONSENT_VERSION = '1.0';

/**
 * Get current cookie preferences from localStorage
 */
export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);
    if (data.version !== CONSENT_VERSION) return null;

    return data.preferences;
  } catch (error) {
    console.error('Error reading cookie preferences:', error);
    return null;
  }
}

/**
 * Save cookie preferences to localStorage
 */
export function saveCookiePreferences(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return;

  try {
    const data = {
      version: CONSENT_VERSION,
      preferences: {
        ...preferences,
        functional: true, // Always true
        timestamp: Date.now(),
      },
    };

    localStorage.setItem(CONSENT_KEY, JSON.stringify(data));

    // Apply preferences immediately
    applyConsent(preferences);
  } catch (error) {
    console.error('Error saving cookie preferences:', error);
  }
}

/**
 * Check if user has made a consent choice
 */
export function hasConsent(): boolean {
  return getCookiePreferences() !== null;
}

/**
 * Accept all cookies
 */
export function acceptAllCookies(): void {
  saveCookiePreferences({
    functional: true,
    analytics: true,
    advertising: true,
    timestamp: Date.now(),
  });
}

/**
 * Reject optional cookies (analytics & advertising)
 */
export function rejectOptionalCookies(): void {
  saveCookiePreferences({
    functional: true,
    analytics: false,
    advertising: false,
    timestamp: Date.now(),
  });
}

/**
 * Clear all consent preferences
 */
export function clearConsent(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONSENT_KEY);
}

/**
 * Apply consent preferences to tracking scripts
 */
function applyConsent(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return;

  // Google Analytics consent mode
  if (typeof window.gtag !== 'undefined') {
    window.gtag('consent', 'update', {
      analytics_storage: preferences.analytics ? 'granted' : 'denied',
      ad_storage: preferences.advertising ? 'granted' : 'denied',
      ad_user_data: preferences.advertising ? 'granted' : 'denied',
      ad_personalization: preferences.advertising ? 'granted' : 'denied',
    });
  }

  // Dispatch custom event for other scripts to listen to
  window.dispatchEvent(
    new CustomEvent('cookieConsentUpdated', { detail: preferences })
  );
}

/**
 * Initialize consent on page load
 */
export function initializeConsent(): void {
  const preferences = getCookiePreferences();

  if (preferences) {
    applyConsent(preferences);
  } else {
    // Default: deny all until user consents
    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }
  }
}

// Type declaration for window.gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params: Record<string, string>
    ) => void;
  }
}
