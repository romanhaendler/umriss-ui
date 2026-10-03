/* The marks a page's texts may carry: `code` in backticks, a [link](#/page)
   - around code too - and **bold** - the last as the API descriptions, read from the sources'
   doc comments, write a defined term. Everything else is plain text - the outline is data, and the
   llms text carries these strings as the Markdown they already are.

   The marks are read by the same function the API tables' writers read them
   with (`tooling/apiTable.ts`): one grammar for every text of a page.

   `#/page` is written in the texts as the hash it once was; here it becomes
   the page's path (ADR-0037). */

import { hrefOfText } from "./href";
import { spansOf } from "./tooling/apiTable";

export function Prose({ text }: { text: string }) {
  return (
    <>
      {spansOf(text).map((span, i) =>
        span.kind === "code" ? (
          <code key={i}>{span.text}</code>
        ) : span.kind === "bold" ? (
          <strong key={i}>{span.text}</strong>
        ) : span.kind === "link" ? (
          <a key={i} href={hrefOfText(span.href)}>
            {span.code === true ? <code>{span.text}</code> : span.text}
          </a>
        ) : (
          span.text
        ),
      )}
    </>
  );
}
