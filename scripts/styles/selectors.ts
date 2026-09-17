/* Reading a selector just far enough for the two style rules (ADR-0021):
   does it name an element of the library, and is its subject such an element
   rather than whatever a caller put inside. Not a selector parser - it has to
   be right for the selectors this workspace writes, and the tests say which. */

/** Masks what may contain dots or combinators without being either: the
    insides of attribute brackets, of strings and of functional pseudo-classes.
    The mask keeps every index, so a position found in the result is a position
    in the selector. */
function blankNested(selector: string): string {
  let out = "";
  let depth = 0;
  let quote: string | null = null;
  for (const char of selector) {
    if (quote) {
      if (char === quote) quote = null;
      out += "x";
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      out += "x";
      continue;
    }
    if (char === "[" || char === "(") depth++;
    out += depth > 0 && !"[]()".includes(char) ? "x" : char;
    if (char === "]" || char === ")") depth--;
  }
  return out;
}

/** Whether the selector names a class outside any brackets - the mark of an
    element the library rendered. A class only inside `:not()` or `:is()` does
    not count. */
export function namesAClass(selector: string): boolean {
  return /\.[A-Za-z_-]/.test(blankNested(selector));
}

/** The last compound of the selector: the element the rule applies to. */
export function subject(selector: string): string {
  const flat = blankNested(selector.trim());
  const cut = Math.max(flat.lastIndexOf(" "), flat.lastIndexOf(">"), flat.lastIndexOf("+"), flat.lastIndexOf("~"));
  return selector.trim().slice(cut + 1);
}

/** Whether the subject is an element of its own - a class, a type, an id or an
    attribute - rather than "anything" (`*`, or a bare pseudo-class). */
export function subjectIsOwn(selector: string): boolean {
  return /^[.#[A-Za-z]/.test(subject(selector));
}
