/* The built site's guard and its forwarders: what a search engine and a
   reader with an old link meet (.scratch/sidebar-tree, Testing Decisions,
   seam 1). */

import { describe, expect, it } from "vitest";
import { forwarderHtml, frontFaults, siteFaults, twinFaults, typeLinkFaults } from "../src/tooling/site";

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
  const sitemap = [ROOT, `${ROOT}core/`, `${ROOT}core/installation/`, `${ROOT}core/language/`, `${ROOT}table/alarmlist/`, `${ROOT}charts/limitline/`, `${ROOT}charts/benchmark/`];
  const PROMISE =
    "React components for data-dense screens – control rooms, dashboards, planning – built to the industrial standards for alarms and limits, in English and German.";
  const front = ({ h1 = "<h1>umriss-ui</h1>", started = "./core/installation/", claim = "./charts/benchmark/", extra = "", index = sitemap.slice(1) } = {}) => `
    <script>try { localStorage.getItem("umriss-ui:theme") } catch (e) {}</script>
    <header><a href="./">umriss-ui</a><nav aria-label="Packages"><a href="./core/">Core</a></nav></header>
    <main>${h1}<p>${PROMISE}</p>
      <a class="button" href="${started}">Get started</a><a class="button" href="./core/">Explore the scenarios</a>
      <code>npm install @umriss-ui/core</code>
      <a href="./table/alarmlist/">ISA-18.2 alarm lists</a><a href="./charts/limitline/">ISA-101 limits and verdicts</a>
      <a href="${claim}"><strong>Canvas charts, measured</strong> Benchmark</a><a href="./core/language/">English and German wording</a>
      <a href="./llms.txt">Written for coding agents too</a>${extra}
      <details><summary>Every page (${index.length})</summary>${index.map((url) => `<a href="${url}">a page</a>`).join("")}</details>
    </main>`;

  it("passes a front page with its words, its buttons, its claims and its index", () => {
    expect(frontFaults(front(), ROOT, sitemap, PROMISE)).toEqual([]);
  });

  it("fails without exactly one h1 reading umriss-ui", () => {
    expect(frontFaults(front({ h1: "<h1>Umriss UI</h1>" }), ROOT, sitemap, PROMISE)).toEqual(['not one h1 "umriss-ui" (found: Umriss UI)']);
    expect(frontFaults(front({ h1: "<h1>umriss-ui</h1><h1>umriss-ui</h1>" }), ROOT, sitemap, PROMISE)).toEqual(['not one h1 "umriss-ui" (found: umriss-ui, umriss-ui)']);
  });

  it("fails on a button or a claim that leads to no page of the site", () => {
    expect(frontFaults(front({ started: "./core/getting-started/" }), ROOT, sitemap, PROMISE)).toEqual([
      `"Get started" links ${ROOT}core/getting-started/, which is no sitemap address`,
    ]);
    expect(frontFaults(front({ claim: "./charts/bench/" }), ROOT, sitemap, PROMISE)).toEqual([`"Canvas charts, measured" links ${ROOT}charts/bench/, which is no sitemap address`]);
    expect(frontFaults(front().replace("Get started", "Start"), ROOT, sitemap, PROMISE)).toEqual(['no link "Get started"']);
  });

  it("fails on twenty addresses linked outside the index, or a sitemap address the index leaves out", () => {
    const many = Array.from({ length: 12 }, (_, i) => `<a href="https://example.test/${i}">${i}</a>`).join("");
    expect(frontFaults(front({ extra: many }), ROOT, sitemap, PROMISE)).toEqual(["20 addresses linked outside the index, not fewer than 20"]);
    expect(frontFaults(front({ index: sitemap.slice(2) }), ROOT, sitemap, PROMISE)).toEqual([`the index does not link ${ROOT}core/`]);
  });

  it("fails without the promise, the install command or the theme script", () => {
    const bare = front().replace(PROMISE, "").replace("npm install @umriss-ui/core", "").replace("umriss-ui:theme", "");
    expect(frontFaults(bare, ROOT, sitemap, PROMISE)).toEqual(["no promise", "no install command", "no theme script"]);
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
