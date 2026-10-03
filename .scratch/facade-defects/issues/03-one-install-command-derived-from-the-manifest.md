# 03: One install command, derived from the manifest

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/facade-defects/spec.md`

**What to build:** One function in the shell tooling turns a package manifest into `npm install <name> <@umriss-ui peers…>` (peers in the order core, charts; React left to the prose). Every Installation page shows that command as a code block with the existing copy button, directly under the import line, in the app and in the prerendered HTML; the outline marks the installing page with one flag. The per-package `llms.txt` install line uses the same function, so table, schedule and calculation finally name their peers. The inline "Install with `pnpm add …`" phrases leave the five Installation pages; the surrounding prose is rewritten to say what the command brings (peers and why, the stylesheet, React's version). The README keeps its pnpm quick start.

- [ ] Unit tests of the function: core alone, table with core, schedule with core and charts, a manifest without peers.
- [ ] The llms test against the fixture package finds the derived command in the `llms.txt` line.
- [ ] All five Installation pages show the command as a copyable block; the page suite checks that the clipboard holds exactly the derived command.
- [ ] The command is text in the prerendered HTML.
- [ ] No `pnpm add` remains in the demos' prose.
- [ ] The `llms.txt` of table, schedule and calculation names their peers.
