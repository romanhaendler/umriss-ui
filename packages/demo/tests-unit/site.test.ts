/* The built site's guard and its forwarders: what a search engine and a
   reader with an old link meet (.scratch/sidebar-tree, Testing Decisions,
   seam 1). */

import { describe, expect, it } from "vitest";
import { documentFaults, forwarderHtml, frontFaults, siteFaults, twinFaults, typeLinkFaults } from "../src/tooling/site";

const HOME = "https://example.test/umriss-ui/charts/";
const page = (url: string) =>
  `<title>Installation</title><meta name="description" content="Install it." /><link rel="canonical" href="${url}" /><h1>Installation</h1>`;
const forwarder = { url: `${HOME}getting-started/`, to: `${HOME}installation/`, title: "Installation" };
const urls = [HOME, `${HOME}installation/`];
const files = new Map([
  [HOME, page(HOME)],
  [`${HOME}installation/`, page(`${HOME}installation/`)],
  [forwarder.url, forwarderHtml(forwarder)],
]);

describe("a forwarder", () => {
  const html = forwarderHtml(forwarder);

  it("names the current address as canonical and is kept out of the index", () => {
    expect(html).toContain(`<link rel="canonical" href="${forwarder.to}" />`);
    expect(html).toContain('<meta name="robots" content="noindex" />');
    expect(html).toContain("<title>Installation</title>");
  });

  it("forwards at once, carrying the anchor, and leaves a plain link for a reader without JavaScript", () => {
    expect(html).toContain('<meta http-equiv="refresh" content="0; url=/umriss-ui/charts/installation/" />');
    expect(html).toContain('location.replace("/umriss-ui/charts/installation/" + location.hash)');
    expect(html).toContain('<a href="/umriss-ui/charts/installation/">Installation</a>');
  });
});

describe("the built site's guard", () => {
  it("passes a site of sitemap pages and declared forwarders", () => {
    expect(siteFaults(urls, [forwarder], files)).toEqual([]);
  });

  it("fails on a page file that is neither in the sitemap nor a declared forwarder", () => {
    expect(siteFaults(urls, [], files)).toEqual([`${forwarder.url}: in no sitemap entry and no forwarder`]);
  });

  it("fails on a forwarder whose target is not in the sitemap", () => {
    const astray = { ...forwarder, to: `${HOME}nowhere/` };
    expect(siteFaults(urls, [astray], new Map([...files, [astray.url, forwarderHtml(astray)]]))).toEqual([
      `${astray.url}: forwards to ${astray.to}, which is not in the sitemap`,
    ]);
  });

  it("fails on a forwarder in the sitemap, and on a declared forwarder with no file", () => {
    expect(siteFaults([...urls, forwarder.url], [forwarder], files)).toContain(`${forwarder.url}: a forwarder in the sitemap`);
    const without = new Map(files);
    without.delete(forwarder.url);
    expect(siteFaults(urls, [forwarder], without)).toEqual([`${forwarder.url}: no forwarder file`]);
  });

  it("still fails on a sitemap address without its file or its head", () => {
    expect(siteFaults([...urls, `${HOME}axis/`], [forwarder], files)).toEqual([`${HOME}axis/: no file`]);
    const bare = new Map([...files, [`${HOME}installation/`, "<h1>Installation</h1>"]]);
    expect(siteFaults(urls, [forwarder], bare)).toEqual([`${HOME}installation/: no title, description, canonical`]);
  });
});

describe("the guard over the text for agents (.scratch/pages-as-markdown)", () => {
  const alternate = (href: string) => `<link rel="alternate" type="text/markdown" href="${href}" />`;
  const twinPages = [
    { url: HOME, name: "@umriss-ui/charts", twin: `${HOME}index.md` },
    { url: `${HOME}installation/`, name: "Installation", twin: `${HOME}installation.md` },
  ];
  const pages = new Map([
    [HOME, page(HOME) + alternate("/umriss-ui/charts/index.md")],
    [`${HOME}installation/`, page(`${HOME}installation/`) + alternate("/umriss-ui/charts/installation.md")],
  ]);
  const texts = new Map([
    [`${HOME}index.md`, "# @umriss-ui/charts\n\n> Package…\n"],
    [`${HOME}installation.md`, "# Installation\n\n> Package…\n"],
    [`${HOME}llms.txt`, `# @umriss-ui/charts\n\n- [Installation](${HOME}installation.md): Install it.\n- [Axis](#/axis)\n`],
    [`${HOME}llms-full.txt`, "# @umriss-ui/charts 1.0.0\n"],
    ["https://example.test/umriss-ui/llms.txt", `- [@umriss-ui/charts](${HOME}llms.txt): Charts. Full text: [llms-full.txt](${HOME}llms-full.txt)\n`],
  ]);

  it("passes a site whose every page has its twin, announces it once, and whose indexes lead to files", () => {
    expect(twinFaults(twinPages, pages, texts)).toEqual([]);
  });

  it("fails on a page without its twin, with an empty one, or one that does not begin with its name", () => {
    const without = new Map(texts);
    without.delete(`${HOME}index.md`);
    without.set(`${HOME}installation.md`, "");
    expect(twinFaults(twinPages, pages, without)).toEqual([`${HOME}index.md: no twin`, `${HOME}installation.md: no twin`]);
    expect(twinFaults(twinPages, pages, new Map([...texts, [`${HOME}installation.md`, "## Installation\n"]]))).toEqual([
      `${HOME}installation.md: does not begin with "# Installation"`,
    ]);
  });

  it("fails on a head without its alternate link, with two, or with one that points elsewhere", () => {
    const heads = (html: string) => new Map([...pages, [`${HOME}installation/`, page(`${HOME}installation/`) + html]]);
    expect(twinFaults(twinPages, heads(""), texts)).toEqual([`${HOME}installation/: 0 alternate links to its twin, not 1`]);
    expect(twinFaults(twinPages, heads(alternate("/umriss-ui/charts/installation.md").repeat(2)), texts)).toEqual([
      `${HOME}installation/: 2 alternate links to its twin, not 1`,
    ]);
    expect(twinFaults(twinPages, heads(alternate("/umriss-ui/charts/index.md")), texts)).toEqual([
      `${HOME}installation/: its alternate link points at ${HOME}index.md, not at ${HOME}installation.md`,
    ]);
  });

  it("fails on a link in an llms.txt that leads to no file of the site", () => {
    const astray = new Map([...texts, [`${HOME}llms.txt`, `- [Axis](${HOME}axis.md): Axes.\n- [Installation](${HOME}installation/)\n`]]);
    expect(twinFaults(twinPages, pages, astray)).toEqual([`${HOME}llms.txt: links ${HOME}axis.md, which is no file of the site`]);
  });
});

describe("the guard over the front page (.scratch/site-front-page)", () => {
  const ROOT = "https://example.test/umriss-ui/";
  const sitemap = [
    ROOT,
    `${ROOT}core/`,
    `${ROOT}core/installation/`,
    `${ROOT}core/language/`,
    `${ROOT}table/`,
    `${ROOT}table/alarmlist/`,
    `${ROOT}charts/limitline/`,
    `${ROOT}charts/benchmark/`,
  ];
  const PROMISE =
    "React components for data-dense screens – control rooms, dashboards, planning – built to the industrial standards for alarms and limits, in English and German.";
  /* Two packages are enough to hold the tiles to their order. */
  const landings = [`${ROOT}core/`, `${ROOT}table/`];
  const images = new Map(["core", "table"].flatMap((id) => [`${ROOT}previews/${id}-light.png`, `${ROOT}previews/${id}-dark.png`].map((url) => [url, 120_000])));
  const tile = (id: string, name: string, { href = `./${id}/`, dark = `./previews/${id}-dark.png`, alt = `${name}: Work through the alerts` } = {}) =>
    `<a class="tile" href="${href}"><img class="light" src="./previews/${id}-light.png" alt="${alt}" loading="lazy" /><img class="dark" src="${dark}" alt="${alt}" loading="lazy" /><h3>${name}</h3><code>@umriss-ui/${id}</code></a>`;
  const front = ({
    h1 = "<h1>umriss-ui</h1>",
    started = "./core/installation/",
    claim = "./charts/benchmark/",
    extra = "",
    index = sitemap.slice(1),
    tiles = tile("core", "Core") + tile("table", "Table"),
  } = {}) => `
    <script>try { localStorage.getItem("umriss-ui:theme") } catch (e) {}</script>
    <header><a href="./">umriss-ui</a><nav aria-label="Packages"><a href="./core/">Core</a></nav></header>
    <main>${h1}<p>${PROMISE}</p>
      <a class="button" href="${started}">Get started</a><a class="button" href="./core/">Explore the scenarios</a>
      <code>npm install @umriss-ui/core</code>
      ${tiles}
      <a href="./table/alarmlist/">ISA-18.2 alarm lists</a><a href="./charts/limitline/">ISA-101 limits and verdicts</a>
      <a href="${claim}"><strong>Canvas charts, measured</strong> Benchmark</a><a href="./core/language/">English and German wording</a>
      <a href="./llms.txt">Written for coding agents too</a>${extra}
      <details><summary>Every page (${index.length})</summary>${index.map((url) => `<a href="${url}">a page</a>`).join("")}</details>
    </main>`;

  it("passes a front page with its words, its buttons, its claims and its index", () => {
    expect(frontFaults(front(), ROOT, sitemap, PROMISE, landings, images)).toEqual([]);
  });

  it("fails without exactly one h1 reading umriss-ui", () => {
    expect(frontFaults(front({ h1: "<h1>Umriss UI</h1>" }), ROOT, sitemap, PROMISE, landings, images)).toEqual(['not one h1 "umriss-ui" (found: Umriss UI)']);
    expect(frontFaults(front({ h1: "<h1>umriss-ui</h1><h1>umriss-ui</h1>" }), ROOT, sitemap, PROMISE, landings, images)).toEqual(['not one h1 "umriss-ui" (found: umriss-ui, umriss-ui)']);
  });

  it("fails on a button or a claim that leads to no page of the site", () => {
    expect(frontFaults(front({ started: "./core/getting-started/" }), ROOT, sitemap, PROMISE, landings, images)).toEqual([
      `"Get started" links ${ROOT}core/getting-started/, which is no sitemap address`,
    ]);
    expect(frontFaults(front({ claim: "./charts/bench/" }), ROOT, sitemap, PROMISE, landings, images)).toEqual([`"Canvas charts, measured" links ${ROOT}charts/bench/, which is no sitemap address`]);
    expect(frontFaults(front().replace("Get started", "Start"), ROOT, sitemap, PROMISE, landings, images)).toEqual(['no link "Get started"']);
  });

  it("fails on twenty addresses linked outside the index, or a sitemap address the index leaves out", () => {
    const many = Array.from({ length: 11 }, (_, i) => `<a href="https://example.test/${i}">${i}</a>`).join("");
    expect(frontFaults(front({ extra: many }), ROOT, sitemap, PROMISE, landings, images)).toEqual(["20 addresses linked outside the index, not fewer than 20"]);
    expect(frontFaults(front({ index: sitemap.slice(2) }), ROOT, sitemap, PROMISE, landings, images)).toEqual([`the index does not link ${ROOT}core/`]);
  });

  it("fails without the promise, the install command or the theme script", () => {
    const bare = front().replace(PROMISE, "").replace("npm install @umriss-ui/core", "").replace("umriss-ui:theme", "");
    expect(frontFaults(bare, ROOT, sitemap, PROMISE, landings, images)).toEqual(["no promise", "no install command", "no theme script"]);
  });

  it("fails on a tile missing, out of order or leading to no landing page", () => {
    expect(frontFaults(front({ tiles: tile("core", "Core") }), ROOT, sitemap, PROMISE, landings, images)).toEqual(["1 tiles, not 2"]);
    expect(frontFaults(front({ tiles: tile("table", "Table") + tile("core", "Core") }), ROOT, sitemap, PROMISE, landings, images)).toEqual([
      `the tile "Table" links ${ROOT}table/, not ${ROOT}core/`,
      `the tile "Core" links ${ROOT}core/, not ${ROOT}table/`,
    ]);
    expect(frontFaults(front(), ROOT, sitemap.filter((url) => url !== `${ROOT}table/`), PROMISE, landings, images)).toContain(`the tile "Table" links ${ROOT}table/, which is no sitemap address`);
  });

  it("fails on a preview that is not in the site, or not under 300 kB", () => {
    expect(frontFaults(front({ tiles: tile("core", "Core", { dark: "./previews/core-night.png" }) + tile("table", "Table") }), ROOT, sitemap, PROMISE, landings, images)).toEqual([
      `the tile "Core" shows ${ROOT}previews/core-night.png, which is no file of the site`,
    ]);
    const heavy = new Map([...images, [`${ROOT}previews/table-dark.png`, 300_000]]);
    expect(frontFaults(front(), ROOT, sitemap, PROMISE, landings, heavy)).toEqual([`the tile "Table" shows ${ROOT}previews/table-dark.png at 300000 bytes, not under 300 kB`]);
    const one = tile("core", "Core").replace(/<img class="dark"[^>]*>/, "");
    expect(frontFaults(front({ tiles: one + tile("table", "Table") }), ROOT, sitemap, PROMISE, landings, images)).toEqual(['the tile "Core" has 1 previews, not a light and a dark one']);
  });

  it("fails on a preview whose alternative text does not name its package and what it shows", () => {
    expect(frontFaults(front({ tiles: tile("core", "Core", { alt: "Core" }) + tile("table", "Table") }), ROOT, sitemap, PROMISE, landings, images)).toEqual([
      'the tile "Core" has a preview whose alternative text is not "Core: <what it shows>"',
    ]);
  });
});

describe("the type links' guard (.scratch/types-without-holes)", () => {
  const search = `${HOME}search/`;
  const view = `${HOME}view/`;
  const linked = new Map([
    [search, '<a href="#type-TableRef">TableRef</a><h4 id="type-TableRef"></h4><a href="../view/#type-TableSnapshot">TableSnapshot</a>'],
    [view, '<h3 id="type-TableSnapshot"></h3>'],
  ]);

  it("passes where every link to a type finds its id on its page", () => {
    expect(typeLinkFaults(linked)).toEqual([]);
  });

  it("fails on a link to a type whose id is not on the page it names, or to no page", () => {
    const astray = new Map([...linked, [view, "<h3></h3>"], [`${HOME}axis/`, '<a href="../gone/#type-Axis">Axis</a>']]);
    expect(typeLinkFaults(astray)).toEqual([
      `${search}: links #type-TableSnapshot on ${view}, which has no such id`,
      `${HOME}axis/: links #type-Axis on ${HOME}gone/, which has no such id`,
    ]);
  });
});

describe("the guard over the document pages (.scratch/concepts-and-changelog-pages)", () => {
  const SITE = "https://example.test/umriss-ui/";
  const document = `${SITE}standards/`;
  const github = "https://github.com/romanhaendler/umriss-ui";
  const pageWith = (main: string) => `<header><a href="../">umriss-ui</a></header><main class="document">${main}</main><footer><a href="../llms.txt">llms.txt</a></footer>`;
  const sitemap = [SITE, document, `${SITE}design-language/`];
  const fine = pageWith(`<a href="/umriss-ui/design-language/#dark-theme">it</a> <a href="${github}/blob/main/docs/adr/0035-x.md">ADR-0035</a> <a href="https://www.isa.org/">ISA</a>`);

  it("passes a document page whose links lead to sitemap addresses, to the repository or elsewhere", () => {
    expect(documentFaults([document], new Map([[document, fine]]), sitemap, SITE)).toEqual([]);
  });

  it("fails on a document in the list without a page", () => {
    expect(documentFaults([document], new Map(), sitemap, SITE)).toEqual([`${document}: no page for this document`]);
  });

  it("fails on a link of the document into the site that is no sitemap address", () => {
    expect(documentFaults([document], new Map([[document, pageWith('<a href="/umriss-ui/palette/">it</a>')]]), sitemap, SITE)).toEqual([
      `${document}: links ${SITE}palette/, which is no sitemap address`,
    ]);
  });

  it("fails on any page that links ADR-0032 on GitHub", () => {
    const old = `<a href="${github}/blob/main/docs/adr/0032-what-umriss-is-not.md">ADR-0032</a>`;
    expect(documentFaults([document], new Map([[document, fine], [`${SITE}core/button/`, old]]), sitemap, SITE)).toEqual([
      `${SITE}core/button/: links ADR-0032 on GitHub, not its page on the site`,
    ]);
  });
});
