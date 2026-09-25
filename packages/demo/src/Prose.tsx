/* The two marks a page's texts may carry: `code` in backticks and a
   [link](#/page). Everything else is plain text - the outline is data, and the
   llms text carries these strings as the Markdown they already are. */

import type { ReactNode } from "react";

const MARK = /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function Prose({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let at = 0;
  for (const match of text.matchAll(MARK)) {
    if (match.index > at) out.push(text.slice(at, match.index));
    const [, code, label, href] = match;
    out.push(code !== undefined ? <code key={match.index}>{code}</code> : <a key={match.index} href={href}>{label}</a>);
    at = match.index + match[0].length;
  }
  if (at < text.length) out.push(text.slice(at));
  return <>{out}</>;
}
