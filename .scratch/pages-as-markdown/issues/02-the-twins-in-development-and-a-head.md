# 02: The twins in development, and a head that follows navigation

Status: ready-for-agent
Blocked by: 01 (Every page has a Markdown twin)
Spec: `.scratch/pages-as-markdown/spec.md`

**What to build:** The dev server serves the same twins at the same addresses as the site. When the app navigates, the alternate link follows the page, in the one place in the head that follows navigation — the place `shell-across-packages` introduces for the document title; if that has not landed, this ticket introduces it and the title joins it.

- [ ] In `pnpm dev`, every page's `.md` address returns the same text as on the built site
- [ ] Shell suite: after an in-app jump, the head holds exactly one alternate link and it points at the new page's twin
- [ ] The document title and the alternate link are set in one place
