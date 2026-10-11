# The CSV follows the language in use

Status: accepted, extends ADR-0024
Date:   2026-10

ADR-0024 left one question open on purpose: whether the table's CSV export
should follow the locale too, "a question about a third object". The rules
were set when German was the only language shipped (a semicolon, a decimal
comma, "ja" and "nein"), and ADR-0019 and ADR-0024 made English the default
and left that sentence standing. Under an English wording the file still came
out German; an English spreadsheet read it as one column of text. The header
line, the button and the file name already followed the wording; only the data
did not.

**The CSV takes three conventions from the language in use - the decimal mark
from the formats, the words for true and false from the wording, the field
separator from the mark - and keeps the rest; ADR-0024's open question is
closed.**

## The three sources

- *The decimal mark* is the formats' (ADR-0024: notation is a format). It is
  measured with core's `separatorsOf(formats).decimal`, as `NumberInput` reads
  its own output, so a caller who replaced `number` gets their own mark.
- *The words for true and false* are the wording's (ADR-0024: words are
  wording): `booleanYes` and `booleanNo`, lower-cased with `toLocaleLowerCase()`
  as the export always wrote them. No new wording key.
- *The separator* is derived, not configured: `;` where the mark is `,`,
  otherwise `,`. A separator equal to the decimal mark makes the file
  unreadable, and spreadsheets apply the same rule. No new format entry.

Unchanged: the byte order mark, CRLF, quoting (now of the separator in use),
dates as ISO text, numbers without thousands groups, the filtered set and the
visible columns.

## The mixed case

German wording with English formats gives German words with a comma between
fields and a point: ja, nein, `3.5`. That is allowed and documented. ADR-0024
already tells a German application to take both halves
(`@umriss-ui/core/wording/de` exports both); an application that takes one
gets what it took.

## Where the rules live

`model/csv.ts` stays pure: `asCsv(rows, columns, conventions)` with
`CsvConventions { separator, decimal, yes, no }`, English by default.
`export.ts` builds the conventions from the formats and the wording. A boolean
reaches the writer as a boolean, which maps it. `asCsv()` on a table without a
provider returns the English text, because the hook already reads the two from
context.

## Consequences

- An English application gets commas, a decimal point and yes/no: a change,
  announced in the changelog. A German application gets the file it got before,
  byte for byte.
- The earlier sentence "the export follows German
  conventions" is not rewritten; this record supersedes it by name.
- The same conventions serve the table's copy to the clipboard (tab-separated,
  the formats' decimal mark) and a later XLSX writer.
- A separator, BOM or line-break option on `Export` is not offered: the
  application can process the text it is handed.
