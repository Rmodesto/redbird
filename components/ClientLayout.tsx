"use client";

import { useState } from "react";
import SiteFooter from "@/components/site/SiteFooter";
import CookieConsent from "./CookieConsent";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showCookieSettings, setShowCookieSettings] = useState(false);

  const handleOpenCookieSettings = () => {
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
