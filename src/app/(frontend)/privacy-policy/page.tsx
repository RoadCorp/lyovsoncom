import type { Metadata } from "next";
import { GridCard, GridCardSection } from "@/components/grid";
import { cn } from "@/lib/utils";
import { buildSeoMetadata } from "@/utilities/seo-metadata";

export default function PrivacyPolicy() {
  return (
    <GridCard
      className={cn(
        "g2:col-start-2 g2:col-end-3 g2:row-auto g2:row-start-2",
        "g3:col-start-2 g3:col-end-4 g3:w-[var(--grid-card-2x1)]",
        "aspect-auto h-auto"
      )}
      interactive={false}
    >
      <GridCardSection className="col-span-3 row-span-3 p-6">
        <article className="docs-shell content-prose">
          <h1>Privacy Policy for Lyovson.com</h1>

          <section className="surface-panel surface-docs-panel">
            <p className="tone-muted text-sm">
              <strong>Effective Date:</strong> March 19, 2024
              <br />
              <strong>Last Updated:</strong> March 19, 2024
            </p>

            <p>
              At <strong>Lyovson.com</strong>, we are committed to protecting
              your privacy and ensuring transparency about how we collect, use,
              and share your information. This Privacy Policy explains what data
              we collect, how we use it, and your rights regarding your personal
              data.
            </p>

            <p>
              By using <strong>Lyovson.com</strong>, you agree to the practices
              described in this Privacy Policy.
            </p>
          </section>

          <section>
            <h2>1. Information We Collect</h2>

            <h3>1.1 Personal Data You Provide</h3>
            <ul>
              <li>
                <strong>When You Sign Up:</strong> Name, email address, and
                other registration details.
              </li>
              <li>
                <strong>When You Contact Us:</strong> Information you provide
                via contact forms or emails.
              </li>
            </ul>

            <h3>1.2 Automatically Collected Data</h3>
            <p>We use cookies and tracking tools to collect:</p>
            <ul>
              <li>IP Address (anonymized)</li>
              <li>Browser Type and Version</li>
              <li>Pages Visited and Time Spent on the site</li>
              <li>Device Information (e.g., desktop, mobile)</li>
              <li>Location Data (general, not precise)</li>
            </ul>

            <h3>1.3 Cookies and Tracking Technologies</h3>
            <p>We use:</p>
            <ul>
              <li>
                <strong>Google Analytics:</strong> For understanding site usage
                and improving user experience.
              </li>
              <li>
                <strong>Microsoft Clarity:</strong> For session recordings and
                heatmaps to optimize site design.
              </li>
              <li>
                <strong>Vercel Analytics:</strong> For performance metrics.
              </li>
            </ul>
            <p>
              Cookies help us enhance your experience and analyze site traffic.
            </p>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
              <li>
                <strong>Site Improvement:</strong> To understand how users
                interact with our content.
              </li>
              <li>
                <strong>Personalization:</strong> To tailor content to your
                preferences.
              </li>
              <li>
                <strong>Communication:</strong> To respond to inquiries or
                provide updates.
              </li>
              <li>
                <strong>Security:</strong> To protect the integrity of our
                website.
              </li>
              <li>
                <strong>Compliance:</strong> To meet legal obligations.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. How We Share Your Information</h2>
            <p>
              We do <strong>not</strong> sell or trade your personal data. We
              may share information with:
            </p>

            <h3>3.1 Service Providers</h3>
            <ul>
              <li>
                <strong>Google Analytics</strong> (analytics)
              </li>
              <li>
                <strong>Microsoft Clarity</strong> (session insights)
              </li>
              <li>
                <strong>Cloudflare</strong> (site security and performance)
              </li>
            </ul>

            <h3>3.2 Legal Compliance</h3>
            <p>When required by law or to protect our legal rights.</p>
          </section>

          <section>
            <h2>4. Your Privacy Rights</h2>

            <h3>GDPR (EU) Rights</h3>
            <p>
              If you are in the European Economic Area (EEA), you have the right
              to:
            </p>
            <ul>
              <li>
                <strong>Access</strong> your personal data
              </li>
              <li>
                <strong>Correct</strong> inaccurate information
              </li>
              <li>
                <strong>Delete</strong> your data (&ldquo;Right to be
                Forgotten&rdquo;)
              </li>
              <li>
                <strong>Restrict Processing</strong> of your data
              </li>
              <li>
                <strong>Data Portability</strong>
              </li>
              <li>
                <strong>Object</strong> to processing
              </li>
            </ul>

            <h3>CCPA (California) Rights</h3>
            <p>If you are a California resident, you have the right to:</p>
            <ul>
              <li>
                <strong>Know</strong> what personal data we collect
              </li>
              <li>
                <strong>Delete</strong> your personal data
              </li>
              <li>
                <strong>Opt-Out</strong> of the sale of your personal data (we
                do not sell data)
              </li>
            </ul>

            <p>
              To exercise these rights, please contact us at{" "}
              <strong>privacy@lyovson.com</strong>.
            </p>
          </section>

          <section>
            <h2>5. Cookies and Tracking Preferences</h2>
            <p>
              You can manage your cookie preferences via the Cookie Consent
              Banner on our site or through your browser settings.
            </p>
            <ul>
              <li>
                <strong>Opt-Out of Google Analytics:</strong>{" "}
                <a href="https://tools.google.com/dlpage/gaoptout">
                  Google Analytics Opt-Out
                </a>
              </li>
              <li>
                <strong>Manage Cookies:</strong> Adjust your settings in our
                Cookie Preferences modal.
              </li>
            </ul>
          </section>

          <section>
            <h2>6. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your data.
              However, no method of transmission over the internet is 100%
              secure. Please use the site responsibly.
            </p>
          </section>

          <section>
            <h2>7. Data Retention</h2>
            <p>
              We retain your personal data only for as long as necessary to
              fulfill the purposes outlined in this policy or as required by
              law.
            </p>
          </section>

          <section>
            <h2>8. Third-Party Links</h2>
            <p>
              Our site may contain links to external websites. We are not
              responsible for their privacy practices.
            </p>
          </section>

          <section>
            <h2>9. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will
              be posted on this page with an updated &ldquo;Effective
              Date.&rdquo;
            </p>
          </section>

          <section>
            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or your data
              rights, please contact:
            </p>
            <p>
              <strong>Email:</strong> privacy@lyovson.com
              <br />
              <strong>Website:</strong>{" "}
              <a href="https://www.lyovson.com">https://www.lyovson.com</a>
            </p>
          </section>

          <footer className="tone-muted border-border border-t pt-6 text-sm">
            <p>This Privacy Policy was last updated on March 19, 2024.</p>
          </footer>
        </article>
      </GridCardSection>
    </GridCard>
  );
}

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "Privacy Policy",
    description:
      "Privacy Policy for Lyovson.com - Learn how we collect, use, and protect your personal information. GDPR and CCPA compliant.",
    canonicalPath: "/privacy-policy",
    keywords: [
      "privacy policy",
      "data protection",
      "GDPR",
      "CCPA",
      "personal information",
      "cookies",
      "terms",
    ],
    twitterCard: "summary",
    robots: {
      index: true,
      follow: true,
    },
    other: {
      "document:type": "legal",
      "document:category": "privacy-policy",
      "document:last-updated": "2024-03-19",
    },
  }),
};
