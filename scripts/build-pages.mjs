/* The site on GitHub Pages: the five demos under one address, each in a
   directory of its own, and a page in front that points at every page of them.

     site/index.html            the front page - the hub (scripts/front-page.html)
     site/<document>/           a document of the workspace, rendered in the front page's layout
     site/<package>/            the demo of @umriss-ui/<package>
     site/<package>/<page>/     one of its pages, prerendered
     site/<package>/<page>.md   the same page as Markdown - its twin
     site/<package>/index.md    the twin of the demo's scenarios page
     site/<package>/<old>/      a forwarder where a page's id has changed
     site/<package>/changelog/  its CHANGELOG.md, rendered in the front page's layout
     site/sitemap.xml           every address above, no forwarder
     site/llms.txt              the index for coding agents
     site/<package>/search.json the package's search fragment
     site/search.json           the five fragments in one: the palette's index of the
                                whole site (.scratch/one-search)
     site/og-image.png          the picture every page shows where it is shared
     site/favicon.svg           the front page's favicon (each demo bundles its own copy)
     site/fonts/                the front page's Geist (each demo bundles its own copy)
     site/previews/             the front page's tiles: each package's first scenario,
                                light and dark (scripts/previews/, by `pnpm previews`)

   Every page of a demo is a path with an `index.html` of its own, carrying the
   page's text, its examples' source and its props tables - what a search
   engine reads, since it reads no hash (ADR-0037). The demo replaces that text
   when it starts. The text comes from the same run as `llms.txt`
   (`packages/demo/src/tooling/llms.ts`, written as `demo/.generated/pages.json`),
   so it cannot say anything the demo does not. Each page's head announces its
   twin, which the same run writes to `demo/.generated/twins/` and the demo's
   build carries in `dist-demo` as its public files (.scratch/pages-as-markdown) -
   the dev server serves them from there too.

   The demos are built with the absolute base their homepage names
   (`/umriss-ui/core/`): a page two directories deep must find the same assets.
   The site therefore runs under that path only - `npx serve` on a directory
   named `umriss-ui` above `site/`, not on `site/` itself.

   The vite configs of the demos stay untouched: the screenshot suites build
   them with the default base, and nothing here should move a baseline.

   Search Console and Bing prove the site is ours by a file at its root; those
   files stand in `scripts/site-verification/` and are copied as they are.

   The documents are the workspace's own markdown - the design language, the
   standards, what umriss-ui is not, each package's changelog - read and rendered here, never copied
   (.scratch/concepts-and-changelog-pages, ADR-0046). Their list stands in
   `packages/demo/src/tooling/documents.ts`.

   Run: `pnpm build:pages`. The forwarders and the guard come from the demo's
   tooling (`packages/demo/src/tooling/site.ts`). */

import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
/* The one list of the packages - read in Node as it stands, which is why it
   imports nothing (and why `build:pages` strips types). */
import { PACKAGES as LIST } from "../packages/demo/src/packages.ts";
import { dependencyLine, installCommand } from "../packages/demo/src/tooling/install.ts";
import { apiIndexFaults, documentFaults, forwarderHtml, frontFaults, searchFaults, siteFaults, siteSearch, twinFaults, typeLinkFaults, whatsNewFaults } from "../packages/demo/src/tooling/site.ts";
import { adrLinksOf, siteLeaks } from "../packages/demo/src/tooling/references.ts";
import { DOCUMENTS, newestRelease, renderDocument } from "../packages/demo/src/tooling/documents.ts";
import { EDIT_LINK, editHref } from "../packages/demo/src/tooling/edit.ts";

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

/* The front page's tiles: each package's first scenario, light and dark,
   1200 x 750 - photographed by `pnpm previews` (scripts/previews.mjs) and
   checked in, so renewed by that one command when a first scenario changes. */
const PREVIEWS = "previews";

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
  cpSync(join(packageDir, "demo", ".generated", "search.json"), join(out, "search.json"));
  cpSync(join(packageDir, "docs", "llms-full.md"), join(out, "llms-full.txt"));

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
    /* The first scenario's title, as the landing page's text names it (already
       escaped): what the front page's tile shows a picture of. */
    else row.scenario = /<h2>Scenarios<\/h2>[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/.exec(page.html)?.[1];
  }
  if (row.scenario === undefined) throw new Error(`${dir}'s landing page names no scenario - the front page's tile has nothing to show.`);
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

/* The workspace's own documents (.scratch/concepts-and-changelog-pages): each
   rendered from its file as it stands now. A link to a file that does not
   exist stops the build here, and so does a changelog whose newest release is
   not its manifest's version - a release without its entry. */
const adrs = adrLinksOf(readdirSync(join(ROOT, "docs", "adr")));
const documents = DOCUMENTS.map((document) => {
  const markdown = readFileSync(join(ROOT, document.source), "utf8");
  return {
    ...document,
    url: HOME + document.path,
    ...renderDocument(markdown, document.source, { home: HOME, exists: (path) => existsSync(join(ROOT, path)), adrs }),
    release: document.changelogOf === undefined ? undefined : newestRelease(markdown, document.source),
  };
});
for (const row of rows) {
  row.changelog = documents.find((document) => document.changelogOf === row.dir);
  const { release, source } = row.changelog;
  if (release.version !== row.version) throw new Error(`${source}: its newest release is ${release.version}, its manifest's version ${row.version}.`);
}
const concepts = documents.filter((document) => document.changelogOf === undefined);
for (const document of documents) {
  urls.push(document.url);
  leaks.push(...siteLeaks(document.html).map((leak) => `${document.url}: ${leak} in the text`));
}

/* The front page (.scratch/site-front-page): its own template, filled here.
   The index of every page stays in it, folded - the links a crawler walks,
   since no other site points here. The theme script is the demos' own, from
   core's `index.html`; the colours are the token stylesheet's, copied in; the
   type is the demos' Geist, its files copied from the installed packages. */
/* The promise, as the template writes it - the guard checks it is there. */
const PROMISE =
  "React components for data-dense screens – control rooms, dashboards, planning – built to the industrial standards for alarms and limits, in English and German.";
const fromCore = createRequire(join(ROOT, "packages", "core", "package.json"));
mkdirSync(join(SITE, "fonts"));
for (const [family, weights] of [["geist-sans", [400, 500, 600]], ["geist-mono", [400]]]) {
  const files = join(dirname(fromCore.resolve(`@fontsource/${family}/400.css`)), "files");
  for (const weight of weights) cpSync(join(files, `${family}-latin-${weight}-normal.woff2`), join(SITE, "fonts", `${family}-latin-${weight}-normal.woff2`));
}
const themeScript = /<script>[\s\S]*?<\/script>/.exec(readFileSync(join(ROOT, "packages", "core", "demo", "index.html"), "utf8"))?.[0];
if (themeScript === undefined || !themeScript.includes("umriss-ui:theme")) throw new Error("core's demo/index.html has lost its theme script.");
const front = {
  themeScript,
  favicon: FAVICON_LINK,
  head: headOf({
    title: "umriss-ui – React component library, canvas charts, data table and Gantt schedule for data-dense dashboards",
    description:
      "Open-source React components for data-dense applications: a component library, canvas charts, a typed data table, a Gantt-style schedule and a calculation view. TypeScript, MIT, light and dark.",
    url: HOME,
  }),
  jsonLd: jsonLd({ "@context": "https://schema.org", "@graph": rows.map(structuredData) }),
  /* Comments out: they are the stylesheet's, not the page's. */
  tokens: readFileSync(join(ROOT, "packages", "core", "src", "styles", "tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n\s*\n/g, "\n"),
  packages: LIST.map((p) => `<a href="./${p.id}/">${escape(p.name)}</a>`).join(""),
  install: escape(installCommand(rows[0])),
  collageAlt: escape(PREVIEW_ALT),
  /* One tile a package, in the list's order: its first scenario in either
     theme (the CSS shows one), what it is and what it needs. The first of
     the list, core, is where to start. */
  tiles: LIST.map((p, i) => {
    const row = rows[i];
    const img = (theme) =>
      `<img class="${theme}" src="./${PREVIEWS}/${p.id}-${theme}.png" width="1200" height="750" loading="lazy" alt="${escape(p.name)}: ${row.scenario}" />`;
    return `<li><a class="tile" href="./${p.id}/">
            <span class="shot">${img("light")}${img("dark")}${i === 0 ? '<span class="start">Start here</span>' : ""}</span>
            <h3>${escape(p.name)}</h3>
            <code>${escape(p.npm)} ${escape(row.version)}</code>
            <span class="role">${escape(p.role)}</span>
            <span class="needs">${dependencyLine(row)}</span>
          </a></li>`;
  }).join("\n          "),
  /* Each package's newest release, linked to its heading in the changelog. */
  news: LIST.map((p, i) => {
    const { path, release } = rows[i].changelog;
    return `<li><a href="./${path}#${release.anchor}"><strong>${escape(p.name)} ${escape(release.version)}</strong> – ${escape(release.title)} <span>(${escape(release.month)})</span></a></li>`;
  }).join("\n          "),
  count: String(urls.length - 1),
  /* A package's changelog stands in its group, the other documents in theirs. */
  index: rows
    .map(
      (row) => `<h3><a href="./${row.dir}/"><code>${escape(row.name)}</code></a></h3>
        <ul>${row.pages.map((page) => `<li><a href="./${row.dir}/${page.path}">${escape(page.name)}</a></li>`).join("")}<li><a href="./${row.changelog.path}">${escape(row.changelog.name)}</a></li></ul>`,
    )
    .concat(`<h3>Documents</h3>
        <ul>${concepts.map((document) => `<li><a href="./${document.path}">${escape(document.name)}</a></li>`).join("")}</ul>`)
    .join("\n        "),
  documents: concepts.map((document) => `<a href="./${document.path}">${escape(document.name)}</a>`).join(" · "),
  repository: REPOSITORY,
};
const FRONT_PAGE = readFileSync(join(ROOT, "scripts", "front-page.html"), "utf8");
const fill = (template, values) =>
  template.replace(/\{\{(\w+)\}\}/g, (slot, name) => {
    if (!(name in values)) throw new Error(`front-page.html has a slot nobody fills: ${slot}`);
    return values[name];
  });
writeFileSync(join(SITE, "index.html"), fill(FRONT_PAGE, front));
/* Before the guard, which fails on a preview that is not there. */
if (existsSync(join(ROOT, "scripts", PREVIEWS))) cpSync(join(ROOT, "scripts", PREVIEWS), join(SITE, PREVIEWS), { recursive: true });

/* A document page: the front page's layout - its head, header, foot and theme
   - with the document in place of the front page's <main>, and the layout's
   relative addresses climbing to the site's root. The document ends with
   "Suggest an edit on GitHub", as every demo page does. */
if (!/<main>[\s\S]*<\/main>/.test(FRONT_PAGE)) throw new Error("front-page.html has lost its <main>.");
for (const document of documents) {
  const up = "../".repeat(document.path.split("/").filter(Boolean).length);
  const layout = fill(FRONT_PAGE.replace(/<main>[\s\S]*<\/main>/, '<main class="document">\u0000</main>'), {
    ...front,
    head: headOf({ title: document.title, description: document.description, url: document.url }),
    jsonLd: "",
  }).replace(/(href="|src="|url\()\.\//g, `$1${up}`);
  mkdirSync(join(SITE, document.path), { recursive: true });
  const edit = `<p class="edit"><a href="${escape(editHref(document.title, document.url))}">${EDIT_LINK}</a></p>`;
  writeFileSync(join(SITE, document.path, "index.html"), layout.replace("\u0000", () => `${document.html}\n${edit}`));
}

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

/* The palette's index of the whole site: each demo searches its own fragment
   at once and fetches this for the other four on its first opening. */
const search = siteSearch(PACKAGES.map((dir) => readFileSync(join(SITE, dir, "search.json"), "utf8")));
writeFileSync(join(SITE, "search.json"), search);

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

## Documents

What the library is about as a whole, and what each release changed for a caller.

${documents
  .map(({ title, url, description, release }) => {
    const what = release === undefined ? description : `Every version's changes for a caller, newest first; the newest is ${release.version} – ${release.title} (${release.month}).`;
    return `- [${title.replace(/ – umriss-ui$/, "")}](${url}): ${what}`;
  })
  .join("\n")}
`,
);

/* The guard over what was written (search-visibility, Testing;
   sidebar-tree, seam 1): every address in the sitemap is a file with a title,
   a description, a canonical pointing at itself, an h1 and a favicon that is there, every forwarder
   stands outside the sitemap and points into it, and there is no other page
   file; every page has its Markdown twin and announces it, and every link
   in every llms.txt leads to a file (pages-as-markdown); the front page keeps
   its words, its links lead into the site and its tiles' previews are there
   and light enough (site-front-page); every document has its page, its links
   lead to sitemap addresses, it ends with a suggested edit naming it, no
   page links ADR-0032 or a changelog on GitHub, and "What's new" leads to a
   version on each changelog (concepts-and-changelog-pages); every find of
   the search lands on a sitemap page and an anchor it carries, and the index
   keeps its budget (one-search). A build that breaks
   it fails here, before it is deployed. */
const files = new Map();
const texts = new Map();
const images = new Map();
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const below = relative(SITE, dir);
    const at = HOME + (below === "" ? "" : `${below.split(sep).join("/")}/`);
    if (entry.isDirectory() && entry.name !== "assets") walk(join(dir, entry.name));
    else if (entry.name === "index.html") files.set(at, readFileSync(join(dir, entry.name), "utf8"));
    else if (/\.(md|txt)$/.test(entry.name)) texts.set(at + entry.name, readFileSync(join(dir, entry.name), "utf8"));
    else if (entry.name.endsWith(".png")) images.set(at + entry.name, statSync(join(dir, entry.name)).size);
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
  ...frontFaults(
    files.get(HOME) ?? "",
    HOME,
    urls,
    PROMISE,
    rows.map((row) => `${HOME}${row.dir}/`),
    images,
  ).map((fault) => `${HOME}: ${fault}`),
  ...documentFaults(
    documents.map((document) => document.url),
    files,
    /* A changelog may name a package's `llms-full.txt` - a file of the site,
       though no page of it. */
    [...urls, ...texts.keys()],
    HOME,
  ),
  ...whatsNewFaults(
    files.get(HOME) ?? "",
    HOME,
    files,
    rows.map((row) => row.changelog.url),
  ).map((fault) => `${HOME}: ${fault}`),
  ...urls.filter((url) => files.has(url) && !linksFavicon(files.get(url), url)).map((url) => `${url}: no favicon`),
  /* No props row says a prop accepts nothing: a `never` is a prohibition the
     reader merges away (types-without-holes), never a type to show. Every type
     of the library a cell or a definition names has a table or a definition,
     and every link to one finds its id. */
  ...PACKAGES.flatMap((dir) => {
    const types = JSON.parse(readFileSync(join(ROOT, "packages", dir, "demo", ".generated", "props.json"), "utf8"));
    return Object.values(types).flatMap((entry) => [
      ...entry.props
        .filter((prop) => prop.type === "never" || prop.type.startsWith("never |"))
        .map((prop) => `${dir}: ${entry.name}.${prop.name} is typed \`${prop.type}\``),
      ...[...entry.props.flatMap((prop) => prop.references ?? []), ...(entry.definition?.references ?? [])]
        .filter((name) => types[name] === undefined)
        .map((name) => `${dir}: ${entry.name} names \`${name}\`, which has neither a table nor a definition`),
    ]);
  }),
  ...typeLinkFaults(files),
  ...searchFaults(search, HOME, urls, files),
  /* Every export has a place on the site (ADR-0044): each name a package's
     entries export has an element with its anchor on its API index. */
  ...rows.flatMap((row) => {
    const index = join(ROOT, "packages", row.dir, "demo", ".generated", "api-index.json");
    return existsSync(index) ? apiIndexFaults(`${row.homepage}api/`, JSON.parse(readFileSync(index, "utf8")).anchors, files) : [];
  }),
  ...leaks,
];
if (faults.length > 0) throw new Error(`The built site fails its guard:\n${faults.join("\n")}`);

/* The consoles' proof of ownership, where there is one yet. */
const VERIFICATION = join(ROOT, "scripts", "site-verification");
if (existsSync(VERIFICATION)) {
  for (const file of readdirSync(VERIFICATION)) cpSync(join(VERIFICATION, file), join(SITE, file));
}
cpSync(join(ROOT, "scripts", PREVIEW), join(SITE, PREVIEW));

console.log(`\nsite/ is ready: ${rows.map((row) => `${row.dir}/ (${row.pages.length} pages)`).join(", ")}, ${documents.length} documents, index.html, sitemap.xml and llms.txt - ${urls.length} addresses, ${forwarders.length} forwarded.`);
