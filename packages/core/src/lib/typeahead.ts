/* The one typeahead rule of Select, Menu and TreeView. `text` is everything
   typed within the pause. A single letter, or the same letter repeated,
   searches behind `index` and so moves on to the next label that begins with
   it; different letters narrow the prefix and search from `index`, so that
   refining does not jump onwards. Wraps around; -1 when nothing matches. */
export function typeaheadIndex(labels: readonly string[], index: number, text: string): number {
  const typed = text.toLowerCase();
  if (typed === "" || labels.length === 0) return -1;
  const repeated = [...typed].every((c) => c === typed[0]);
  const prefix = repeated ? (typed[0] as string) : typed;
  const from = repeated ? index + 1 : Math.max(index, 0);
  for (let n = 0; n < labels.length; n++) {
    const at = (from + n) % labels.length;
    if (labels[at]!.toLowerCase().startsWith(prefix)) return at;
  }
  return -1;
}
