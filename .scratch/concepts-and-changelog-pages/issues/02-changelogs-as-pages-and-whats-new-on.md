# 02: Changelogs as pages, and "What's new" on the front page

Status: ready-for-agent
Blocked by: 01 (The concept documents are pages of the site), `shell-across-packages` 02 (The header connects the five packages)
Spec: `.scratch/concepts-and-changelog-pages/spec.md`

**What to build:** Each package's changelog is rendered at `/<package>/changelog/` in the document layout. Every version heading gets an anchor like `v0-24-0`; "Changed" sections carry the warning edge with the word kept. The build reads each changelog's first version heading (version, title, month) and fails when its shape is wrong or the version is not the manifest's. The front page shows a "What's new" strip under the tiles, one line per package linked to its anchor. The foot of each demo's sidebar gains "Changelog", and the site's `llms.txt` gains a "Documents" section with the three concept pages and five changelogs.

- [ ] Unit tests of the version-heading reader: the normal shape, a heading without month, a heading that is not a version.
- [ ] Five changelog pages are in the sitemap and pass the guard.
- [ ] The build fails when a changelog's newest version differs from its manifest's version.
- [ ] Each "What's new" line links an anchor that exists on its changelog page (guard).
- [ ] No page of the site links a changelog on GitHub.
