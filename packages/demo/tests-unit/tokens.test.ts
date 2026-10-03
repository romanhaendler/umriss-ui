// @vitest-environment jsdom
/* The token reader and the token table (.scratch/theming-and-wording-reference,
   01): a small stylesheet in, the rows that come out. The HTML is read through
   the DOM, as the props table's test reads it. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { readTokens } from "../src/tooling/tokens";
import { referenceHtml, referenceMarkdown } from "../src/tooling/referenceTable";
import { missingTokens, tokenTable } from "../src/tooling/tokenTable";

const LAYERS = "@layer umriss.tokens, umriss.base, umriss.components;";

const SHEET = `${LAYERS}
:root { --u-outside-layer: 1px; }
@layer umriss.base { :root { --u-other-layer: 1px; } }
@layer umriss.tokens {
  :root {
    --u-loose: 2px;

    /* ---- Neutral: ink and paper ---- */
    /* The page's ground. */
    --u-color-bg: light-dark(#fafafa, #0f0f10);
    --u-hairline: light-dark(rgba(23, 23, 23, 0.06), rgba(255, 255, 255, 0.07)); /* inner dividing lines */
    --u-edge: 0 0 0 1px var(--u-hairline);
    /* First half. */
    /* Second half. */
    --u-ground: var(--u-color-bg);

    /* ---- Motion ----
       Explains a change of state.

       Never decorates. */
    --u-transition: 120ms var(--u-ease, ease-out);
    --u-shadow:
      0 1px 2px light-dark(rgba(0, 0, 0, 0.1),
      rgba(0, 0, 0, 0.4));
  }

  .button { --u-not-a-token: 1px; }

  /* ---- Stacking order ---- */
  :root {
    --u-z-popover: 900;
  }

  @media (prefers-reduced-motion: reduce) {
    :root {
      --u-transition: 0ms;
    }
  }
}`;

const groups = readTokens(SHEET);
const token = (name: string) => groups.flatMap((group) => group.tokens).find((one) => one.name === name);

describe("readTokens", () => {
  it("reads only what is declared on :root inside the tokens layer", () => {
    const names = groups.flatMap((group) => group.tokens.map((one) => one.name));
    expect(names).toEqual(["--u-loose", "--u-color-bg", "--u-hairline", "--u-edge", "--u-ground", "--u-transition", "--u-shadow", "--u-z-popover"]);
  });

  it("groups by the nearest section comment before, with its body as the group's note", () => {
    expect(groups.map((group) => [group.name, group.note])).toEqual([
      ["", []],
      ["Neutral: ink and paper", []],
      ["Motion", ["Explains a change of state.", "Never decorates."]],
      ["Stacking order", []],
    ]);
  });

  it("splits light-dark() into the two columns, also inside a longer value", () => {
    expect(token("--u-color-bg")).toMatchObject({ light: "#fafafa", dark: "#0f0f10" });
    expect(token("--u-hairline")).toMatchObject({ light: "rgba(23, 23, 23, 0.06)", dark: "rgba(255, 255, 255, 0.07)" });
    expect(token("--u-shadow")).toMatchObject({ light: "0 1px 2px rgba(0, 0, 0, 0.1)", dark: "0 1px 2px rgba(0, 0, 0, 0.4)" });
  });

  it("lets a single value stand in both columns, the dark one empty", () => {
    expect(token("--u-z-popover")).toEqual({ name: "--u-z-popover", light: "900", comment: "", colour: false });
    expect(token("--u-edge")!.dark).toBeUndefined();
  });

  it("reads the comment before a declaration, all of it, and the one after it on the same line", () => {
    expect(token("--u-color-bg")!.comment).toBe("The page's ground.");
    expect(token("--u-hairline")!.comment).toBe("inner dividing lines");
    /* The trailing comment of the line before is not the next one's. */
    expect(token("--u-edge")!.comment).toBe("");
    expect(token("--u-ground")!.comment).toBe("First half. Second half.");
    /* A section's body is the group's note, not its first token's comment. */
    expect(token("--u-transition")!.comment).toBe("");
  });

  it("marks a token redeclared under reduced motion with its value there", () => {
    expect(token("--u-transition")!.reducedMotion).toBe("0ms");
    expect(token("--u-color-bg")!.reducedMotion).toBeUndefined();
  });

  it("counts a token as a colour by its name, a colour value, or a reference to a colour token", () => {
    const colours = groups.flatMap((group) => group.tokens.filter((one) => one.colour).map((one) => one.name));
    expect(colours).toEqual(["--u-color-bg", "--u-hairline", "--u-ground"]);
  });
});

describe("the token table", () => {
  const table = tokenTable(groups);
  const row = (name: string) => table.groups.flatMap((group) => group.rows).find((one) => one.anchor === `token-${name.slice(2)}`)!;

  it("links a var() reference to the token's row and keeps the fallback in code", () => {
    expect(row("--u-transition").cells[1]).toEqual([
      { kind: "code", text: "120ms var(" },
      { kind: "link", text: "--u-ease", href: "#token-u-ease" },
      { kind: "code", text: ", ease-out)" },
    ]);
  });

  it("writes every row with its anchor, a swatch for a colour in each column's scheme, and 'same' for one value", () => {
    const host = document.createElement("div");
    host.innerHTML = referenceHtml(table);
    expect([...host.querySelectorAll("tbody tr")].map((one) => one.id)).toEqual([
      "token-u-loose",
      "token-u-color-bg",
      "token-u-hairline",
      "token-u-edge",
      "token-u-ground",
      "token-u-transition",
      "token-u-shadow",
      "token-u-z-popover",
    ]);
    const swatches = [...host.querySelectorAll("#token-u-color-bg .tokenSwatch")];
    expect(swatches.map((one) => [one.closest("td")!.dataset.label, one.getAttribute("aria-hidden"), one.getAttribute("style")])).toEqual([
      ["Light", "true", "background:var(--u-color-bg);color-scheme:light"],
      ["Dark", "true", "background:var(--u-color-bg);color-scheme:dark"],
    ]);
    expect(host.querySelector("#token-u-edge .tokenSwatch")).toBeNull();
    expect(host.querySelector('#token-u-edge td[data-label="Dark"]')!.textContent).toBe("same");
    expect(host.querySelector("#token-u-transition")!.textContent).toContain("0ms under reduced motion.");
    expect(host.querySelector('#token-u-transition a[href="#token-u-ease"]')!.textContent).toBe("--u-ease");
    expect([...host.querySelectorAll("h3")].map((one) => one.textContent)).toEqual(["Neutral: ink and paper", "Motion", "Stacking order"]);
    expect(host.querySelector("h3 + p")!.textContent).toBe("Explains a change of state.");
  });

  it("writes the same rows as Markdown, without the swatches", () => {
    const markdown = referenceMarkdown(table);
    const rows = markdown.split("\n").filter((line) => line.startsWith("| `--u-"));
    expect(rows.map((line) => line.split(" | ")[0]!.slice(2))).toEqual([
      "`--u-loose`",
      "`--u-color-bg`",
      "`--u-hairline`",
      "`--u-edge`",
      "`--u-ground`",
      "`--u-transition`",
      "`--u-shadow`",
      "`--u-z-popover`",
    ]);
    expect(markdown).toContain("| `--u-color-bg` | `#fafafa` | `#0f0f10` | The page's ground. |");
    expect(markdown).toContain("| `--u-z-popover` | `900` | same | — |");
    expect(markdown).toContain("##### Motion\n\nExplains a change of state.\n\nNever decorates.");
  });
});

describe("core's stylesheet", () => {
  const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "..", "core", "src", "styles", "tokens.css"), "utf8");

  it("yields a row and an anchor for every custom property it declares, counted on the text", () => {
    const html = referenceHtml(tokenTable(readTokens(css)));
    expect(missingTokens(css, html)).toEqual([]);
    expect(missingTokens(css, html.replace('id="token-u-color-accent"', ""))).toEqual(["--u-color-accent"]);
  });

  it("carries no German in its comments", () => {
    expect(css).not.toMatch(/Tinte|Papier|\b(und|der|die|das)\b/);
  });
});
