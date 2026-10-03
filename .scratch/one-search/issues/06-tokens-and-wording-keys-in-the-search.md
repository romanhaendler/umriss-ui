# 06: Tokens and wording keys in the search

Status: ready-for-agent
Blocked by: 03 (One index for the site: all five packages from any demo), `theming-and-wording-reference` 02 (The charts' tokens on the Theming page), `theming-and-wording-reference` 04 (The wording tables on the Language page)
Spec: `.scratch/one-search/spec.md`

**What to build:** Every token joins as a `token` entry, grouped `<package> · Theming` and landing on its row. Every wording key joins as a `wording` entry, grouped `<package> · Language` and landing on its row, with its English and German texts as keywords. A reader can therefore type a string seen on screen, in either language, and find the key behind it.

- [ ] `--u-accent` finds `--u-color-accent` and lands on its row on the Theming page.
- [ ] Typing the English text "No matches" and a German wording text each find their key and land on its row.
- [ ] Every token and wording entry's anchor exists, and the merged index stays under 500 kB (guard).
- [ ] Shell suite token and wording probes green in core.
