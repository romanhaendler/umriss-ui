# 01: EN/DE switch in the core demo

Status: done
Blocked by: `shell-across-packages` 02 (The header connects the five packages)
Spec: `.scratch/language-switch/spec.md`

**What to build:** The core demo's header shows a group of two pressed buttons, "EN" and "DE", directly before the theme control. The group is named "Language of the components", and each button's name is "English" or "Deutsch". The shell takes the switch as a per-demo option.

**Choosing DE:**
- Wraps every example stage and the scenarios page in the library's language provider with the German wording and German formats, through the public subpath.
- Gives each stage `lang="de"`.
- Shows a one-line notice at the top of the page, linking to Language, saying the code shown is unchanged.

**What stays English:** prose, headings, props tables, code, the palette, the shell's own words, the prerendered text and the address.

The choice is stored under `umriss-ui:language` (`en`/`de`) and read once at start. If storage is unreadable, the language is English.

- [x] Pressing DE turns a library text on core's DatePicker page (a date and a button label) into German words and German notation, at once and without a reload.
- [x] The notice appears with its link to Language. The `h1` and the palette placeholder stay English.
- [x] Example stages carry `lang="de"`; the document keeps `lang="en"`; the address is unchanged.
- [x] A reload keeps German; pressing EN restores everything.
- [x] The Language page's own fixed-language examples render as before under either choice.
- [x] Shell suite probe and an axe run with German on are green. Screenshot baselines are unchanged. (Two header pictures moved, see Deviations.)

## Comments

**Delivered.** `packages/demo/src/Language.tsx` holds the switch and everything it changes. The shell takes it as the option `german` (`ShellProps`): the German pair, which the demo hands over from `@umriss-ui/core/wording/de`. Core's `App.tsx` passes `GERMAN_WORDING` and `GERMAN_FORMATS`. A demo that passes nothing shows no switch, and the shell never imports the subpath itself, so charts needs no alias for it.

- **The switch.** It stands in the header's right-hand group, directly before the theme button: a `group` named "Language of the components" with two plain buttons, "EN" and "DE". Their names are "English" and "Deutsch" (the second with `lang="de"`), and the active one carries `aria-pressed`.
- **The stored choice.** It lives under `umriss-ui:language` (`en`/`de`) and is read once at start. Nothing stored, or storage that throws, means English.
- **The stages.** Every example stage, the configurator's stage and every scenario stage is now a `Stage`. While DE is on, that is a `LanguageProvider` with the German pair, and the stage carries `lang="de"`. While EN is on, it is the same provider with nothing passed. The tree therefore stays the same across a switch, and examples keep their state.
- **The notice.** While DE is on, it is the first line of every component page and of the scenarios page. It links to Language: core's own page here, and the neighbour address `/core/language/` from the other demos.
- **What does not change.** Prose, tables, code, the palette (it has its own provider beside `main`), the document's `lang` and the address.

**Tests.** The shell suite (`packages/demo/checks/shell.ts`) takes a new optional probe, `language`: a page, plus library texts and button names as [English, German] pairs. Core's probe uses the DatePicker page: `18/03/2026` → `18.03.2026` and "Clear date" → "Datum leeren". New tests:

1. DE, pressed from the keyboard, turns the texts German at once and without a reload.
   - The notice appears with its Language link.
   - Every `.exampleStage` carries `lang="de"`, and `<html lang>` stays `en`.
   - The `h1`, the address and the palette's placeholder stay as they were.
   - A reload keeps German, and the scenarios page shows the notice and German stages.
   - EN restores everything: storage holds `en`, and no stage has `lang`.
2. With storage throwing, the page starts in English and the switch still switches.
3. axe (`findings`) on the page with German on.
4. A demo without the probe shows no switch. For now that is table, schedule, calculation and charts.

Core's `features-shell.spec.ts` also checks the Language page: with German on, the side-by-side example still shows `1,284,311` beside `1.284.311`.

Results:

- `pnpm lint`, `pnpm typecheck` and `pnpm test:unit` are green. One table smoke test timed out under load and passed on rerun.
- Under the lock, `features-shell` and `features-page` in ui-light and table-light: 105 passed. The one failure, the Button configurator's background check, was a flake and passed 3 of 3 on rerun.
- After the rebase, `features-shell` in ui-light and calculation-light: 90 passed, 9 skipped.

**Baselines moved.** Two of core's whole-viewport pictures show the header, and both moved, light and dark. I looked at the new images.

- `toast-top-center`: the search moved left to make room for the new switch.
- `drawer-beside-a-service-list`: this baseline was stale in other ways too (the old "Umriss UI" header, the old sidebar and section headings), and the renewal takes those in.

`palette-window`, `palette-resting`, `toast-phone` and the forced-colours pictures still pass. Two other failures are not this ticket's and stay as they were: `tokens-first-group` (light and dark; the token table's rows differ) and `example-language--own-components` (ui-light, already reported in shell-across-packages 01).

**Deviations.**

- **Baselines.** The spec expected none to change. A new control in the header moves every picture that shows the header (see above).
- **The Language page.** The spec assumed its examples keep their languages because "the innermost provider wins". They do not: their English halves stand without a provider and would turn German. So an example whose source contains `<LanguageProvider` keeps the languages its code names, and its stage gets neither German nor `lang`. That covers the five Language page examples and calculation's "Given in German".
- **Toasts and overlays.** Toasts come from the root `ToastProvider`, outside the stages. Portalled overlays (a DatePicker's calendar) stand outside the stage that carries `lang`. Their words still turn German through context, but the `lang` attribute does not reach them.

**For ticket 02.** Table and schedule need the `@umriss-ui/core/wording/de` alias in their `vite.demo.config.ts` (calculation already has it). Then each passes `german` from its App and a `language` probe in its `features-shell.spec.ts`. After that, the "no switch" test covers charts alone.
