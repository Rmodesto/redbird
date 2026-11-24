import { LegalLayout } from "redbird";

/** The privacy policy page shell: title card, Last Updated line, body card. */
export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="March 14, 2026">
      <p>
        Subway Sounds Media LLC operates subwaysounds.net. This policy explains what we collect
        when you look up a station or play a platform recording.
      </p>

      <h2>Information We Collect</h2>
      <p>
        We do not ask you to create an account. We collect only limited technical information:
      </p>
      <ul>
        <li>Pages you visit, such as <code>/station/times-sq-42-st</code></li>
        <li>Approximate location, from IP address at city level only</li>
        <li>Browser, device type, and referring site</li>
      </ul>
      <p>
        Turn off personalized ads in <a href="/cookie-preferences">Cookie Preferences</a>.
      </p>
    </LegalLayout>
  );
}

/** Terms of service — same shell, with an h3 subhead and a numbered list. */
export function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="January 8, 2026">
      <p>
        By using subwaysounds.net you agree to these terms. If you do not agree, please do not use
        the site.
      </p>

      <h2>Accuracy of Transit Information</h2>
      <p>
        Arrival times, service alerts, and elevator status come from public MTA feeds and can be
        delayed or wrong. <strong>Do not rely on this site for time-critical travel.</strong>{" "}
        Confirm with station signage or mta.info.
      </p>

      <h3>Permitted Use</h3>
      <ol>
        <li>You may browse, link to, and quote pages with attribution.</li>
        <li>Platform recordings are licensed for personal listening only.</li>
      </ol>
    </LegalLayout>
  );
}

/** `lastUpdated` is optional — the date line is simply omitted. */
export function WithoutLastUpdated() {
  return (
    <LegalLayout title="Accessibility Statement">
      <p>
        We aim to meet WCAG 2.1 AA across subwaysounds.net. Station pages are navigable by
        keyboard, line bullets carry text alternatives, and every audio clip ships with a written
        description of what you are hearing.
      </p>
      <h2>Known Gaps</h2>
      <ul>
        <li>The interactive subway map is not yet keyboard-navigable.</li>
        <li>Some older platform recordings lack transcripts.</li>
      </ul>
      <p>
        Report a barrier at <a href="mailto:info@subwaysounds.net">info@subwaysounds.net</a>.
      </p>
    </LegalLayout>
  );
}
