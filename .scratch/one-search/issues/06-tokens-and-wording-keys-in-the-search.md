# 06: Tokens and wording keys in the search

Status: done
Blocked by: 03 (One index for the site: all five packages from any demo), `theming-and-wording-reference` 02 (The charts' tokens on the Theming page), `theming-and-wording-reference` 04 (The wording tables on the Language page)
Spec: `.scratch/one-search/spec.md`

**What to build:** Every token joins as a `token` entry, grouped `<package> · Theming` and landing on its row. Every wording key joins as a `wording` entry, grouped `<package> · Language` and landing on its row, with its English and German texts as keywords. A reader can therefore type a string seen on screen, in either language, and find the key behind it.

- [x] `--u-accent` finds `--u-color-accent` and lands on its row on the Theming page.
- [x] Typing the English text "No matches" and a German wording text each find their key and land on its row.
- [x] Every token and wording entry's anchor exists, and the merged index stays under 500 kB (guard).
- [x] Shell suite token and wording probes green in core.

## Comments

**Delivered.** `referenceEntries` in `packages/demo/src/search.ts` makes an
entry of every row in a page's reference tables, and `renderLlms` appends
those entries to the fragment. The tables come from `LlmsJob.references`,
the same ones the page mounts and llms-full carries.
- Label: the row's first cell (`--u-color-accent`, `noMatches`,
  `asOfAgo(duration)`).
- Group: `<package> · <page>`, so `core · Theming` and `core · Language`.
- Address: the page plus the row's anchor
  (`/core/language/#wording-presets.today`).
- Kind: a table with an English and a German column is wording, and those
  two texts are the entry's keywords. Any other table holds tokens, which
  get no keywords.

Core's fragment gains 145 tokens (116 core, 29 charts) and 333 wording
entries (295 wording, 26 charts wording, 12 formats). The merged
`site/search.json` is 254 kB. `pnpm build:pages` passes with its guard
(`searchFaults`), so every new anchor exists.

**Tests.** `tests-unit/search.test.ts`, "the search fragment's tokens and
wording keys", checks three things:
- one entry per row, with its kind, label, group and address;
- a wording key's English and German as its keywords, and none on a token;
- every address on an anchor of the prerendered page.

The shell suite has a new `rows` probe, "<query> finds <label> and lands on
its row". Core sets it for three queries:
- `--u-accent` → `--u-color-accent`;
- "No matches" → `noMatches`;
- "Stand unbekannt" → `asOfUnknown`.

lint, typecheck and test:unit are green. After a fresh `pnpm build:pages`,
`features-shell` in `ui-light` and `table-light` gave 113 passed and
1 skipped, with the built-site probes included.

**Baselines.** None moved: nothing visible changed.

**Deviations.**
- Formats join as `wording` entries as well. They are keys on the Language
  page, and their keywords are their sample outputs.
- The charts' tokens and wording stand under `core ·`, because they live on
  core's pages.
- No changelog entry, because nothing changed for a caller of a package.
