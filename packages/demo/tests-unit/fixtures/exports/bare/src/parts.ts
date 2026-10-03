/* Fixture: two exports without JSDoc and one with. The gate has to point at
   each bare one where it is declared - with file, line and name. */

/** Says what it is for. */
export function explained(): number {
  return 1;
}

/* A note for maintainers is no JSDoc. */
export function bare(): number {
  return 2;
}

export interface BareShape {
  size: number;
}
