# 02: The demo page is one application

**What to build:** Every page of the demo behaves like one application: one `ToastProvider` at the demo's root, one deck, the toasts of every example in it. "Scan four parcels" followed by "Save" in the profile modal gives one deck above the modal, with "Profile not saved" in front and "Retry" pressable; "Go offline" followed by "Scan four parcels" gives one deck in which "Working offline" still stands. The examples about a setting change the page's deck when the reader acts, and still show the setting where an application writes it.

**Blocked by:** 01 (the browser test needs "Working offline" to survive the scans)

**Status:** done

Spec: `.scratch/toasts-one-deck/spec.md` (Implementation Decisions "The demo: a page is one application", User Stories 1–11, 22)

- [x] The demo's root keeps its one `ToastProvider` with a demo-only setting of its own (toast position, limit, duration, `held`), at the defaults on every page and back to them when the page changes
- [x] No example or scenario has a `ToastProvider` of its own (Toast 01–10, UmrissProvider 01 and 03, "Dispatch a tour")
- [x] "Where they stand" writes its position before it sends, "How many stand at once" its limit before it scans, "Hold the toasts" the switch's value, UmrissProvider "At the root" its duration before it deploys, "Everything at once" its short duration before it rebooks; the setting stays for the page until another example changes it; nothing is written on mount
- [x] "Everything at once" keeps its `portalTarget` for its other overlays; its toasts stand in the page's deck
- [x] The shown code of those examples is their root (`UmrissProvider toast={…}`, `ToastProvider held={…}`), never the demo's seam: a third source rule beside the two existing ones, pure string work, marked in the example file, written down and reasoned where the other two are (the note there that a third rule means questioning `?raw` is answered, not deleted), with unit tests like theirs
- [x] Browser test beside the tests of "Inside a modal": "Scan four parcels", then the modal's "Save"; in every frame for 500 ms no two cards overlap other than as the deck stacks them, the counter names every standing toast, and the element at "Retry"'s point is "Retry"
- [x] Browser test: "Go offline", then "Scan four parcels" without a modal; one deck, "Working offline" still stands
- [x] The existing tests of "Where they stand", "How many stand at once", "Hold the toasts", "Inside a modal" and the UmrissProvider examples stay green, adapted only where they relied on a provider per example
- [x] `pnpm check core`, `pnpm check demo`, `pnpm check:site`, `pnpm test:visual:quick core` green
- [x] One commit, no push

## Comments

- Built: `core/demo/pageToast.tsx` (`PageToast` root, `usePageToast`), `main.tsx` uses it; examples lost their providers. The seam takes a second argument `run(toast)` because `toast()` captures duration and limit at its creation: the click that changes the setting would otherwise scan under the old one. The setting is cleared when the writing example unmounts (page left). Third source rule `withRoot` (`// demo-only:start|shown|end`) in `tooling/source.ts`, with tests. `PageToastSetting` is `Pick`s of the real provider props, so the props check still counts `UmrissProviderProps.toast` and `held` as shown.
- Deviation: the "no two cards overlap" browser check counts decks per frame (places holding cards) instead of box geometry, because leaving and entering cards legitimately share a box in one deck. The "Go offline" test already passed before the demo change (ticket 01's limit rule), it stays as a guard.
