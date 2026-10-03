/* The site's guard, and the one kind of file the site carries beside the
   demos' pages: a forwarder at the address of a page whose id has changed
   (.scratch/sidebar-tree, "Forwarding a moved address").

   `scripts/build-pages.mjs` writes the forwarders and runs the guard over
   what it wrote; both stand here and not there so that a unit test reaches
   them. It runs in Node and imports nothing. */

/** A page id that changed, as the site sees it. */
export interface Forwarder {
  /** The old address. */
  url: string;
  /** The current address it forwards to. */
  to: string;
  /** The current page's title. */
  title: string;
}

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The file at an old address. GitHub Pages knows no redirect, so it is a
    page: the script carries the anchor over (`/getting-started/#first-chart`
    lands on that example), the meta refresh forwards without the script, and
    the link is there for whoever has neither. `noindex` and the canonical keep
    the old address out of a search engine's index. The forward goes to the
    path, not the host, so that a copy of the site served locally stays local. */
export function forwarderHtml({ to, title }: Forwarder): string {
  const path = new URL(to).pathname;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="robots" content="noindex" />
    <title>${escape(title)}</title>
    <link rel="canonical" href="${escape(to)}" />
    <script>location.replace(${JSON.stringify(path).replace(/</g, "\\u003c")} + location.hash)</script>
    <meta http-equiv="refresh" content="0; url=${escape(path)}" />
  </head>
  <body>
    <p>This page has moved to <a href="${escape(path)}">${escape(title)}</a>.</p>
  </body>
</html>
`;
}

/** What the built site gets wrong, one line each: every sitemap address is a
    file with a title, a description, a canonical pointing at itself and an
    h1; every declared forwarder is a file outside the sitemap pointing into
    it; and no other page file exists. `files` maps the address every written
    page file is served at to its text. */
export function siteFaults(urls: readonly string[], forwarders: readonly Forwarder[], files: ReadonlyMap<string, string>): string[] {
  const forwarded = new Set(forwarders.map((one) => one.url));
  return [
    ...[...files.keys()].filter((url) => !urls.includes(url) && !forwarded.has(url)).map((url) => `${url}: in no sitemap entry and no forwarder`),
    ...urls.flatMap((url) => {
      const html = files.get(url);
      if (html === undefined) return [`${url}: no file`];
      const missing = [
        /<title>[^<]+<\/title>/.test(html) ? null : "title",
        /<meta name="description" content="[^"]+"/.test(html) ? null : "description",
        html.includes(`<link rel="canonical" href="${url}"`) ? null : "canonical",
        /<h1[ >]/.test(html) ? null : "h1",
      ].filter(Boolean);
      return missing.length === 0 ? [] : [`${url}: no ${missing.join(", ")}`];
    }),
    ...forwarders.flatMap(({ url, to }) => {
      if (urls.includes(url)) return [`${url}: a forwarder in the sitemap`];
      if (!urls.includes(to)) return [`${url}: forwards to ${to}, which is not in the sitemap`];
      const html = files.get(url);
      if (html === undefined) return [`${url}: no forwarder file`];
      return html.includes(`<link rel="canonical" href="${to}"`) && html.includes('<meta name="robots" content="noindex"') ? [] : [`${url}: no canonical to ${to} or no noindex`];
    }),
  ];
}
