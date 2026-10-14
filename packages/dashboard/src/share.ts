import type { SizeSpan } from "./model";

const GLYPHS: Record<number, string> = { 3: "¼", 4: "⅓", 6: "½", 8: "⅔", 9: "¾" };

/** A size's share of the twelve columns as a reader reads it: "¼" where a
    fraction glyph exists, "5/12" otherwise. */
export const shareOf = ({ columns }: SizeSpan): string => GLYPHS[columns] ?? `${columns}/12`;
