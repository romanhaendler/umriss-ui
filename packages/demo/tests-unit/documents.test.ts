/* The workspace's own documents as pages of the site
   (.scratch/concepts-and-changelog-pages, Testing Decisions): where a link
   inside a document leads once it is rendered, and what the page's head says. */

import { describe, expect, it } from "vitest";
import { DOCUMENTS, SOURCE_HOME, documentHref, renderDocument } from "../src/tooling/documents";
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
