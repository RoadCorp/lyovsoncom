<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="/rss/channel/title"/> — RSS Feed</title>
        <link rel="icon" type="image/svg+xml" href="/icon.svg"/>
        <style>
          :root {
            color-scheme: light dark;
            --bg: #f0ddc3;
            --surface: #f7f0e2;
            --ink: #2f2533;
            --muted: #655264;
            --accent: #74435b;
            --gold: #a87b44;
            --line: rgba(116, 67, 91, 0.24);
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #0e0911;
              --surface: #18111d;
              --ink: #ebe3cf;
              --muted: #b6a6b8;
              --accent: #d8aeb6;
              --gold: #cdaa80;
              --line: rgba(205, 170, 128, 0.24);
            }
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 2rem 1.25rem 4rem;
            background: var(--bg);
            color: var(--ink);
            font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
            line-height: 1.6;
          }
          main { max-width: 46rem; margin: 0 auto; }
          .card {
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: 0.75rem;
            padding: 1.5rem 1.75rem;
            margin-bottom: 1.25rem;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          .brand img { width: 48px; height: 48px; border-radius: 10px; }
          .eyebrow {
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 0.72rem;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: var(--gold);
            margin: 0 0 0.25rem;
          }
          h1, h2 {
            font-family: Georgia, "Times New Roman", serif;
            font-weight: 600;
            letter-spacing: -0.015em;
            margin: 0;
          }
          h1 { font-size: 1.75rem; line-height: 1.2; }
          h2 { font-size: 1.2rem; line-height: 1.3; margin-bottom: 0.45rem; }
          p { margin: 0.5rem 0 0; color: var(--muted); }
          .notice {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--line);
            font-size: 0.875rem;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
          }
          .links { display: flex; flex-wrap: wrap; gap: 0.9rem; }
          a { color: var(--accent); text-decoration: none; }
          a:hover { text-decoration: underline; text-underline-offset: 0.2em; }
          .meta {
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 0.72rem;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--gold);
            margin-bottom: 0.4rem;
          }
          article p { font-size: 0.95rem; }
        </style>
      </head>
      <body>
        <main>
          <header class="card">
            <div class="brand">
              <img src="/icon.svg" alt="Lyóvson.com"/>
              <div>
                <p class="eyebrow">RSS 2.0 Web Feed</p>
                <h1><xsl:value-of select="/rss/channel/title"/></h1>
              </div>
            </div>
            <p><xsl:value-of select="/rss/channel/description"/></p>
            <div class="notice">
              <span>Copy this page URL into your feed reader to subscribe.</span>
              <nav class="links">
                <a href="/">Visit Site</a>
                <a href="/atom.xml">Atom</a>
                <a href="/feed.json">JSON Feed</a>
              </nav>
            </div>
          </header>

          <xsl:for-each select="/rss/channel/item">
            <article class="card">
              <p class="meta"><xsl:value-of select="pubDate"/></p>
              <h2>
                <a>
                  <xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
                  <xsl:value-of select="title"/>
                </a>
              </h2>
              <p><xsl:value-of select="description"/></p>
            </article>
          </xsl:for-each>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
