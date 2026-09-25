/* No verdict colour without its word or glyph - ISA-101's redundancy rule in
   the library's own stylesheets (alarm-standards 03; docs/design-language.md,
   "Colour for the abnormal").

   What can be checked and what cannot. Whether a colour on the screen stands
   beside a word is a question about the rendered page, and a rendered page
   depends on what the caller passes: a `Badge` of tone "danger" with no
   children is red without a word, and no stylesheet can prevent it. A fully
   automatic check would have to render every component in every tone with
   every content - and would then test the caller's content, not the library.

   So the check is the narrowest one that holds: a register. Every stylesheet of
   the library that reaches for a verdict colour - `--u-color-danger*`,
   `--u-color-warning*`, `--u-color-success*` - stands below with the word or
   glyph that carries the same statement, and where that word is the caller's,
   the entry says so. A new stylesheet that reaches for one fails until
   somebody writes down what carries its meaning without colour; an entry
   whose stylesheet no longer does fails as out of date.

   Its ceiling: the register is per stylesheet, not per rule. A second use
   inside a registered stylesheet passes unread - the reviewer of that diff is
   the check there. The alarm list's and the verdict column's own promise is
   held beyond the register by their component tests: the word stands in the
   row (`packages/table/tests-unit/alarmList.test.tsx`, `verdict.test.tsx`). */

import { describe, expect, it } from "vitest";

const LIBRARY = import.meta.glob(
  [
    "../src/components/**/*.module.css",
    "../../table/src/**/*.module.css",
    "../../schedule/src/**/*.module.css",
    "../../calculation/src/**/*.module.css",
    "../../charts/src/styles/charts.css",
  ],
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;

/** "core/Button/Button.module.css", "table/Table.module.css", ... - the names
    of the stylesheet guard. */
const nameOf = (path: string) =>
  path.replace("../src/components/", "core/").replace(/^\.\.\/\.\.\/(\w+)\/src\//, "$1/");

const VERDICT_COLOUR = /var\(--u-color-(?:danger|warning|success)[\w-]*/;

/** Whether a stylesheet reaches for a verdict colour, comments left out. */
const usesVerdictColour = (css: string): boolean =>
  VERDICT_COLOUR.test(css.replace(/\/\*[\s\S]*?\*\//g, ""));

/** Every stylesheet with a verdict colour, and what says the same without it. */
const REGISTER: Readonly<Record<string, string>> = {
  "core/Alert/Alert.module.css":
    "The tone colours the edge, the ground and the title; the title and the text are the words, and the role follows the tone for a screen reader.",
  "core/Badge/Badge.module.css":
    "The badge's children are the word - its props say there is always one beside the colour. The caller's: an empty badge would be colour alone.",
  "core/Button/Button.module.css":
    "The danger button's label names the destructive action. A deliberate departure from ISA-101: colour here marks a consequence, not an abnormal state.",
  "core/Combobox/Combobox.module.css":
    "The invalid field's edge; the form field's error message is the word (FormField), and aria-invalid says it to a screen reader.",
  "core/DataViz/DataViz.module.css":
    "The meter's fill in its tone. The caller's: its optional figure is the percentage, not the verdict, so the word for the tone is the application's.",
  "core/DatePicker/DatePicker.module.css":
    "The invalid field's edge (with the form field's message), and the clock-change hint, which is a sentence in its own colour.",
  "core/FileInput/FileInput.module.css":
    "The invalid zone's edge and the key's danger ring; the form field's error message is the word, and aria-invalid says it to a screen reader.",
  "core/FormField/FormField.module.css":
    "The error message is the word itself; the required mark is an asterisk, a glyph, and the input carries aria-required.",
  "core/Input/Input.module.css":
    "The invalid field's edge; the form field's error message is the word, and aria-invalid says it to a screen reader.",
  "core/Menu/Menu.module.css":
    "A destructive item's label names the action. The same departure as the danger button: a consequence, not an abnormal state.",
  "core/MultiSelect/MultiSelect.module.css":
    "The invalid field's edge (with the form field's message), and the chip's remove key under the pointer, which carries the cross glyph and its label.",
  "core/NumberInput/NumberInput.module.css":
    "The invalid field's edge; the form field's error message is the word, and aria-invalid says it to a screen reader.",
  "core/Select/Select.module.css":
    "The invalid field's edge; the form field's error message is the word, and aria-invalid says it to a screen reader.",
  "core/Stat/Stat.module.css":
    "The verdict is written out beside the value, and the freshness beside the as-of time: the colour tints words that stand there anyway.",
  "core/Stepper/Stepper.module.css":
    "The failed step's marker carries the cross glyph in place of its number, and a screen reader hears 'Failed' beside its label.",
  "core/Switch/Switch.module.css":
    "The invalid switch's edge; the form field's error message is the word, and aria-invalid says it to a screen reader.",
  "core/Tag/Tag.module.css": "The tag's text is the word; the tone is the caller's choice for a word the caller writes.",
  "core/Textarea/Textarea.module.css":
    "The invalid field's edge (with the form field's message), and the counter over its limit, which is a negative figure in its colour.",
  "core/Toast/Toast.module.css":
    "The tone's glyph - a tick, a cross, an exclamation mark - stands beside the message, and the role follows the tone.",
  "table/alarms/AlarmList.module.css":
    "The lifecycle edge stands beside the lifecycle written out, the freshness colour on its word; a hidden alarm gets no colour at all.",
  "table/Table.module.css":
    "A cell editor's message beneath it is the word itself, as the form field's is; the field carries aria-invalid and is described by it.",
  "table/VerdictColumn.module.css":
    "The verdict glyph has a shape per verdict, and the excess beside the value is a figure; colour tints both.",
  "schedule/Schedule.module.css": "A finding is a sentence in the label and the tooltip; the colour tints the sentence.",
  "calculation/Calculation.module.css":
    "The worst verdict of a folded row is a dot and a word, and the freshness colour tints its word.",
  "charts/styles/charts.css":
    "The chart's substitute colours for limits, handed to the canvas: a limit line carries its label there. What the canvas draws this check cannot read.",
};

const users = () =>
  Object.entries(LIBRARY)
    .filter(([, css]) => usesVerdictColour(css))
    .map(([path]) => nameOf(path))
    .sort();

describe("No verdict colour without its word or glyph (ISA-101)", () => {
  it("finds the library's stylesheets", () => {
    expect(Object.keys(LIBRARY).length).toBeGreaterThan(30);
  });

  it("names, for every stylesheet with a verdict colour, what says the same without it", () => {
    expect(users().filter((name) => !(name in REGISTER))).toEqual([]);
  });

  it("keeps no entry whose stylesheet no longer reaches for a verdict colour, and each has a reason", () => {
    const found = new Set(users());
    for (const [name, reason] of Object.entries(REGISTER)) {
      expect(found.has(name), `${name} is out of date`).toBe(true);
      expect(reason.length).toBeGreaterThan(40);
    }
  });

  /* The check is only worth its name if it fires. */
  it("recognises a verdict colour and passes a comment and a neutral token", () => {
    expect(usesVerdictColour(".x { color: var(--u-color-danger-text); }")).toBe(true);
    expect(usesVerdictColour(".x { background: var(--u-color-warning-subtle); }")).toBe(true);
    expect(usesVerdictColour(".x { --uc-ok: var(--u-color-success, #217a4b); }")).toBe(true);
    expect(usesVerdictColour("/* var(--u-color-danger) */ .x { color: var(--u-color-text); }")).toBe(false);
    expect(usesVerdictColour(".x { color: var(--u-color-accent); }")).toBe(false);
  });
});
