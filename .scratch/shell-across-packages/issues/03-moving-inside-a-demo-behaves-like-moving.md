# 03: Moving inside a demo behaves like moving between documents

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/shell-across-packages/spec.md`

**What to build:** Every sidebar entry, "Scenarios" included, becomes a real anchor with the page's address; a plain click still moves without a reload, a modified or middle click is the browser's. The title formula of the prerendering becomes one function in the shell tooling; the prerendering writes `<title>` with it and the shell sets `document.title` with it on every place change (an example anchor does not change it). On every place change and on first load, if the active entry is outside the sidebar's visible box, the sidebar alone scrolls it into its middle.

- [ ] Tooling unit tests of the title function: component page, feature page and landing, against the fixture package.
- [ ] The shell suite: after a sidebar click `document.title` equals the prerendered title of that page; after Back, the previous title returns.
- [ ] Sidebar entries are anchors whose `href` is the page's address.
- [ ] On a page whose entry lies below the sidebar's fold (core: Tag; elsewhere the last page) the active entry is in view after load and after a palette jump; the page's own scroll is untouched.
