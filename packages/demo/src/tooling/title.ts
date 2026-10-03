/* The title of a page (search-visibility D8) - one formula for the
   prerendering, which writes it into each page's `<title>`, and for the shell,
   which sets it as `document.title` on every move (.scratch/pages-as-markdown
   02; `shell-across-packages` 03 asks for the same). A title after a click
   therefore equals the title after a reload.

   It runs in the browser and in Node alike, which is why it imports nothing. */

/** What the title is read from: a package's `package.json`. */
export interface TitleManifest {
  name: string;
  description: string;
}

/** What a search engine should read after the page's name, per package. */
const NOUN: Readonly<Record<string, string>> = {
  "@umriss-ui/charts": "chart",
  "@umriss-ui/table": "table",
  "@umriss-ui/schedule": "schedule",
  "@umriss-ui/calculation": "calculation",
};

/** `<Page> – React <noun> · <package>` for a page; `<package> – <description>`
    for the scenarios page, which has no page name. */
export function pageTitle({ name, description }: TitleManifest, pageName?: string): string {
  return pageName === undefined ? `${name} – ${description}` : `${pageName} – React ${NOUN[name] ?? "component"} · ${name}`;
}
