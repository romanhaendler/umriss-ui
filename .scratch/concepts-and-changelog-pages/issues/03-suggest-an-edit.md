# 03: Suggest an edit

Status: ready-for-agent
Blocked by: 01 (The concept documents are pages of the site)
Spec: `.scratch/concepts-and-changelog-pages/spec.md`

**What to build:** Every demo page and every document page ends with one link, "Suggest an edit on GitHub", opening GitHub's new-issue form prefilled with the title "Docs: <page title>" and a body holding the page's address and an empty line. A plain link with query parameters, no backend. The shell renders it under each demo page; the document layout renders it on document pages.

- [ ] The page suite: on a component page the link carries the page's title and address in its query.
- [ ] Every document page carries the link (guard).
- [ ] The link's text names GitHub.
- [ ] No component page's screenshot baseline changes.
