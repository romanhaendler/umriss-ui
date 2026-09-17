/* A caller's value as part of an id - in one place.

   A value may contain anything, an id may not, as soon as an IDREFS attribute
   reads it: `aria-labelledby`, `aria-describedby` and `aria-controls` split on
   whitespace. A tab named "erste seite" named its panel with two ids that do
   not exist (library-audit 04).

   The spec had proposed `${useId()}-${index}`. That does not carry here: `Tab`
   and `TabPanel` are separate components and know no index, and the rows of the
   command palette reorder on every keystroke - an id by position would wander
   under `aria-activedescendant`. The value is therefore escaped rather than
   replaced: free of whitespace, unambiguous, and readable for simple values.
   The basis of the id stays a `useId()` of the component.

   Internal. */

/**
 * Turns a value into a whitespace-free, unambiguous part of an id.
 *
 * Letters A-Z, digits and `-` stay; every other character becomes `_hex_`.
 * Because `_` itself is escaped, the mapping stays reversible and therefore
 * unambiguous: "a b" and "a_20_b" yield different parts.
 */
export function idPart(value: string | number): string {
  return String(value).replace(
    /[^A-Za-z0-9-]/gu,
    (character) => `_${(character.codePointAt(0) as number).toString(16)}_`,
  );
}
