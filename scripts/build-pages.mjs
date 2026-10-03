/* The site on GitHub Pages: the five demos under one address, each in a
   directory of its own, and a page in front that points at every page of them.

     site/index.html            the front page - the hub
     site/<package>/            the demo of @umriss-ui/<package>
     site/<package>/<page>/     one of its pages, prerendered
     site/<package>/<page>.md   the same page as Markdown - its twin
     site/<package>/index.md    the twin of the demo's scenarios page
     site/<package>/<old>/      a forwarder where a page's id has changed
     site/sitemap.xml           every address above, no forwarder
     site/llms.txt              the index for coding agents
     site/og-image.png          the picture every page shows where it is shared
     site/favicon.svg           the front page's favicon (each demo bundles its own copy)

   Every page of a demo is a path with an `index.html` of its own, carrying the
   page's text, its examples' source and its props tables - what a search
   engine reads, since it reads no hash (ADR-0037). The demo replaces that text
   when it starts. The text comes from the same run as `llms.txt`
   (`packages/demo/src/tooling/llms.ts`, written as `demo/.generated/pages.json`),
   so it cannot say anything the demo does not. Each page's head announces its
   twin, which the same run writes to `demo/.generated/twins/`
   (.scratch/pages-as-markdown).

   The demos are built with the absolute base their homepage names
   (`/umriss-ui/core/`): a page two directories deep must find the same assets.
   The site therefore runs under that path only - `npx serve` on a directory
   named `umriss-ui` above `site/`, not on `site/` itself.

   The vite configs of the demos stay untouched: the screenshot suites build
   them with the default base, and nothing here should move a baseline.

   Search Console and Bing prove the site is ours by a file at its root; those
   files stand in `scripts/site-verification/` and are copied as they are.

   Run: `pnpm build:pages`. The forwarders and the guard come from the demo's
   tooling (`packages/demo/src/tooling/site.ts`). */

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
/* The one list of the packages - read in Node as it stands, which is why it
   imports nothing (and why `build:pages` strips types). */
import { PACKAGES as LIST } from "../packages/demo/src/packages.ts";
import { forwarderHtml, siteFaults, twinFaults } from "../packages/demo/src/tooling/site.ts";
import { siteLeaks } from "../packages/demo/src/tooling/references.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = join(ROOT, "site");
const REPOSITORY = "https://github.com/romanhaendler/umriss-ui";
const PACKAGES = LIST.map((p) => p.id);
/* The site's address is the one above every package's homepage - read from
   the manifests, which already carry it, rather than written a second time. */
const HOME = new URL("../", JSON.parse(readFileSync(join(ROOT, "packages", PACKAGES[0], "package.json"), "utf8")).homepage).href;

/* The picture a link to any page shows where it is shared, 1200 x 630: core's
   controls opened - a date range picker, a multi-select, the command palette,
   a tree - above parts of the kiln scenario for the other packages. One for
   every page - it is taken by hand, so it is renewed by hand when they change. */
const PREVIEW = "og-image.png";
const PREVIEW_ALT = "Components of umriss-ui: an open date range picker, a multi-select, a command palette and a tree, with a trend chart, an alarm table, a production plan and an OEE calculation.";

/* The favicon: the demos link it from their `index.html`, and vite bundles it
   into their assets; the front page and the 404 page take this copy. */
const FAVICON = "favicon.svg";
const FAVICON_LINK = `<link rel="icon" type="image/svg+xml" href="${new URL(FAVICON, HOME).pathname}" />`;

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** What every page's head says about itself to a search engine. */
function headOf({ title, description, url }) {
  return [
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(description)}" />`,
    `<link rel="canonical" href="${escape(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="umriss-ui" />`,
    `<meta property="og:title" content="${escape(title)}" />`,
    `<meta property="og:description" content="${escape(description)}" />`,
    `<meta property="og:url" content="${escape(url)}" />`,
    `<meta property="og:image" content="${HOME}${PREVIEW}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escape(PREVIEW_ALT)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].join("\n    ");
}

/** schema.org's word for a package: what it is, where its code is. */
function structuredData(row) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: row.name,
    description: row.description,
    version: row.version,
    url: row.homepage,
    codeRepository: REPOSITORY,
    programmingLanguage: ["TypeScript", "React"],
    runtimePlatform: "Web browser",
    license: `https://spdx.org/licenses/${row.license}.html`,
  };
}

const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

/* All a reader without JavaScript gets: legible, not styled - the demo's look
   arrives with the demo. With JavaScript the text stays in the document, for
   the crawler, but unseen: otherwise it flashes up unstyled for the moment
   before the demo replaces it. */
const PRERENDERED_STYLE = `<script>document.documentElement.classList.add("js")</script><style>.js .prerendered{visibility:hidden}.prerendered{max-width:48rem;margin:0 auto;padding:2rem 1rem;font:15px/1.55 system-ui,sans-serif}.prerendered pre{overflow:auto;padding:.75rem;background:rgba(127,127,127,.1)}.prerendered table{border-collapse:collapse;display:block;overflow:auto}.prerendered td,.prerendered th{border:1px solid rgba(127,127,127,.3);padding:.25rem .5rem;text-align:left;vertical-align:top}</style>`;

/** A page of a demo: the built `index.html`, told which page it is and where
    its Markdown twin stands - by path, so that a copy served locally stays
    local. */
function pageDocument(template, page, extraHead = "") {
  const title = /<title>[^<]*<\/title>/;
  const root = '<div id="root"></div>';
  if (!title.test(template) || !template.includes(root)) throw new Error("The demo's index.html has lost its <title> or its empty #root.");
  const alternate = `<link rel="alternate" type="text/markdown" href="${escape(new URL(page.twin).pathname)}" />`;
  return template
    .replace(title, `${headOf(page)}\n    ${alternate}\n    ${PRERENDERED_STYLE}${extraHead === "" ? "" : `\n    ${extraHead}`}`)
    .replace(root, () => `<div id="root"><div class="prerendered">${page.html}</div></div>`);
}

rmSync(SITE, { recursive: true, force: true });
mkdirSync(SITE, { recursive: true });
cpSync(join(ROOT, "packages", "demo", "src", FAVICON), join(SITE, FAVICON));

const rows = [];
const urls = [HOME];
const forwarders = [];
const twinPages = [];
/* A requirement number or an unlinked ADR number in a page's text - the
   guard below fails on them. */
const leaks = [];
for (const dir of PACKAGES) {
  const packageDir = join(ROOT, "packages", dir);
  const manifest = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8"));
  const base = new URL(manifest.homepage).pathname;
  execFileSync("pnpm", ["--filter", manifest.name, "run", "build:demo", "--base", base], { cwd: ROOT, stdio: "inherit" });
  const out = join(SITE, dir);
  cpSync(join(packageDir, "dist-demo"), out, { recursive: true });
  cpSync(join(packageDir, "demo", ".generated", "llms.txt"), join(out, "llms.txt"));
  cpSync(join(packageDir, "docs", "llms-full.md"), join(out, "llms-full.txt"));
  cpSync(join(packageDir, "demo", ".generated", "twins"), out, { recursive: true });

  const row = { dir, ...manifest, pages: [] };
  const template = readFileSync(join(out, "index.html"), "utf8");
  const pages = JSON.parse(readFileSync(join(packageDir, "demo", ".generated", "pages.json"), "utf8"));
  for (const page of pages) {
    const front = page.path === "";
    mkdirSync(join(out, page.path), { recursive: true });
    writeFileSync(join(out, page.path, "index.html"), pageDocument(template, page, front ? jsonLd(structuredData(row)) : ""));
    urls.push(page.url);
    twinPages.push(page);
    leaks.push(...siteLeaks(page.html).map((leak) => `${page.url}: ${leak} in the text`));
    if (!front) row.pages.push(page);
  }
  /* An old address of a page whose id changed: a forwarder, never in the
     sitemap. */
  for (const forwarder of JSON.parse(readFileSync(join(packageDir, "demo", ".generated", "forwarders.json"), "utf8"))) {
    const dirOf = join(SITE, forwarder.url.slice(HOME.length));
    mkdirSync(dirOf, { recursive: true });
    writeFileSync(join(dirOf, "index.html"), forwarderHtml(forwarder));
    forwarders.push(forwarder);
  }
  rows.push(row);
}

/* The front page: every package, and under it every one of its pages - the
   links a crawler walks, since no other site points here. */
writeFileSync(
  join(SITE, "index.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${FAVICON_LINK}
    ${headOf({
      title: "umriss-ui – React component library, canvas charts, data table and Gantt schedule for data-dense dashboards",
      description:
        "Open-source React components for data-dense applications: a component library, canvas charts, a typed data table, a Gantt-style schedule and a calculation view. TypeScript, MIT, light and dark.",
      url: HOME,
    })}
    ${jsonLd({ "@context": "https://schema.org", "@graph": rows.map(structuredData) })}
    <style>
      :root { color-scheme: light dark; --ink: #1b1d21; --muted: #5d636e; --paper: #f7f7f5; --card: #ffffff; --edge: #e3e3df; }
      @media (prefers-color-scheme: dark) { :root { --ink: #e8e9ec; --muted: #9aa0ab; --paper: #141518; --card: #1c1d21; --edge: #2c2e33; } }
      body { margin: 0; background: var(--paper); color: var(--ink); font: 15px/1.5 system-ui, sans-serif; }
      main { max-width: 44rem; margin: 0 auto; padding: 4rem 1rem; }
      h1 { font-size: 1.6rem; font-weight: 600; margin: 0 0 .25rem; }
      main > p { color: var(--muted); margin: 0 0 2rem; }
      section { padding: 1rem 1.25rem; margin-bottom: .75rem; background: var(--card); border: 1px solid var(--edge); border-radius: 10px; }
      h2 { margin: 0; font-size: 1rem; }
      h2 a { color: inherit; text-decoration: none; }
      h2 a:hover, h2 a:focus-visible { text-decoration: underline; }
      code { font: 600 .95rem ui-monospace, monospace; }
      .version { color: var(--muted); font: .85rem ui-monospace, monospace; margin-left: .5rem; font-weight: 400; }
      section > p { color: var(--muted); margin: .25rem 0 .75rem; }
      ul.pages { display: flex; flex-wrap: wrap; gap: .25rem .9rem; margin: 0; padding: 0; list-style: none; font-size: .9rem; }
      ul.pages a { color: var(--muted); }
      ul.pages a:hover, ul.pages a:focus-visible { color: var(--ink); }
      footer { margin-top: 2rem; }
      footer a { color: var(--muted); }
    </style>
  </head>
  <body>
    <main>
      <h1>umriss-ui</h1>
      <p>React components for data-dense applications - dashboards, monitoring, planning. Each demo is the documentation of its package: running examples, their source, and the props generated from the code.</p>
${rows
  .map(
    (row) => `      <section>
        <h2><a href="./${row.dir}/"><code>${escape(row.name)}</code><span class="version">${escape(row.version)}</span></a></h2>
        <p>${escape(row.description)}</p>
        <ul class="pages">${row.pages.map((page) => `<li><a href="./${row.dir}/${page.path}">${escape(page.name)}</a></li>`).join("")}</ul>
      </section>`,
  )
  .join("\n")}
      <footer><a href="${REPOSITORY}">Source on GitHub</a> · <a href="./llms.txt">llms.txt</a>, for coding agents</footer>
    </main>
  </body>
</html>
`,
);

/* Every address, once. Google reads `lastmod` only where it is true; the
   build date is, since every page is written anew. */
const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(SITE, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${escape(url)}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`,
);

/* An address that is no page. GitHub Pages serves this file for it; there is
   no fallback to a demo's index.html as in the dev server. */
writeFileSync(
  join(SITE, "404.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    ${FAVICON_LINK}
    <title>Not found – umriss-ui</title>
    <style>:root{color-scheme:light dark}body{margin:0;font:15px/1.5 system-ui,sans-serif}main{max-width:44rem;margin:0 auto;padding:4rem 1rem}</style>
  </head>
  <body>
    <main>
      <h1>No page at this address</h1>
      <p>The components are listed on <a href="${HOME}">the front page</a>${rows.map((row) => `, <a href="${HOME}${row.dir}/">${escape(row.name)}</a>`).join("")}.</p>
    </main>
  </body>
</html>
`,
);

/* The workspace's index for an agent: which package is which, and where each
   one's own index and full text stand. */
writeFileSync(
  join(SITE, "llms.txt"),
  `# umriss-ui

> React components for data-dense applications - dashboards, monitoring, planning: a component library, canvas charts, a table, a schedule and calculations, in English and German. Each package's demo is its documentation; the text below points at the same material as plain text.

Every package carries the full text of its installed version as \`node_modules/<package>/docs/llms-full.md\`.

## Packages

${rows.map((row) => `- [${row.name}](${HOME}${row.dir}/llms.txt): ${row.description} Full text: [llms-full.txt](${HOME}${row.dir}/llms-full.txt)`).join("\n")}
`,
);

/* The guard over what was written (search-visibility, Testing;
   sidebar-tree, seam 1): every address in the sitemap is a file with a title,
   a description, a canonical pointing at itself, an h1 and a favicon that is there, every forwarder
   stands outside the sitemap and points into it, and there is no other page
   file; every page has its Markdown twin and announces it, and every link
   in every llms.txt leads to a file (pages-as-markdown). A build that breaks
   it fails here, before it is deployed. */
const files = new Map();
const texts = new Map();
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const below = relative(SITE, dir);
    const at = HOME + (below === "" ? "" : `${below.split(sep).join("/")}/`);
    if (entry.isDirectory() && entry.name !== "assets") walk(join(dir, entry.name));
    else if (entry.name === "index.html") files.set(at, readFileSync(join(dir, entry.name), "utf8"));
    else if (/\.(md|txt)$/.test(entry.name)) texts.set(at + entry.name, readFileSync(join(dir, entry.name), "utf8"));
  }
};
walk(SITE);
const sitePath = new URL(HOME).pathname;
const linksFavicon = (html, url) => {
  const href = /<link rel="icon"[^>]* href="([^"]+)"/.exec(html)?.[1];
  const path = href === undefined ? "" : new URL(href, url).pathname;
  return path.startsWith(sitePath) && existsSync(join(SITE, path.slice(sitePath.length)));
};
const faults = [
  ...siteFaults(urls, forwarders, files),
  ...twinFaults(twinPages, files, texts),
  ...urls.filter((url) => files.has(url) && !linksFavicon(files.get(url), url)).map((url) => `${url}: no favicon`),
  /* No props row says a prop accepts nothing: a `never` is a prohibition the
     reader merges away (types-without-holes), never a type to show. */
  ...PACKAGES.flatMap((dir) =>
    Object.values(JSON.parse(readFileSync(join(ROOT, "packages", dir, "demo", ".generated", "props.json"), "utf8"))).flatMap((entry) =>
      entry.props
        .filter((prop) => prop.type === "never" || prop.type.startsWith("never |"))
        .map((prop) => `${dir}: ${entry.name}.${prop.name} is typed \`${prop.type}\``),
    ),
  ),
  ...leaks,
];
if (faults.length > 0) throw new Error(`The built site fails its guard:\n${faults.join("\n")}`);

/* The consoles' proof of ownership, where there is one yet. */
const VERIFICATION = join(ROOT, "scripts", "site-verification");
if (existsSync(VERIFICATION)) {
  for (const file of readdirSync(VERIFICATION)) cpSync(join(VERIFICATION, file), join(SITE, file));
}
cpSync(join(ROOT, "scripts", PREVIEW), join(SITE, PREVIEW));

console.log(`\nsite/ is ready: ${rows.map((row) => `${row.dir}/ (${row.pages.length} pages)`).join(", ")}, index.html, sitemap.xml and llms.txt - ${urls.length} addresses, ${forwarders.length} forwarded.`);
