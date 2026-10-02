export const prefetch = "partial";

import type { Metadata } from "next";
import { GridCard, GridCardSection } from "@/components/grid";
import { cn } from "@/lib/utils";
import { buildSeoMetadata } from "@/utilities/seo-metadata";

export default function PrivacyPolicy() {
  return (
    <GridCard
      className={cn(
        "g2:col-start-2 g2:col-end-3 g2:row-start-1 self-start",
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
              <strong>Last Updated:</strong> October 2, 2026
            </p>

            <p>
              <strong>Lyovson.com</strong> is the personal website of Rafa and
              Jess Lyóvson. We collect as little as we can: there are no
              accounts for readers, no sign-up forms, no advertising and no
              tracking cookies.
            </p>
          </section>

          <section>
            <h2>1. What We Collect</h2>

            <h3>1.1 Analytics</h3>
            <p>
              We use <strong>Vercel Web Analytics</strong> to count page views.
              It does not use cookies or store anything on your device. It
              records the page you visit, the referring site, your browser,
              operating system, device type and country. Visits are grouped with
              a hash of the request that changes every day, so you are not
              identified or followed across days or sites.
            </p>

            <h3>1.2 Server Logs</h3>
            <p>
              Our host, <strong>Vercel</strong>, processes your IP address and
              request details (such as the page requested and your browser) to
              deliver the site, keep it secure and diagnose errors. These logs
              are kept for a short period by Vercel.
            </p>

            <h3>1.3 Search</h3>
            <p>
              When you use the site search, the text you search for is sent to{" "}
              <strong>OpenAI</strong> to find related content. It is not linked
              to you, and we do not use it for anything else.
            </p>

            <h3>1.4 Your Device</h3>
            <p>
              Your light or dark theme choice is saved in your browser&rsquo;s
              local storage. It never leaves your device.
            </p>

            <h3>1.5 Emails You Send Us</h3>
            <p>
              If you email us, we keep your message and address only to reply to
              you. Newsletter sign-ups are closed; if you subscribed in the
              past, email us and we will delete your address.
            </p>
          </section>

          <section>
            <h2>2. Embedded Content</h2>
            <p>
              Some posts include content from other services. Your browser
              contacts them directly, and their own privacy policies apply:
            </p>
            <ul>
              <li>
                <strong>YouTube</strong> videos load from YouTube&rsquo;s
                privacy-enhanced domain, and only after you press play.
              </li>
              <li>
                <strong>X (Twitter)</strong> posts load their images and videos
                from X.
              </li>
              <li>
                <strong>GIFs</strong> load from Tenor (Google).
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Sharing</h2>
            <p>
              We do <strong>not</strong> sell, rent or trade personal data. The
              only services that process it are Vercel (hosting and analytics),
              Neon (our database host, which stores site content, not visitor
              data) and OpenAI (search queries), plus the embedded services
              above. We may disclose information if the law requires it.
            </p>
          </section>

          <section>
            <h2>4. Your Rights</h2>
            <p>
              Depending on where you live, including under the GDPR and CCPA,
              you may have the right to access, correct, delete, restrict or
              object to the processing of your personal data, and to complain to
              a data protection authority. Because we do not identify visitors,
              we usually hold nothing that can be linked to you. To ask anyway,
              email us.
            </p>
          </section>

          <section>
            <h2>5. Changes to This Policy</h2>
            <p>
              If we change how the site handles data, we will update this page
              and the date above.
            </p>
          </section>

          <section>
            <h2>6. Contact Us</h2>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:hello@lyovson.com">hello@lyovson.com</a>
            </p>
          </section>
        </article>
      </GridCardSection>
    </GridCard>
  );
}

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "Privacy Policy",
    description:
      "How Lyovson.com handles data: cookieless analytics, no sign-ups or tracking, and what embedded content and search share with other services.",
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
      "document:last-updated": "2026-10-02",
    },
  }),
};
