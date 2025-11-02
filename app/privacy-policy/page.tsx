import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import LegalLayout from "@/components/ui/LegalLayout";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = generatePageMetadata(
  "Privacy Policy - Subway Sounds",
  "Privacy Policy for Subway Sounds NYC. Learn how we collect, use, and protect your data, and your rights under GDPR and CCPA.",
  ["privacy policy", "GDPR", "CCPA", "data protection", "cookie policy"]
);

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navigation />
      <LegalLayout title="Privacy Policy" lastUpdated="October 22, 2025">
        <h2>1. Introduction</h2>
        <p>
          Welcome to Subway Sounds ("we," "our," or "us"). This Privacy Policy explains how Subway
          Sounds Media LLC collects, uses, discloses, and protects your information when you visit
          our website at subwaysounds.net (the "Site").
        </p>
        <p>
          By using our Site, you agree to the collection and use of information in accordance with
          this Privacy Policy. If you do not agree with our policies and practices, please do not
          use our Site.
        </p>

        <h2>2. Information We Collect</h2>

        <h3>2.1 Information You Provide</h3>
        <p>We may collect the following information when you contact us or use our services:</p>
        <ul>
          <li>
            <strong>Contact Information:</strong> Name, email address, and message content when you
            submit our contact form
          </li>
          <li>
            <strong>Voluntary Information:</strong> Any other information you choose to provide to
            us
          </li>
        </ul>

        <h3>2.2 Automatically Collected Information</h3>
        <p>When you visit our Site, we automatically collect certain information, including:</p>
        <ul>
          <li>
            <strong>Usage Data:</strong> Pages visited, time spent on pages, links clicked, and
            other diagnostic data
          </li>
          <li>
            <strong>Device Information:</strong> Browser type, operating system, IP address, and
            device identifiers
          </li>
          <li>
            <strong>Location Data:</strong> Approximate geographic location based on IP address
          </li>
        </ul>

        <h3>2.3 Cookies and Tracking Technologies</h3>
        <p>
          We use cookies and similar tracking technologies to enhance your browsing experience and
          analyze site usage. These include:
        </p>
        <ul>
          <li>
            <strong>Essential Cookies:</strong> Required for the Site to function properly
          </li>
          <li>
            <strong>Analytics Cookies:</strong> Google Analytics to understand how visitors use our
            Site
          </li>
          <li>
            <strong>Advertising Cookies:</strong> Google AdSense to display relevant advertisements
          </li>
        </ul>

        <h2>3. Google AdSense and Third-Party Advertising</h2>
        <p>
          <strong>We display Google AdSense advertisements on our Site.</strong> Google, as a
          third-party vendor, uses cookies to serve ads on our Site based on your prior visits to
          our Site or other websites.
        </p>
        <p>
          Google's use of advertising cookies enables it and its partners to serve ads to you based
          on your visit to our Site and/or other sites on the Internet.
        </p>
        <p>
          You may opt out of personalized advertising by visiting{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Settings
          </a>
          . Alternatively, you can opt out of third-party vendor use of cookies for personalized
          advertising by visiting{" "}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
            www.aboutads.info
          </a>
          .
        </p>

        <h2>4. How We Use Your Information</h2>
        <p>We use the collected information for the following purposes:</p>
        <ul>
          <li>To provide and maintain our Site</li>
          <li>To respond to your inquiries and support requests</li>
          <li>To analyze usage patterns and improve our services</li>
          <li>To display personalized advertisements through Google AdSense</li>
          <li>To comply with legal obligations</li>
          <li>To detect, prevent, and address technical issues</li>
        </ul>

        <h2>5. Affiliate Links</h2>
        <p>
          <strong>This website may contain affiliate links.</strong> When you click on these links
          and make a purchase, we may earn a commission at no additional cost to you. These
          affiliate relationships do not influence our content or recommendations.
        </p>

        <h2>6. Google Analytics</h2>
        <p>
          We use Google Analytics to collect information about how visitors use our Site. Google
          Analytics uses cookies to collect information such as how often users visit the Site,
          what pages they visit, and what other sites they used prior to coming to our Site.
        </p>
        <p>
          We use the information from Google Analytics to improve our Site. Google's ability to use
          and share information collected by Google Analytics is restricted by the{" "}
          <a
            href="https://www.google.com/analytics/terms/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Analytics Terms of Service
          </a>{" "}
          and the{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Privacy Policy
          </a>
          .
        </p>

        <h2>7. Data Sharing and Disclosure</h2>
        <p>We do not sell your personal information. We may share your information with:</p>
        <ul>
          <li>
            <strong>Service Providers:</strong> Third-party vendors who perform services on our
            behalf (Google Analytics, Google AdSense)
          </li>
          <li>
            <strong>Legal Compliance:</strong> When required by law or to protect our rights and
            safety
          </li>
          <li>
            <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale
            of assets
          </li>
        </ul>

        <h2>8. Data Retention</h2>
        <p>
          We retain your personal information only for as long as necessary to fulfill the purposes
          outlined in this Privacy Policy. Usage data is typically retained for a shorter period,
          except when used for security or legal compliance purposes.
        </p>

        <h2>9. Your Rights and Choices</h2>

        <h3>9.1 GDPR Rights (European Users)</h3>
        <p>If you are in the European Economic Area (EEA), you have the following rights:</p>
        <ul>
          <li>
            <strong>Right to Access:</strong> Request access to your personal data
          </li>
          <li>
            <strong>Right to Rectification:</strong> Request correction of inaccurate data
          </li>
          <li>
            <strong>Right to Erasure:</strong> Request deletion of your personal data
          </li>
          <li>
            <strong>Right to Restrict Processing:</strong> Request limitation of processing
          </li>
          <li>
            <strong>Right to Data Portability:</strong> Receive your data in a portable format
          </li>
          <li>
            <strong>Right to Object:</strong> Object to processing of your data
          </li>
          <li>
            <strong>Right to Withdraw Consent:</strong> Withdraw consent at any time
          </li>
        </ul>

        <h3>9.2 CCPA Rights (California Users)</h3>
        <p>If you are a California resident, you have the following rights under the CCPA:</p>
        <ul>
          <li>
            <strong>Right to Know:</strong> Request disclosure of personal information collected
          </li>
          <li>
            <strong>Right to Delete:</strong> Request deletion of personal information
          </li>
          <li>
            <strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information (we do
            not sell personal information)
          </li>
          <li>
            <strong>Right to Non-Discrimination:</strong> Not be discriminated against for
            exercising your rights
          </li>
        </ul>

        <h3>9.3 Cookie Preferences</h3>
        <p>
          You can manage your cookie preferences at any time by clicking "Cookie Preferences" in
          the footer of our Site. You can also configure your browser to refuse all cookies or to
          indicate when a cookie is being sent.
        </p>

        <h2>10. Data Security</h2>
        <p>
          We implement appropriate technical and organizational security measures to protect your
          personal information from unauthorized access, alteration, disclosure, or destruction.
          However, no method of transmission over the Internet is 100% secure.
        </p>

        <h2>11. Children's Privacy</h2>
        <p>
          Our Site is not intended for children under the age of 13. We do not knowingly collect
          personal information from children under 13. If you are a parent or guardian and believe
          your child has provided us with personal information, please contact us.
        </p>

        <h2>12. Third-Party Links</h2>
        <p>
          Our Site may contain links to third-party websites. We are not responsible for the
          privacy practices of these external sites. We encourage you to read their privacy
          policies.
        </p>

        <h2>13. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by
          posting the new Privacy Policy on this page and updating the "Last Updated" date. You are
          advised to review this Privacy Policy periodically for any changes.
        </p>

        <h2>14. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or wish to exercise your data rights,
          please contact us:
        </p>
        <p>
          <strong>Subway Sounds Media LLC</strong>
          <br />
          Email: <a href="mailto:info@subwaysounds.net">info@subwaysounds.net</a>
          <br />
          Location: New York City, USA
        </p>

        <h2>15. Consent</h2>
        <p>
          By using our Site, you consent to our Privacy Policy and agree to its terms. Your
          continued use of the Site following the posting of changes constitutes your acceptance of
          such changes.
        </p>
      </LegalLayout>
    </>
  );
}
