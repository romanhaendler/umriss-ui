/* What every glyph the library draws must be - the specification in
   `packages/core/docs/glyphs.md`, read off the component sources as text. A
   glyph is an inline `<svg>` in a component; what it is checked for is the
   geometry (one stroke width at one nominal size) and the three attributes
   that make it decoration in the text colour. Shared by the glyph checks of
   each package, so that all of them hold one definition. */

/** The nominal size: the longer side of every glyph's `viewBox`. */
export const NOMINAL = 10;

/** The one stroke width, at the nominal size. */
export const STROKE = 1.4;

/** Every inline `<svg>` of a source text, whole. */
export function glyphsIn(source: string): string[] {
  // `<svg` followed by attributes - a bare `<svg>` in prose is not one.
  return [...source.matchAll(/<svg\s[\s\S]*?<\/svg>/g)].map((match) => match[0]);
}

/** What is wrong with one glyph, one line per offence; empty when it obeys. */
export function offencesOf(svg: string): string[] {
  const offences: string[] = [];
  const open = svg.slice(0, svg.indexOf(">") + 1);

  const box = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(open);
  if (!box) offences.push("viewBox is not a literal 0 0 w h");
  else if (Math.max(Number(box[1]), Number(box[2])) !== NOMINAL) offences.push(`viewBox 0 0 ${box[1]} ${box[2]}: the longer side is not ${NOMINAL}`);

  if (!/aria-hidden=(?:"true"|\{true\})/.test(open)) offences.push("no aria-hidden");

  for (const [, quoted, braced] of svg.matchAll(/strokeWidth=(?:"([^"]*)"|\{([^}]*)\})/g)) {
    const width = quoted ?? braced;
    if (Number(width) !== STROKE) offences.push(`strokeWidth ${width}`);
  }
  for (const [, fill] of svg.matchAll(/\bfill="([^"]*)"|\bfill=\{/g)) {
    if (fill !== "none") offences.push(`fill ${fill ?? "computed"}`);
  }
  for (const [, stroke] of svg.matchAll(/\bstroke="([^"]*)"|\bstroke=\{/g)) {
    if (stroke !== "currentColor") offences.push(`stroke ${stroke ?? "computed"}`);
  }
  if (!/strokeWidth=/.test(svg)) offences.push("drawn without a stroke");
  return offences;
}

/** Every offence of every glyph in the given sources, as "file: offence".
    A file named in `exceptions` is not read - what it draws is not a glyph. */
export function glyphOffenders(sources: Record<string, string>, exceptions: Readonly<Record<string, string>>): string[] {
  return Object.entries(sources)
    .filter(([file]) => !(file in exceptions))
    .flatMap(([file, text]) => glyphsIn(text).flatMap((svg) => offencesOf(svg).map((offence) => `${file}: ${offence}`)));
}
