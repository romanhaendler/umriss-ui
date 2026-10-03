/* The Language page's three tables (.scratch/theming-and-wording-reference,
   04): every entry of `Wording`, of the charts' `ChartsWording` and of
   `Formats`, English beside German - read from the source by the shell's
   wording reader (`@umriss-ui/demo/tooling/wordingTable`), never listed by
   hand.

   The charts' wording stands here too: the Language page is where a reader
   looks for the words, and the charts' are the same kind of directory. Its
   files are read like core's; only the guard imports the object, to count.

   The formats have no texts to read - both sets are built by `formatsFor`
   from a locale - so their columns show what each set writes for one sample
   per entry. `SAMPLES` is typed by `Formats`: a new format without a sample
   is a compile error.

   And the guard (the built-site guard of the spec): the page carries an
   anchor for every key the running objects have, counted apart from the
   reader. It runs in `demo/props.ts`, so `dev`, `build:demo` and
   `typecheck` stop at a key without a row. */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { readEntries, readTexts, wordingTable, type WordingText } from "@umriss-ui/demo/tooling/wordingTable";
import type { ReferenceTable } from "@umriss-ui/demo/tooling/referenceTable";
import { DEFAULT_FORMATS, formatsFor, type Formats } from "../../src/lib/language/formats.ts";
import { DEFAULT_WORDING } from "../../src/lib/language/wording.ts";
import { DEFAULT_CHARTS_WORDING } from "../../../charts/src/wording/index.ts";

/** The day, the place and the numbers every sample writes - the Formats
    table's sentence says them. */
const ZONE = "Europe/Berlin";
const SAMPLES_SAID =
  "Each set as it writes Tuesday, 17 March 2026 at 09:05:03 in Berlin (the time without seconds), the number 1204.5 to one decimal, the count 1204, the share 0.74, three minutes ago, and `Zebra`, `Émile` and `Apple` in order.";

function samples(at: Date): Record<keyof Formats, (formats: Formats) => string> {
  return {
    date: (f) => f.date(at),
    dateShort: (f) => f.dateShort(at),
    month: (f) => f.month(at),
    dateLong: (f) => f.dateLong(at),
    time: (f) => f.time(at, false),
    dateTime: (f) => f.dateTime(at, false),
    offset: (f) => f.offset(at),
    number: (f) => f.number(1204.5, 1),
    count: (f) => f.count(1204),
    percent: (f) => f.percent(0.74),
    compareText: (f) => ["Zebra", "Émile", "Apple"].sort(f.compareText).join(", "),
    relative: (f) => f.relative(3 * 60_000),
  };
}

/** The locale a set is built from: `formatsFor("de-DE")`, read where the set
    is declared. */
function localeOf(path: string, name: string): string {
  const file = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true);
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const one of statement.declarationList.declarations) {
      const call = one.initializer;
      if (ts.isIdentifier(one.name) && one.name.text === name && call !== undefined && ts.isCallExpression(call) && call.expression.getText() === "formatsFor" && call.arguments[0] !== undefined && ts.isStringLiteral(call.arguments[0])) {
        return call.arguments[0].text;
      }
    }
  }
  throw new Error(`\`${name}\` in \`${path}\` is not \`formatsFor("<locale>")\`.`);
}

/** What each set writes, by key. The zone is set while the sets are built:
    a formatter takes it when it is made, and the sample is a wall-clock time. */
function formatTexts(locale: string): Map<string, WordingText> {
  const zone = process.env.TZ;
  process.env.TZ = ZONE;
  try {
    const formats = formatsFor(locale);
    return new Map(Object.entries(samples(new Date(2026, 2, 17, 9, 5, 3))).map(([key, write]) => [key, { kind: "text", text: write(formats) }]));
  } finally {
    if (zone === undefined) delete process.env.TZ;
    else process.env.TZ = zone;
  }
}

/** The three tables, in the order the page shows them. */
export function languageTables(packageDir: string): ReferenceTable[] {
  const language = join(packageDir, "src", "lib", "language");
  const charts = join(packageDir, "..", "charts", "src", "wording");
  const read = (path: string) => readFileSync(path, "utf8");
  return [
    wordingTable({
      title: "Wording",
      anchor: "wording",
      lead: "Every entry of `Wording`: the English of `DEFAULT_WORDING` beside the German of `GERMAN_WORDING`. A function entry receives the parameters its key names and returns the sentence beside it. Override any entry by its key; a `presets` entry inside `presets`.",
      entries: readEntries(read(join(language, "wording.ts")), "Wording"),
      english: readTexts(read(join(language, "wording.ts")), "DEFAULT_WORDING"),
      german: readTexts(read(join(language, "de.ts")), "GERMAN_WORDING"),
    }),
    wordingTable({
      title: "Charts wording",
      anchor: "charts-wording",
      lead: "Every entry of `ChartsWording` from `@umriss-ui/charts`, which a chart takes through its `wording` prop: the English of `DEFAULT_CHARTS_WORDING` beside the German of `GERMAN_CHARTS_WORDING`, imported from `@umriss-ui/charts/wording/de`.",
      entries: readEntries(read(join(charts, "index.ts")), "ChartsWording"),
      english: readTexts(read(join(charts, "index.ts")), "DEFAULT_CHARTS_WORDING"),
      german: readTexts(read(join(charts, "de.ts")), "GERMAN_CHARTS_WORDING"),
    }),
    wordingTable({
      title: "Formats",
      anchor: "format",
      lead: `Every entry of \`Formats\`: \`DEFAULT_FORMATS\` beside \`GERMAN_FORMATS\`. ${SAMPLES_SAID}`,
      entries: readEntries(read(join(language, "formats.ts")), "Formats"),
      english: formatTexts(localeOf(join(language, "formats.ts"), "DEFAULT_FORMATS")),
      german: formatTexts(localeOf(join(language, "de.ts"), "GERMAN_FORMATS")),
    }),
  ];
}

/** A directory's keys as the running object has them - a nested object
    flattened with dots, as the table writes them. */
function keysOf(object: object, prefix = ""): string[] {
  return Object.entries(object).flatMap(([key, value]) =>
    value !== null && typeof value === "object" && !Array.isArray(value) ? keysOf(value as object, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}

/** The anchors the Language page lacks: one per key of the three
    directories. Empty is the only answer that builds. */
export function missingAnchors(html: string): string[] {
  return [
    ...keysOf(DEFAULT_WORDING).map((key) => `wording-${key}`),
    ...keysOf(DEFAULT_CHARTS_WORDING).map((key) => `charts-wording-${key}`),
    ...keysOf(DEFAULT_FORMATS).map((key) => `format-${key}`),
  ].filter((id) => !html.includes(` id="${id}"`));
}
