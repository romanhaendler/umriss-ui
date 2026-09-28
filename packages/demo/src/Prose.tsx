/* The marks a page's texts may carry: `code` in backticks, a [link](#/page)
   and **bold** - the last as the API descriptions, read from the sources'
   doc comments, write a defined term. Everything else is plain text - the outline is data, and the
   llms text carries these strings as the Markdown they already are.

   `#/page` is written in the texts as the hash it once was; here it becomes
   the page's path (ADR-0037). */

import type { ReactNode } from "react";
import { hrefOfText } from "./href";

const MARK = /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;

export function Prose({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let at = 0;
  for (const match of text.matchAll(MARK)) {
    if (match.index > at) out.push(text.slice(at, match.index));
    const [, code, label, href, bold] = match;
    out.push(
      code !== undefined ? (
        <code key={match.index}>{code}</code>
      ) : bold !== undefined ? (
        <strong key={match.index}>{bold}</strong>
      ) : (
        <a key={match.index} href={href === undefined ? href : hrefOfText(href)}>
          {label}
        </a>
      ),
    );
    at = match.index + match[0].length;
  }
  if (at < text.length) out.push(text.slice(at));
  return <>{out}</>;
}
