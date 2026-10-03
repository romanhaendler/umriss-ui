/* The site's guards, and the one kind of file the site carries beside the
   demos' pages: a forwarder at the address of a page whose id has changed
   (.scratch/sidebar-tree, "Forwarding a moved address"). A forwarder has no
   Markdown twin; every page does (.scratch/pages-as-markdown).

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

/* The front page's fixed words that the guard holds it to
   (.scratch/site-front-page): the template writes them, this checks they are
   still there and lead somewhere. The promise comes from the caller: it names
   a word of the industrial world, which this source may not (ADR-0035). */
const BUTTONS = ["Get started", "Explore the scenarios"];
const CLAIMS = ["ISA-18.2 alarm lists", "ISA-101 limits and verdicts", "Canvas charts, measured", "English and German wording", "Written for coding agents too"];

/** What the front page gets wrong, one line each (.scratch/site-front-page):
    one h1 "umriss-ui", the promise, the install command and the theme
    script; both buttons and every claim lead to a sitemap address (a claim
    may lead to the site's `llms.txt`); fewer than twenty addresses are linked
    outside the "Every page" disclosure, and inside it every sitemap address
    but the front page itself. One tile per package, in the order of
    `landings`, each linking its landing page and showing a light and a dark
    preview - files of the site under 300 kB, their alternative text
    "<Display name>: <what it shows>". `home` is the front page's address;
    `images` maps the address of every preview in the site to its size in
    bytes. */
export function frontFaults(
  html: string,
  home: string,
  urls: readonly string[],
  promise: string,
  landings: readonly string[],
  images: ReadonlyMap<string, number>,
): string[] {
  const links = (part: string) =>
    [...part.matchAll(/<a\b[^>]*\bhref="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map((match) => ({
      href: new URL(match[1]!, home).href,
      text: match[2]!.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    }));
  const index = /<details[\s>][\s\S]*?<\/details>/.exec(html)?.[0] ?? "";
  const outside = links(html.replace(index, ""));
  const inside = new Set(links(index).map((link) => link.href));
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((match) => match[1]!.trim());
  const leads = (name: string, also: readonly string[] = []) => {
    const link = outside.find((one) => one.text === name || one.text.startsWith(`${name} `));
    if (link === undefined) return [`no link "${name}"`];
    return urls.includes(link.href) || also.includes(link.href) ? [] : [`"${name}" links ${link.href}, which is no sitemap address`];
  };
  const distinct = new Set(outside.map((link) => link.href)).size;
  const tiles = [...html.matchAll(/<a class="tile" href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map((match) => ({
    href: new URL(match[1]!, home).href,
    name: /<h3[^>]*>([\s\S]*?)<\/h3>/.exec(match[2]!)?.[1]!.trim() ?? "",
    previews: [...match[2]!.matchAll(/<img\b[^>]*>/g)].map(([img]) => ({
      src: new URL(/\bsrc="([^"]*)"/.exec(img)?.[1] ?? "", home).href,
      alt: /\balt="([^"]*)"/.exec(img)?.[1] ?? "",
    })),
  }));
  const tileFaults = tiles.flatMap(({ href, name, previews }, i) => {
    const tile = `the tile "${name}"`;
    return [
      ...(href === landings[i] ? [] : [`${tile} links ${href}, not ${landings[i]}`]),
      ...(urls.includes(href) ? [] : [`${tile} links ${href}, which is no sitemap address`]),
      ...(previews.length === 2 ? [] : [`${tile} has ${previews.length} previews, not a light and a dark one`]),
      ...previews.flatMap(({ src }) => {
        const bytes = images.get(src);
        if (bytes === undefined) return [`${tile} shows ${src}, which is no file of the site`];
        return bytes < 300_000 ? [] : [`${tile} shows ${src} at ${bytes} bytes, not under 300 kB`];
      }),
      ...(previews.every(({ alt }) => alt.startsWith(`${name}: `) && alt.length > name.length + 2)
        ? []
        : [`${tile} has a preview whose alternative text is not "${name}: <what it shows>"`]),
    ];
  });
  return [
    ...(h1s.length === 1 && h1s[0] === "umriss-ui" ? [] : [`not one h1 "umriss-ui" (found: ${h1s.join(", ")})`]),
    ...(html.includes(promise) ? [] : ["no promise"]),
    ...(html.includes("npm install @umriss-ui/core") ? [] : ["no install command"]),
    ...(html.includes('localStorage.getItem("umriss-ui:theme")') ? [] : ["no theme script"]),
    ...BUTTONS.flatMap((name) => leads(name)),
    ...CLAIMS.flatMap((name) => leads(name, [new URL("llms.txt", home).href])),
    ...(tiles.length === landings.length ? tileFaults : [`${tiles.length} tiles, not ${landings.length}`]),
    ...(distinct < 20 ? [] : [`${distinct} addresses linked outside the index, not fewer than 20`]),
    ...urls.filter((url) => url !== home && !inside.has(url)).map((url) => `the index does not link ${url}`),
  ];
}

/** What the API sections' type links get wrong, one line each
    (.scratch/types-without-holes): every link to a `#type-<Name>` leads to a
    page of the site that carries that id - a props table's heading or a
    definition in "Types on this page". `files` as for `siteFaults`. */
export function typeLinkFaults(files: ReadonlyMap<string, string>): string[] {
  return [...files].flatMap(([url, html]) =>
    [...html.matchAll(/href="([^"]*#type-[^"]*)"/g)].flatMap((match) => {
      const target = new URL(match[1]!.replace(/&amp;/g, "&"), url);
      const id = target.hash.slice(1);
      target.hash = "";
      return files.get(target.href)?.includes(`id="${id}"`) === true ? [] : [`${url}: links #${id} on ${target.href}, which has no such id`];
    }),
  );
}

/** A page of a demo as the twins' guard sees it: its address, its name and
    the address of its Markdown twin. */
export interface TwinPage {
  url: string;
  name: string;
  twin: string;
}

/** What the site's text for a coding agent gets wrong, one line each
    (.scratch/pages-as-markdown): every page's twin is a file, not empty,
    beginning with `# <its name>`; every page's head announces exactly one
    twin, its own; and every link in every `llms.txt` leads to a file of the
    site. `files` as for `siteFaults`; `texts` maps the address of every other
    text file - the twins, each `llms.txt` and `llms-full.txt` - to its text. */
export function twinFaults(pages: readonly TwinPage[], files: ReadonlyMap<string, string>, texts: ReadonlyMap<string, string>): string[] {
  return [
    ...pages.flatMap(({ twin, name }) => {
      const text = texts.get(twin);
      if (text === undefined || text === "") return [`${twin}: no twin`];
      return text.startsWith(`# ${name}\n`) ? [] : [`${twin}: does not begin with "# ${name}"`];
    }),
    ...pages.flatMap(({ url, twin }) => {
      const hrefs = [...(files.get(url) ?? "").matchAll(/<link rel="alternate" type="text\/markdown" href="([^"]+)"/g)].map((match) => new URL(match[1]!, url).href);
      if (hrefs.length !== 1) return [`${url}: ${hrefs.length} alternate links to its twin, not 1`];
      return hrefs[0] === twin ? [] : [`${url}: its alternate link points at ${hrefs[0]}, not at ${twin}`];
    }),
    ...[...texts].flatMap(([url, text]) =>
      url.endsWith("/llms.txt")
        ? [...text.matchAll(/\]\(([^)\s]+)\)/g)]
            .map((match) => new URL(match[1]!, url).href.replace(/#.*$/, ""))
            .filter((target) => !files.has(target) && !texts.has(target))
            .map((target) => `${url}: links ${target}, which is no file of the site`)
        : [],
    ),
  ];
}

/** What the document pages get wrong, one line each
    (.scratch/concepts-and-changelog-pages): every document in the list has a
    page; every link of a document's text into the site leads to a sitemap
    address (one to GitHub is checked when the link is rewritten, and fails
    the build there); and no page of the site links ADR-0032 on GitHub, which
    has its page here. `documents` are the documents' addresses, `files` as
    for `siteFaults`, `home` the site's address. */
export function documentFaults(documents: readonly string[], files: ReadonlyMap<string, string>, urls: readonly string[], home: string): string[] {
  return [
    ...documents.flatMap((url) => {
      const html = files.get(url);
      if (html === undefined) return [`${url}: no page for this document`];
      const text = /<main[\s>][\s\S]*<\/main>/.exec(html)?.[0] ?? "";
      return [...text.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)]
        .map((match) => new URL(match[1]!.replace(/&amp;/g, "&"), url).href.replace(/#.*$/, ""))
        .filter((target) => target.startsWith(home) && !urls.includes(target))
        .map((target) => `${url}: links ${target}, which is no sitemap address`);
    }),
    ...[...files]
      .filter(([, html]) => /href="https:\/\/github\.com\/[^"]*\/docs\/adr\/0032-/.test(html))
      .map(([url]) => `${url}: links ADR-0032 on GitHub, not its page on the site`),
  ];
}
