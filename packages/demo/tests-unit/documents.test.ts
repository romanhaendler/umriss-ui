/* The workspace's own documents as pages of the site
   (.scratch/concepts-and-changelog-pages, Testing Decisions): where a link
   inside a document leads once it is rendered, and what the page's head says. */

import { describe, expect, it } from "vitest";
import { DOCUMENTS, SOURCE_HOME, documentHref, newestRelease, readRelease, renderDocument } from "../src/tooling/documents";
import { ADR_0032 } from "../src/outline";

const HOME = "https://example.test/umriss-ui/";
const exists = (path: string) => ["docs/adr/0035-umriss-is-for-data-dense-applications.md", "packages/charts/docs/capabilities.md"].includes(path);

describe("a link inside a document", () => {
  it("to another rendered document becomes that document's site address", () => {
    expect(documentHref("design-language.md", "docs/standards.md", HOME, exists)).toBe("/umriss-ui/design-language/");
    expect(documentHref("../standards.md", "docs/adr/0032-what-umriss-is-not.md", HOME, exists)).toBe("/umriss-ui/standards/");
  });

  it("to any other file of the repository becomes its address on GitHub, on main", () => {
    expect(documentHref("0035-umriss-is-for-data-dense-applications.md", "docs/adr/0032-what-umriss-is-not.md", HOME, exists)).toBe(
      `${SOURCE_HOME}docs/adr/0035-umriss-is-for-data-dense-applications.md`,
    );
    expect(documentHref("../packages/charts/docs/capabilities.md", "docs/standards.md", HOME, exists)).toBe(`${SOURCE_HOME}packages/charts/docs/capabilities.md`);
  });

  it("keeps its anchor, and an anchor alone or an address elsewhere stays as it is", () => {
    expect(documentHref("design-language.md#dark-theme", "docs/standards.md", HOME, exists)).toBe("/umriss-ui/design-language/#dark-theme");
    expect(documentHref("../packages/charts/docs/capabilities.md#out", "docs/standards.md", HOME, exists)).toBe(`${SOURCE_HOME}packages/charts/docs/capabilities.md#out`);
    expect(documentHref("#sources", "docs/standards.md", HOME, exists)).toBe("#sources");
    expect(documentHref("https://www.isa.org/", "docs/standards.md", HOME, exists)).toBe("https://www.isa.org/");
  });

  it("to a file that does not exist stops the build, naming both", () => {
    expect(() => documentHref("palette.md", "docs/design-language.md", HOME, exists)).toThrow(/docs\/design-language\.md links palette\.md/);
  });
});

describe("a rendered document", () => {
  const render = (markdown: string) => renderDocument(markdown, "docs/standards.md", { home: HOME, exists, adrs: { "0035": `${SOURCE_HOME}docs/adr/0035-umriss-is-for-data-dense-applications.md` } });

  it("keeps its first heading as the h1, gives every heading an address, and links its ADR numbers", () => {
    const { html } = render("# The standards\n\nSee ADR-0035 and [the design](design-language.md).\n\n## What it follows\n\n## What it follows\n");
    expect(html).toContain('<h1 id="the-standards">The standards</h1>');
    expect(html).toContain(`<a href="${SOURCE_HOME}docs/adr/0035-umriss-is-for-data-dense-applications.md">ADR-0035</a>`);
    expect(html).toContain('<a href="/umriss-ui/design-language/">the design</a>');
    expect(html).toContain('<h2 id="what-it-follows">');
    expect(html).toContain('<h2 id="what-it-follows-1">');
  });

  it("links an ADR number after a code block, and leaves the block alone", () => {
    const { html } = render("# A\n\n```css\n:root { color-scheme: light dark; }\n```\n\nThe library sets `color-scheme` nowhere (ADR-0035), not on `html`.\n");
    expect(html).toContain(`<a href="${SOURCE_HOME}docs/adr/0035-umriss-is-for-data-dense-applications.md">ADR-0035</a>`);
    expect(html).toContain("<pre><code class=\"language-css\">:root { color-scheme: light dark; }");
  });

  it("shows markup written in its text, never passes it through", () => {
    expect(render("# A\n\n<script>alert(1)</script>\n").html).not.toContain("<script>");
  });

  it("is described by its first paragraph, without markup, cut at a word before 160 characters", () => {
    expect(render("# A\n\n**Precise and quiet** — the idea of [`core`](design-language.md).\n").description).toBe("Precise and quiet — the idea of core.");
    const long = render(`# A\n\n${"word ".repeat(60)}\n`).description;
    expect(long.length).toBeLessThanOrEqual(160);
    expect(long).toMatch(/word…$/);
  });

  it("is described by its first paragraph after an ADR's status lines", () => {
    expect(render("# A\n\nStatus: accepted\nDate:   2026-09\n\nThe reason.\n").description).toBe("The reason.");
  });
});

it("ADR-0032's address in the shell is its document's page on the site", () => {
  const page = DOCUMENTS.find((document) => document.source === "docs/adr/0032-what-umriss-is-not.md")!;
  expect(ADR_0032).toBe(`https://romanhaendler.github.io/umriss-ui/${page.path}`);
});

describe("a changelog's version heading", () => {
  it("reads its version, its title and its month, and names its anchor", () => {
    expect(readRelease("0.24.0 – The select's own list (Oct. 2026)")).toEqual({ version: "0.24.0", title: "The select's own list", month: "Oct. 2026", anchor: "v0-24-0" });
    expect(readRelease("0.2.0-rc.1 – Styles that load themselves (Sep. 2026)")?.anchor).toBe("v0-2-0-rc-1");
  });

  it("is not one without its month", () => {
    expect(readRelease("0.24.0 – The select's own list")).toBeUndefined();
  });

  it("is not one without a version", () => {
    expect(readRelease("A plan one can read (Sep. 2026)")).toBeUndefined();
    expect(readRelease("Unreleased")).toBeUndefined();
  });

  it("the newest is the first after the unreleased work, and one of another shape stops the build", () => {
    const changelog = (first: string) => `# Changes\n\nIntro.\n\n## Unreleased\n\n### Added\n\n- More.\n\n## ${first}\n\n## 0.23.0 – Before (Sep. 2026)\n`;
    expect(newestRelease(changelog("0.24.0 – Now (Oct. 2026)"), "packages/core/CHANGELOG.md").version).toBe("0.24.0");
    expect(() => newestRelease(changelog("0.24.0 – Now"), "packages/core/CHANGELOG.md")).toThrow(/packages\/core\/CHANGELOG\.md/);
  });

  it("is addressed by its version when rendered, and a \"Changed\" section is marked", () => {
    const { html } = renderDocument("# Changes\n\n## 0.24.0 – Now (Oct. 2026)\n\n### Changed\n\n## internal 0.10.0 – A (Sep. 2026)\n\n## internal 0.10.0 – B (Sep. 2026)\n", "packages/core/CHANGELOG.md", { home: HOME, exists, adrs: {} });
    expect(html).toContain('<h2 id="v0-24-0">');
    expect(html).toContain('<h3 id="changed" class="changed">Changed</h3>');
    expect(html).toContain('<h2 id="v0-10-0">');
    expect(html).toContain('<h2 id="v0-10-0-1">');
  });

  it("each package's changelog is a page in its package's directory", () => {
    expect(DOCUMENTS.filter((document) => document.changelogOf !== undefined).map((document) => [document.source, document.path, document.title])).toEqual(
      ["core", "charts", "table", "schedule", "calculation"].map((id) => [`packages/${id}/CHANGELOG.md`, `${id}/changelog/`, `Changelog – @umriss-ui/${id}`]),
    );
  });
});
