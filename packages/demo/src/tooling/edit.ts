/* "Suggest an edit" (.scratch/concepts-and-changelog-pages): the last link of
   every demo page and every document page. A plain link to GitHub's new-issue
   form, prefilled - no backend, no form or widget of the site's own. One
   formula for the shell, which writes it under each demo page, and for the
   pages build, which writes it under each document; the guard over the
   document pages is `documentFaults` in `site.ts`.

   It runs in the browser and in Node alike, which is why it imports nothing. */

/** What the link says: GitHub by name, so that its login page surprises
    nobody. */
export const EDIT_LINK = "Suggest an edit on GitHub";

/** GitHub's new-issue form, the issue titled "Docs: <page title>" and its
    body the page's address with an empty line below for the reader's text. */
export function editHref(title: string, url: string): string {
  return `https://github.com/romanhaendler/umriss-ui/issues/new?${new URLSearchParams({ title: `Docs: ${title}`, body: `${url}\n\n` })}`;
}
