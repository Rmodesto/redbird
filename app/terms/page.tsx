import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import LegalLayout from "@/components/ui/LegalLayout";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = generatePageMetadata(
  "Terms of Service - Subway Sounds",
  "Terms of Service for Subway Sounds NYC. Review the terms and conditions for using our NYC subway information and resources.",
  ["terms of service", "terms and conditions", "user agreement", "legal terms"]
);

export default function TermsPage() {
  return (
    <>
      <Navigation />
      <LegalLayout title="Terms of Service" lastUpdated="October 22, 2025">
        <h2>1. Agreement to Terms</h2>
        <p>
          Welcome to Subway Sounds ("we," "our," or "us"). These Terms of Service ("Terms")
          govern your access to and use of the Subway Sounds website located at subwaysounds.net
          (the "Site"), operated by Subway Sounds Media LLC, a company based in New York City, USA.
        </p>
        <p>
          By accessing or using our Site, you agree to be bound by these Terms. If you do not agree
          to these Terms, please do not use our Site.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Subway Sounds is an informational website that provides comprehensive information about
          the New York City subway system, including but not limited to:
        </p>
        <ul>
          <li>Real-time train arrival information</li>
          <li>Subway station details, amenities, and accessibility information</li>
          <li>Interactive subway maps</li>
          <li>Subway sounds and audio recordings</li>
          <li>Cultural references to the NYC subway in media and arts</li>
          <li>Historical and educational content about the NYC transit system</li>
        </ul>
        <p>
          The Site is intended for informational and educational purposes only. We are not
          affiliated with the Metropolitan Transportation Authority (MTA) or any government agency.
        </p>

        <h2>3. Intellectual Property Rights</h2>

        <h3>3.1 Our Content</h3>
        <p>
          The Site and its original content, features, and functionality are owned by Subway Sounds
          Media LLC and are protected by international copyright, trademark, patent, trade secret,
          and other intellectual property laws.
        </p>

        <h3>3.2 Third-Party Content</h3>
        <p>
          Certain content on the Site, including but not limited to MTA data, subway maps, and
          transit information, is provided by the Metropolitan Transportation Authority and other
          third parties. This content remains the property of its respective owners and is used
          under applicable licenses and fair use provisions.
        </p>

        <h3>3.3 User Restrictions</h3>
        <p>You may not:</p>
        <ul>
          <li>Modify, copy, distribute, or create derivative works of our content</li>
          <li>Use automated systems (bots, scrapers) to access the Site without permission</li>
          <li>Remove copyright or proprietary notices from any content</li>
          <li>Attempt to reverse engineer any aspect of the Site</li>
          <li>Use the Site for any commercial purposes without our written consent</li>
        </ul>

        <h2>4. User Conduct</h2>
        <p>You agree to use the Site only for lawful purposes. You agree not to:</p>
        <ul>
          <li>Violate any local, state, national, or international law</li>
          <li>Infringe on the intellectual property rights of others</li>
          <li>Transmit any harmful code, viruses, or malicious software</li>
          <li>
            Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Site
          </li>
          <li>
            Impersonate any person or entity or falsely state or misrepresent your affiliation
          </li>
          <li>Interfere with or disrupt the Site or servers or networks connected to the Site</li>
        </ul>

        <h2>5. Disclaimer of Warranties</h2>
        <p>
          <strong>
            THE SITE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY
            KIND, EITHER EXPRESS OR IMPLIED.
          </strong>
        </p>
        <p>We do not warrant that:</p>
        <ul>
          <li>The Site will be available at all times or without interruption</li>
          <li>The information provided is accurate, complete, or current</li>
          <li>
            Real-time arrival information is accurate (delays and inaccuracies may occur due to MTA
            data feeds)
          </li>
          <li>The Site will be free of errors, viruses, or other harmful components</li>
          <li>Defects will be corrected</li>
        </ul>
        <p>
          <strong>
            You acknowledge that real-time transit data may be inaccurate or delayed. Always verify
            critical information with official MTA sources.
          </strong>
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, SUBWAY SOUNDS MEDIA LLC SHALL NOT BE LIABLE FOR
          ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
          PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE,
          GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM:
        </p>
        <ul>
          <li>Your use or inability to use the Site</li>
          <li>Any unauthorized access to or use of our servers</li>
          <li>Any interruption or cessation of transmission to or from the Site</li>
          <li>Any bugs, viruses, or similar harmful components</li>
          <li>Any errors or omissions in any content</li>
          <li>Reliance on inaccurate transit information</li>
          <li>Any third-party content or conduct on the Site</li>
        </ul>

        <h2>7. Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless Subway Sounds Media LLC and its
          officers, directors, employees, and agents from and against any claims, liabilities,
          damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in
          any way connected with:
        </p>
        <ul>
          <li>Your access to or use of the Site</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any third-party rights</li>
        </ul>

        <h2>8. Third-Party Services and Advertising</h2>

        <h3>8.1 Google AdSense</h3>
        <p>
          This Site displays advertisements served by Google AdSense. Google uses cookies to serve
          ads based on your prior visits to our Site or other websites. You can opt out of
          personalized advertising by visiting{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Settings
          </a>
          .
        </p>

        <h3>8.2 Affiliate Links</h3>
        <p>
          The Site may contain affiliate links. When you click these links and make a purchase, we
          may earn a commission at no additional cost to you. We are not responsible for the
          products, services, or content of third-party sites.
        </p>

        <h3>8.3 Third-Party Links</h3>
        <p>
          Our Site may contain links to third-party websites. We are not responsible for the
          content, privacy policies, or practices of these external sites. Your use of third-party
          websites is at your own risk.
        </p>

        <h2>9. Changes to the Site and Terms</h2>
        <p>
          We reserve the right to modify, suspend, or discontinue the Site (or any part thereof) at
          any time without notice. We may also update these Terms from time to time. Continued use
          of the Site after changes constitutes acceptance of the updated Terms.
        </p>
        <p>
          The "Last Updated" date at the top of this page indicates when these Terms were last
          revised.
        </p>

        <h2>10. Geographic Restrictions</h2>
        <p>
          The Site is intended for users located in the United States, particularly those
          interested in the New York City subway system. We make no claims that the Site or its
          content is accessible or appropriate outside the United States.
        </p>

        <h2>11. Termination</h2>
        <p>
          We reserve the right to terminate or suspend your access to the Site immediately, without
          prior notice or liability, for any reason, including but not limited to a breach of these
          Terms.
        </p>

        <h2>12. Governing Law and Dispute Resolution</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the State
          of New York, United States, without regard to its conflict of law provisions.
        </p>
        <p>
          Any disputes arising out of or relating to these Terms or the Site shall be resolved in
          the state or federal courts located in New York County, New York.
        </p>

        <h2>13. Severability</h2>
        <p>
          If any provision of these Terms is held to be invalid or unenforceable, the remaining
          provisions will continue in full force and effect.
        </p>

        <h2>14. Waiver</h2>
        <p>
          Our failure to enforce any right or provision of these Terms will not be considered a
          waiver of those rights.
        </p>

        <h2>15. Entire Agreement</h2>
        <p>
          These Terms, together with our Privacy Policy, constitute the entire agreement between
          you and Subway Sounds Media LLC regarding the use of the Site.
        </p>

        <h2>16. Contact Information</h2>
        <p>If you have any questions about these Terms, please contact us:</p>
        <p>
          <strong>Subway Sounds Media LLC</strong>
          <br />
          Email: <a href="mailto:info@subwaysounds.net">info@subwaysounds.net</a>
          <br />
          Location: New York City, USA
        </p>

        <h2>17. Acknowledgment</h2>
        <p>
          BY USING THE SITE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO
          BE BOUND BY THEM.
        </p>
      </LegalLayout>
    </>
  );
}
