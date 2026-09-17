/* The props tables of @umriss-ui/core against its own source.

   The reader itself moved to @umriss-ui/demo with the shell and is checked
   against fixture sources there. What stays here is a statement about THIS
   package: its comments and its default values say the same thing.

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
   three (the table now lives in @umriss-ui/table). Where a comment names a
   default as a literal and the component sets one while destructuring, the two
   must say the same thing.

   Counts as a literal: `true`/`false`, a value in backticks, a number or a list
   of numbers. "Default one below the other" or "Default: the anchor" are
   sentences and stay unchecked; "Default: 12px" is not a number.

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

describe("A default in the comment", () => {
  it("never names a default other than the one the component sets", () => {
    const contradictions = realProps()
      .filter((e) => e.comment !== undefined && e.code !== undefined && e.comment !== e.code)
      .map((e) => `${e.where}: comment ${e.comment}, code ${e.code}`);
    expect(contradictions).toEqual([]);
  });

  /* So that the rule does not quietly run empty: three places at which it
     really has to bite. */
  it.each(["SparklineProps.width", "ModalProps.closeOnBackdrop", "NumberInputProps.step"])(
    "bites at %s",
    (where) => {
      const entry = realProps().find((e) => e.where === where);
      expect(entry?.comment).toBeDefined();
      expect(entry?.comment).toBe(entry?.code);
    },
  );
});
