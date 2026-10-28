/* The gate over a package README's relative links (ticket 13).

   A README is read on npm, where only the package's `files` and what npm
   always adds (README, LICENSE, package.json) are present. A relative link
   to anything else is dead there, so the gate reports it. What is checked
   here is the reader against small texts; `pnpm check:site` runs it on each
   shipped README. */

import { describe, expect, it } from "vitest";
import { deadLinks } from "../../../scripts/checkReadmeLinks";

const FILES = ["dist", "docs/llms-full.md", "CHANGELOG.md"];

describe("deadLinks", () => {
  it("reports a relative link to a file the package does not ship", () => {
    const readme = "See [API.md](API.md) and [the standards](../../docs/standards.md#isa).";
    expect(deadLinks(readme, FILES)).toEqual(["API.md", "../../docs/standards.md"]);
  });

  it("accepts a link to a shipped file, a file under a shipped directory, and npm's own files", () => {
    const readme = "[llms](docs/llms-full.md) [log](CHANGELOG.md) [js](dist/index.js) [self](README.md) [lic](LICENSE)";
    expect(deadLinks(readme, FILES)).toEqual([]);
  });

  it("ignores absolute URLs, mailto links and same-page anchors", () => {
    const readme = "[repo](https://github.com/x/y) [mail](mailto:a@b.c) [here](#testing)";
    expect(deadLinks(readme, FILES)).toEqual([]);
  });

  it("reads reference-style definitions too", () => {
    const readme = "See [the design][design].\n\n[design]: ../../docs/design-language.md\n";
    expect(deadLinks(readme, FILES)).toEqual(["../../docs/design-language.md"]);
  });

  it("does not read links inside fenced code", () => {
    const readme = "```md\n[x](API.md)\n```\n";
    expect(deadLinks(readme, FILES)).toEqual([]);
  });
});
