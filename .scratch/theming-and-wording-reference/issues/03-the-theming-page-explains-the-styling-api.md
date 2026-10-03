# 03: The Theming page explains the styling API (ADR-0045)

Status: done
Blocked by: 01 (A Theming page with core's token table)
Spec: `.scratch/theming-and-wording-reference/spec.md`

**What to build:** The Theming page gets its lede (a token is the styling API), up to three paragraphs (cascade layers and why unlayered CSS wins; `light-dark()` and `color-scheme`; the rule that `data-*` attributes and class names are internal), and three examples as files like every example: "Accent for the application", "A token for one region", "A dark region". The two paragraphs about tokens and light/dark on core's Installation page shrink to one sentence linking to Theming. ADR-0045 "Tokens are the styling API; data attributes are not" is written.

- [x] The three examples run and copy, and pass the own-data check.
- [x] The page states that `data-*` attributes and class names are not stable.
- [x] The Theming page head and the three examples join the core screenshot baselines.
- [x] ADR-0045 is in the ADR directory and its index.

## Comments

Delivered:

- The Theming page (`packages/core/demo/outline.ts`) has its final lede: the tokens are the whole styling API. Its about has three paragraphs. The first covers the cascade layers and why unlayered CSS wins. The second covers `light-dark()` and `color-scheme`, which the library sets nowhere. The third gives ADR-0045's rule: style through tokens, because `data-*` attributes and class names are internal and may change in any version.
- The page also has three Known limits:
  - There is no theme object, provider or switch.
  - A token that names another resolves where it is declared. So `--u-focus-ring` keeps the application's accent inside a region that overrides `--u-color-accent`.
  - A portalled panel takes the tokens and the scheme of the place it lands. The way around this is `portalTarget`.
- There are three examples:
  - `Theming/01-accent-for-the-application.tsx` sets the seven accent tokens as indigo, light and dark.
  - `02-a-token-for-one-region` is from ticket 01 and is unchanged.
  - `03-a-dark-region.tsx` sets `color-scheme: dark` on one container.
- The Installation page's paragraphs on tokens and on light and dark are now one sentence that links Theming. The fonts sentence stays. The limit "No theme object and no theme switch" moved to Theming.
- ADR-0045, `docs/adr/0045-tokens-are-the-styling-api-data-attributes-are-not.md`, is in `docs/adr/README.md`. Core's CHANGELOG has an entry for it.

Deviation: Installation's examples "Override tokens" and "Light and dark" moved to Theming (with `git mv`) and became examples 01 and 03, reworked, so the site does not carry the same two examples twice. As a result the anchors `/installation/#override-tokens` and `#light-and-dark` no longer exist, and the Installation page keeps only "First component".

Tests: lint, typecheck and test:unit are green. The plant-word guard caught a class name in a code comment, which was renamed. Playwright in ui-light and ui-dark:
- screenshots and forced-colors filtered to theming and installation: 18 passed;
- features-page, features-shell and own-data in ui-light, plus own-base and accessibility on theming and installation: 44 and 4 passed.

Baselines, light and dark each:
- New: `example-theming--accent-for-the-application`, `example-theming--a-dark-region`, `forced-theming--accent-for-the-application`.
- Moved:
  - `page-theming`, because of the lede and the about;
  - `page-installation`, because the about is shorter;
  - `example-theming--a-token-for-one-region`, because it is no longer the hero and now has its head row.
- Removed: `example-installation--override-tokens`, `example-installation--light-and-dark` and `forced-theming--a-token-for-one-region`, because the first example is now the accent example.
