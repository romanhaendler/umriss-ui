/* The shell, checked against this demo. The tests themselves stand once, with
   the shell (`@umriss-ui/demo/checks/shell.ts`); here stand the pages and
   queries they can be checked against in @umriss-ui/core. */

import { checkShell } from "@umriss-ui/demo/checks/shell";

checkShell({
  packageId: "core",
  notOnTheFrontDoor: ["tabs", "button"],
  scenario: "watch-a-kiln-line",
  rail: { name: "Sizes", pageId: "sizes", rubricId: "customising" },
  low: { name: "Tag", pageId: "tag" },
  neighbours: [
    { name: "Select", pageId: "select" },
    { name: "MultiSelect", pageId: "multiselect" },
  ],
  deepLink: { pageId: "datepicker", absent: "button" },
  example: { pageId: "button", id: "loading-and-disabled", title: "Loading and disabled", pageName: "Button" },
  palettePage: { query: "daterangepicker", name: "DateRangePicker", pageId: "daterangepicker", rubricName: "Dates and times" },
  /* Not the first `t` in "Date" but the `T` of "Time": the matcher computes
     exhaustively and not greedily. */
  abbreviation: { query: "dtp", find: "DateTimePicker", glyphs: ["D", "T", "P"] },
  /* The wide query finds many, the narrow one distinctly fewer - and the find
     under the pointer is no longer among them, which is the premise of the
     test: the mark falls back to the first row only when the held row has
     really dropped out (CommandPalette.tsx, `activeId`). No exact count is
     asserted anywhere, so none is written down here to rot.

     The narrow query was "tag" until the rubrics were regrouped. The matcher
     searches a candidate's GROUP as a fallback, and a page's group is its
     rubric name - so renaming the rubrics changed which candidates a query
     finds at all. Under "ta" the fourth row is now `Mono, tracking and links`,
     which carries t-a-g and therefore survived "tag"; the mark stayed on it,
     correctly, and the test read that as the defect it guards. "tab" drops it.
     "tabelle" stopped finding anything once the table moved to
     @umriss-ui/table.

     "ta" and "tab" went when the pages came to rank above every example
     (one-search 02): the fourth row under "ta" became `Meter`, a page, whose
     lede says "tables" and kept it under "tab". Under "se"
     the fourth row is `Slider`, which "sel" drops. */
  pointer: { wide: "se", narrow: "sel" },
  contents: { pageId: "select", id: "states", title: "States" },
  foldedRow: { pageId: "popover", id: "PopoverProps-role" },
  synonyms: [
    { query: "snackbar", name: "Toast", pageId: "toast" },
    { query: "chip", name: "Tag", pageId: "tag" },
  ],
  rows: [
    { query: "--u-accent", label: "--u-color-accent", pageId: "theming", anchor: "token-u-color-accent" },
    { query: "No matches", label: "noMatches", pageId: "language", anchor: "wording-noMatches" },
    { query: "Stand unbekannt", label: "asOfUnknown", pageId: "language", anchor: "wording-asOfUnknown" },
  ],
  elsewhere: {
    query: "loading, empty",
    group: "table · Row appearance",
    label: "Show loading, empty, failed and no match",
    address: "/table/row-appearance/#states",
  },
});
