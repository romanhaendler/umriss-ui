/* What an accessibility check of the demos counts as a finding - the same rule
   for every demo (table-demo: "Tolerated colour pairs are the ones ui's suite
   tolerates, with the same written reasons; none is added").

   Brought over from `packages/core/tests-visual/accessibility.spec.ts`,
   where the list came about and where its two guards stand: every entry
   carries a reason, and an open one points at a follow-up. */

import type AxeBuilder from "@axe-core/playwright";

/* Checked against WCAG 2.1 AA - the scope the library keeps as its definition
   of done. Axe's "best-practice" rules are expressly not included: they are
   recommendations with no standard behind them, and a check that reports
   opinions as errors gets switched off rather than read. */
export const STANDARDS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/**
 * Individually justified exceptions - **never** blanket ones.
 *
 * Deliberately no `disableRules()`: switching a whole rule off for a page
 * would hide the real findings of that rule as well. What is excepted instead
 * is exactly one colour pair, and every other pair goes on failing - on every
 * page.
 *
 * Every entry names foreground and background colour, the measured ratio and
 * the reason. Whoever removes one has to fix the finding.
 */
export interface Exception {
  foreground: string;
  background: string;
  /** Up to this ratio the exception holds; above it, it is a finding. */
  upTo: number;
  reason: string;
}

export const EXCEPTIONS: readonly Exception[] = [
  {
    foreground: "#8b8b8b",
    background: "#ffffff",
    upTo: 3.5,
    reason:
      "Muted text on the surface, light. Already recorded in " +
      "packages/core/tests-unit/contrast.test.ts as a deliberate exception and held " +
      "there against 3:1: the token carries labels, units and hints, never body " +
      "text. Axe applies 4.5:1 to every small text and does not know this " +
      "distinction. Whoever promotes the token to body text has to darken it and " +
      "strike both exceptions.",
  },
  {
    foreground: "#77777e",
    background: "#161618",
    upTo: 4.2,
    reason:
      "The same pair in the dark theme (measured 4.07:1). See the reason for the " +
      "light exception and packages/core/tests-unit/contrast.test.ts.",
  },
];

/**
 * Findings that are real and still open - not defined away, but named and
 * handed on.
 *
 * For exactly this case the ticket says: better to land the check for one part
 * and open the rest as a follow-up than to have a check with blanket
 * suppression.
 *
 * Empty since tone-contrast: the danger tone's two roles are split into a
 * surface (`--u-color-danger`, with `--u-color-on-danger` on it) and a text
 * token (`--u-color-danger-text`), as the accent has them. Empty is the
 * intended state; a new entry names its follow-up under `.scratch/`.
 */
export const OPEN: readonly Exception[] = [];

export const TOLERATED = [...EXCEPTIONS, ...OPEN];

interface ColourData {
  fgColor?: string;
  bgColor?: string;
  contrastRatio?: number;
}

/* Axe's result type, without copying it out: it has corners (nested frames in
   `target`) that a hand-built interface silently misses. */
type AxeResult = Awaited<ReturnType<AxeBuilder["analyze"]>>;

const matches = (entry: Exception, foreground?: string, background?: string, ratio?: number) =>
  entry.foreground === foreground && entry.background === background && (ratio ?? 0) <= entry.upTo;

/** The findings of a run, readable and without the tolerated colour pairs.

    Readable, because "expected 0, was 3" on its own sends nobody to the right
    place. Filtered per occurrence and not per rule: switching a whole rule off
    would hide its real findings too. */
export function findings(result: AxeResult) {
  return result.violations.flatMap((v) =>
    v.nodes
      .filter((n) => {
        if (v.id !== "color-contrast") return true;
        const data = n.any?.[0]?.data as ColourData | undefined;
        return !TOLERATED.some((e) =>
          matches(e, data?.fgColor, data?.bgColor, data?.contrastRatio),
        );
      })
      .map((n) => ({
        rule: v.id,
        impact: v.impact,
        description: v.help,
        where: n.target.join(" "),
        data: n.any?.[0]?.data,
      })),
  );
}
