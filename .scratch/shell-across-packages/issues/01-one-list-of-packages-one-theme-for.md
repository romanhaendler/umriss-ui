# 01: One list of packages, one theme for the whole site

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/shell-across-packages/spec.md`

**What to build:** Prefactor and first visible result. The shell gains one dependency-free module listing the five packages in their fixed order with directory id, display name, npm name, role and start page (today's page ids until `sidebar-tree` lands). The five copies of the theme hook leave the demos' Apps; the shell owns the only one. The theme is stored under `umriss-ui:theme` (`light` or `dark`), follows the system live while nothing is stored, survives storage that throws, and is applied before the first paint by a short inline script in each demo's `index.html` (and so in every prerendered page). The switch becomes a plain shell button with a sun/moon glyph, named "Switch to dark theme" / "Switch to light theme".

- [ ] The shell suite, in every demo: pressing the switch sets `color-scheme` and stores the key; a reload keeps it, with the root dark before the app script runs.
- [ ] With storage cleared, the emulated system scheme decides; with storage throwing, the switch still toggles.
- [ ] On the built site the chosen theme survives a move from one package's demo to another.
- [ ] No demo App contains a theme hook of its own.
- [ ] The package list loads in Node without a bundler.
- [ ] The switch's glyph passes the glyph check.
