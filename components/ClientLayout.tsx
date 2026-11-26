"use client";

import { useState } from "react";
import SiteFooter from "@/components/site/SiteFooter";
import CookieConsent from "./CookieConsent";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showCookieSettings, setShowCookieSettings] = useState(false);

  const handleOpenCookieSettings = () => {
    // Prefer Google's Funding Choices CMP revocation UI when it's present
    // (enabled in the AdSense Privacy & messaging dashboard after approval).
    // Falls back to the site's own cookie banner otherwise — harmless either way.
    const fc = (window as unknown as {
      googlefc?: { showRevocationMessage?: () => void };
    }).googlefc;
    if (typeof fc?.showRevocationMessage === 'function') {
      fc.showRevocationMessage();
      return;
    }
    setShowCookieSettings(true);
  };

  const handleCloseCookieSettings = () => {
    setShowCookieSettings(false);
  };

  return (
    <>
      {children}
      <SiteFooter onOpenCookieSettings={handleOpenCookieSettings} />
      <CookieConsent isOpen={showCookieSettings} onClose={handleCloseCookieSettings} />
    </>
  );
}
