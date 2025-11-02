"use client";

import { useState, useEffect } from "react";
import {
  hasConsent,
  acceptAllCookies,
  rejectOptionalCookies,
  saveCookiePreferences,
  getCookiePreferences,
  initializeConsent,
  type CookiePreferences,
} from "@/lib/utils/cookie-consent";

interface CookieConsentProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CookieConsent({ isOpen: externalIsOpen, onClose }: CookieConsentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    functional: true,
    analytics: false,
    advertising: false,
    timestamp: Date.now(),
  });

  useEffect(() => {
    // Initialize consent system
    initializeConsent();

    // Check if user has already consented
    if (!hasConsent()) {
      setIsOpen(true);
    }

    // Load existing preferences if any
    const existing = getCookiePreferences();
    if (existing) {
      setPreferences(existing);
    }
  }, []);

  // Support external control of the banner
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setIsOpen(false);
    onClose?.();
  };

  const handleRejectOptional = () => {
    rejectOptionalCookies();
    setIsOpen(false);
    onClose?.();
  };

  const handleSavePreferences = () => {
    saveCookiePreferences(preferences);
    setIsOpen(false);
    setShowPreferences(false);
    onClose?.();
  };

  const handleManagePreferences = () => {
    setShowPreferences(true);
  };

  const handleBack = () => {
    setShowPreferences(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full transform transition-all">
        {!showPreferences ? (
          /* Main Cookie Banner */
          <div className="p-6 md:p-8">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="w-8 h-8 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  We Value Your Privacy
                </h2>
                <div className="text-gray-700 space-y-2 text-sm">
                  <p>
                    Subway Sounds uses cookies and similar technologies to enhance your browsing
                    experience, provide personalized content, and analyze our traffic.
                  </p>
                  <p>
                    We use Google Analytics to understand how visitors use our site and Google
                    AdSense to display relevant advertisements. Some ads may be personalized based
                    on your browsing activity.
                  </p>
                  <p>
                    You can manage your preferences at any time. For more information, please read
                    our{" "}
                    <a href="/privacy-policy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAcceptAll}
                className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectOptional}
                className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Reject Optional
              </button>
              <button
                onClick={handleManagePreferences}
                className="flex-1 border-2 border-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:border-gray-400 transition-colors"
              >
                Manage Preferences
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-500 text-center">
              By clicking "Accept All", you consent to the use of all cookies.
            </p>
          </div>
        ) : (
          /* Preferences Panel */
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Cookie Preferences</h2>
              <button
                onClick={handleBack}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Go back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Functional Cookies - Always Required */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-semibold text-gray-900">Functional Cookies</h3>
                      <span className="ml-2 text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded">
                        Always Active
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Essential cookies required for the website to function properly. These cannot
                      be disabled.
                    </p>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Analytics Cookies</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Help us understand how visitors use our website through Google Analytics. This
                      data is used to improve the site experience.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, analytics: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Advertising Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Advertising Cookies</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Used by Google AdSense to display personalized advertisements based on your
                      interests and previous visits. You can opt out via{" "}
                      <a
                        href="https://adssettings.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Google Ads Settings
                      </a>
                      .
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.advertising}
                      onChange={(e) =>
                        setPreferences({ ...preferences, advertising: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSavePreferences}
                className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={handleBack}
                className="flex-1 border-2 border-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
