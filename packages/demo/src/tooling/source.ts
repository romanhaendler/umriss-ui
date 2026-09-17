/* What is visible of an example file.

   The rule behind it: the file IS the example. What runs is exactly what
   stands there - not out of discipline, but because there is only one file.
   These two functions are the only permitted difference between the file on
   disk and what the reader reads, and both are pure string functions without
   any further transformation: no reformatting, no re-indenting, no stripping
   of comments.

   1. The `title` export falls away. It is the demo's bookkeeping and is no
      business of the reader's.

   2. The library path `"../../../src"` becomes the demo's package name -
      `"@umriss-ui/core"` or `"@umriss-ui/table"`. That is the one point where
      "what runs here" and "what runs at your place" really diverge - a copied
      example has to run. Imports of other packages stand as they are written.

   Should a third rule ever become tempting, that is the moment to question
   `?raw` at all, and not the moment to add a third rule. */

/** The path the examples take their package from. */
export const LIBRARY_PATH = "../../../src";

/* Only at an import, not everywhere.

   An example that shows the string "../../../src" in its body - because it
   talks about paths, say - must not be hit by this. The path therefore has to
   be preceded by a `from` or by an `import` at the start of a line. */
const IMPORT_LINE = /(\bfrom\s*|^[ \t]*import\s*)(["'])((?:\.\.\/)+src)((?:\/[^"']*)?)\2/gm;

/** Replaces the library path with the package name - only in imports. */
export function asPackage(source: string, packageName: string): string {
  return source.replace(IMPORT_LINE, (_match, lead: string, quote: string, _path, rest: string) => {
    const subPath = rest === "" ? "" : rest;
    return `${lead}${quote}${packageName}${subPath}${quote}`;
  });
}

/* One spelling. Both demos export `title` (english-and-umriss-ui 10 and 12);
   the alternation that bridged them is gone. */
const TITLE_START = /^export const title\b/;

/** Removes the `title` export - even where it runs over several lines.

    Throws when there is none. An example file without a title would be
    "undefined" in the sidebar and in the palette, and a silent placeholder
    there is worse than a loud failure at load time. */
export function withoutTitle(source: string): string {
  const lines = source.split("\n");
  const start = lines.findIndex((line) => TITLE_START.test(line));
  if (start === -1) {
    throw new Error(
      "An example file without `export const title` – without a title the example has no name.",
    );
  }

  /* Up to the semicolon at the end of a line: that covers the single-line
     form and the wrapped one, without parsing the source for it. */
  let end = start;
  while (end < lines.length && !lines[end]!.trimEnd().endsWith(";")) end += 1;

  const before = lines.slice(0, start);
  const after = lines.slice(end + 1);
  /* The blank line that separated the export from the rest would otherwise
     pass as a double blank line. */
  while (after.length > 0 && after[0]!.trim() === "") after.shift();
  while (before.length > 0 && before[before.length - 1]!.trim() === "") before.pop();

  const joined = [...before, ...(before.length > 0 && after.length > 0 ? [""] : []), ...after];
  return `${joined.join("\n").replace(/\s+$/, "")}\n`;
}

/** What stands in the code block: the file, without its title, with the package name. */
export function displaySource(source: string, packageName: string): string {
  return asPackage(withoutTitle(source), packageName);
}
