# 01: EN/DE switch in the core demo

Status: ready-for-agent
Blocked by: `shell-across-packages` 02 (The header connects the five packages)
Spec: `.scratch/language-switch/spec.md`

**What to build:** The core demo's header shows a group of two pressed buttons, "EN" and "DE", directly before the theme control. The group is named "Language of the components", and each button's name is "English" or "Deutsch". The shell takes the switch as a per-demo option.

**Choosing DE:**
- Wraps every example stage and the scenarios page in the library's language provider with the German wording and German formats, through the public subpath.
- Gives each stage `lang="de"`.
- Shows a one-line notice at the top of the page, linking to Language, saying the code shown is unchanged.

**What stays English:** prose, headings, props tables, code, the palette, the shell's own words, the prerendered text and the address.

The choice is stored under `umriss-ui:language` (`en`/`de`) and read once at start. If storage is unreadable, the language is English.

- [ ] Pressing DE turns a library text on core's DatePicker page (a date and a button label) into German words and German notation, at once and without a reload.
- [ ] The notice appears with its link to Language. The `h1` and the palette placeholder stay English.
- [ ] Example stages carry `lang="de"`; the document keeps `lang="en"`; the address is unchanged.
- [ ] A reload keeps German; pressing EN restores everything.
- [ ] The Language page's own fixed-language examples render as before under either choice.
- [ ] Shell suite probe and an axe run with German on are green. Screenshot baselines are unchanged.
