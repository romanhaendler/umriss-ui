/* The props tables of @umriss-ui/core against its own source.

   The reader itself moved to @umriss-ui/demo with the shell and is checked
   against fixture sources there. What stays here is a statement about THIS
   package: its comments leave its default values to the Default column.

   The reader's own field names (`types`, `description`, `defaultValue`) are still
   German; that is a recorded deviation of the shell's ticket, and this file
   reads them as they are. */

import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readProps } from "@umriss-ui/demo/tooling/propsReader";
import type { Reading } from "@umriss-ui/demo/tooling/propsReader";
import { sourceFiles, requiredTypes } from "@umriss-ui/demo/tooling/props";
import { OUTLINE } from "../demo/outline";

const SOURCE = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

/* ------------------------------------------------------------------ */
/* A default in the comment is a contract (library-audit 04)           */
/* ------------------------------------------------------------------ */

/* A prop's comment lands in the generated table and is therefore public
   interface. `TablePagination` promised four page sizes there and delivered
   three (the table now lives in @umriss-ui/table). The cure was first a check
   that a default named in a comment matches the one the component sets while
   destructuring; it is now that no comment names one at all. A default stands
   in the Default column - out of the destructuring, or out of a `@default` tag,
   and the reader stops where the two disagree (`@umriss-ui/demo`, its props
   reader). A default written in words beside it could only drift.

   Counts as a default in words: "Default" or "Standard" followed by
   `true`/`false`, a value in backticks, a number or a list of numbers.
   "The default is the slightly rounded badge shape" is a sentence about the
   shape and stays.

   Both the German "Standard" and the English "Default" are recognised: the
   components are translated directory by directory, and this guard must not
   depend on how far that has got. */

const normalise = (text: string) =>
  text.replace(/^\[|\]$/g, "").replace(/^["'`]|["'`]$/g, "").replace(/\s+/g, "");

function defaultInComment(description: string): string | undefined {
  const match =
    /(?:Standard|Default):?\s+(?:(true|false)\b|`([^`]+)`|(-?\d+(?:\.\d+)?(?:\s*,\s*-?\d+(?:\.\d+)?)*)(?![\w.]*[A-Za-z]))/.exec(
      description,
    );
  if (!match) return undefined;
  return normalise((match[1] ?? match[2] ?? match[3]) as string);
}

let reading: Reading | undefined;
const realProps = () => {
  reading ??= readProps(sourceFiles(SOURCE), requiredTypes(OUTLINE));
  return Object.values(reading.types).flatMap((type) =>
    type.props.map((prop) => ({
      where: `${type.name}.${prop.name}`,
      comment: defaultInComment(prop.description),
      code: prop.defaultValue === undefined ? undefined : normalise(prop.defaultValue),
    })),
  );
};

/* The reading starts the TypeScript compiler over the whole of src/, which
   takes seconds on a busy machine - more than vitest's five. */
describe("A default in the comment", { timeout: 60_000 }, () => {
  it("is never written in words - it stands in the Default column", () => {
    const inWords = realProps()
      .filter((e) => e.comment !== undefined)
      .map((e) => `${e.where}: comment ${e.comment}, code ${e.code ?? "none"}`);
    expect(inWords).toEqual([]);
  });

  /* So that the rule does not quietly run empty: three places whose comment
     once named the default, and whose default now stands in the column only. */
  it.each([
    ["SparklineProps.width", "96"],
    ["ModalProps.closeOnBackdrop", "true"],
    ["NumberInputProps.step", "1"],
  ])("%s carries its default in the column", (where, value) => {
    const entry = realProps().find((e) => e.where === where);
    expect(entry?.code).toBe(value);
    expect(entry?.comment).toBeUndefined();
  });
});
