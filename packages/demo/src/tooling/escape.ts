/* The two ways the tooling escapes text for HTML: for an attribute value (the
   quote too) and for text between tags. It imports nothing, so the Node
   scripts reach it as they reach the rest of the tooling. */

/** For text inside an attribute value or between tags: `&`, `<`, `>` and `"`. */
export const escapeAttribute = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** For text between tags only: `&`, `<` and `>`. */
export const escapeText = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
