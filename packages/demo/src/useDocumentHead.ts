/* The document head follows the page: the title and the one alternate link to
   the page's Markdown twin. */

import { useEffect } from "react";
import type { Demo } from "./demo";
import { hrefOf } from "./href";
import { twinOfPlace } from "./outline";
import { pageTitle } from "./tooling/title";

/* THE HEAD FOLLOWS THE PAGE - the one place that does it, on the first
   load and on every move: the title, by the formula the prerendering writes
   it with, and the one alternate link to the page's Markdown twin,
   which the prerendering writes as well and a
   page outside it lacks. An example anchor changes neither: it stands in
   its page's text. Returns the title. */
export function useDocumentHead(demo: Demo, page: { id: string; name: string } | undefined): string {
  const title = pageTitle({ name: demo.packageName, description: demo.description }, page?.name);
  const twin = hrefOf(twinOfPlace(page === undefined ? "" : `/${page.id}`));
  useEffect(() => {
    document.title = title;
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="alternate"][type="text/markdown"]');
    if (link === null) {
      link = document.createElement("link");
      link.rel = "alternate";
      link.type = "text/markdown";
      document.head.append(link);
    }
    link.setAttribute("href", twin);
  }, [title, twin]);
  return title;
}
