/* Fixture: the corrected `bare/src/parts.ts` - every export says what it is
   for. */

/** Says what it is for. */
export function explained(): number {
  return 1;
}

/* A note for maintainers is no JSDoc - the comment below it is. */
/** Says what it is for, too. */
export function bare(): number {
  return 2;
}

/** A shape with a size. */
export interface BareShape {
  size: number;
}
