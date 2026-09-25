/* What is visible of an example file.

   The rule behind it: the file IS the example. What runs is exactly what
   stands there - not out of discipline, but because there is only one file.
   These two functions are the only permitted difference between the file on
   disk and what the reader reads, and both are pure string functions without
   any further transformation: no reformatting, no re-indenting, no stripping
   of comments.

   1. The demo's own bookkeeping falls away: `title` and `lead`, and a
      scenario's `callouts` and `builtFrom`. None is any business of the
      reader's, and a pasted file carrying them would carry exports that mean
      nothing outside this demo. One rule with several members, not several rules - what falls
      away is exactly what the demo put there.

   2. The library path `"../../../src"` becomes the demo's package name -
      `"@umriss-ui/core"` or `"@umriss-ui/table"`, and a world's
      `"@umriss-ui/demo/worlds/<world>"` becomes `"./<world>"`, the file the
      code view shows beside it. That is the one point where "what runs here"
      and "what runs at your place" really diverge - a copied example has to
      run. Imports of other packages stand as they are written.

   Should a third rule ever become tempting, that is the moment to question
   `?raw` at all, and not the moment to add a third rule. */

/** The path the examples take their package from. */
export const LIBRARY_PATH = "../../../src";

/* Only at an import, not everywhere.

   An example that shows the string "../../../src" in its body - because it
   talks about paths, say - must not be hit by this. The path therefore has to
   be preceded by a `from` or by an `import` at the start of a line. */
const IMPORT_LINE = /(\bfrom\s*|^[ \t]*import\s*)(["'])((?:\.\.\/)+src)((?:\/[^"']*)?)\2/gm;

/* The demos' shared data (`packages/demo/src/worlds`), as an example imports it. */
const WORLD_IMPORT = /(\bfrom\s*|^[ \t]*import\s*)(["'])@umriss-ui\/demo\/worlds\/([\w-]+)\2/gm;

/** The worlds a source imports, in the order it names them, once each. */
export function worldsOf(source: string): string[] {
  return [...new Set([...source.matchAll(WORLD_IMPORT)].map((match) => match[3]!))];
}

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
const BOOKKEEPING = ["lead", "callouts", "builtFrom"].map((name) => new RegExp(`^export const ${name}\\b`));

/** Removes one `export const …` and the blank line that separated it, even
    where it runs over several lines. Says whether it found one. */
function withoutExport(lines: string[], start: RegExp): string[] | null {
  const from = lines.findIndex((line) => start.test(line));
  if (from === -1) return null;

  /* Up to the semicolon at the end of a line: that covers the single-line
     form and the wrapped one, without parsing the source for it. */
  let end = from;
  while (end < lines.length && !lines[end]!.trimEnd().endsWith(";")) end += 1;

  const before = lines.slice(0, from);
  const after = lines.slice(end + 1);
  /* The blank line that separated the export from the rest would otherwise
     pass as a double blank line. */
  while (after.length > 0 && after[0]!.trim() === "") after.shift();
  while (before.length > 0 && before[before.length - 1]!.trim() === "") before.pop();

  return [...before, ...(before.length > 0 && after.length > 0 ? [""] : []), ...after];
}

/** Removes the demo's own bookkeeping: the `title` export, and `lead`,
    `callouts` and `builtFrom` where they stand.

    Throws when there is no title. An example file without one would be
    "undefined" in the sidebar and in the palette, and a silent placeholder
    there is worse than a loud failure at load time. The rest is optional. */
export function withoutTitle(source: string): string {
  let lines = withoutExport(source.split("\n"), TITLE_START);
  if (lines === null) {
    throw new Error(
      "An example file without `export const title` – without a title the example has no name.",
    );
  }
  for (const start of BOOKKEEPING) lines = withoutExport(lines, start) ?? lines;
  return `${lines.join("\n").replace(/\s+$/, "")}\n`;
}

/** A world's import as the reader copies it: from the file beside. */
export function asBeside(source: string): string {
  return source.replace(WORLD_IMPORT, (_match, lead: string, quote: string, world: string) => `${lead}${quote}./${world}${quote}`);
}

/** What stands in the code block: the file, without its bookkeeping, with the
    package name and its worlds beside it. */
export function displaySource(source: string, packageName: string): string {
  return asBeside(asPackage(withoutTitle(source), packageName));
}
