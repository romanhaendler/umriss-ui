# One deck on a page, and toasts that stay are never pushed out

Status: ready-for-agent
Date:   2026-10-14
Origin: on core's Toast page, "Scan four parcels" (How many stand at once),
then "Edit the profile" (Inside a modal) and "Save": the toasts lie on top of
each other. Reproduced in Chromium against the demo at 0.38.0.

## Problem Statement

A reader of the Toast page who scans four parcels, opens the profile modal and
presses "Save" sees the failure "Profile not saved" lying on the parcel toasts.
Two cards stand at the same place, neither as part of a deck, and the
counter on the front card counts only one of them. The same happens without a
modal: "Go offline" (Keep it until it is closed) and then "Scan four parcels"
give two decks in the bottom-end corner, one on the other.

It looked like toasts with `duration: 0` did not join the deck. They do: two
"Go offline" toasts from one example stand as one deck. The cause is that every
example of the page, and the demo's root, has a `ToastProvider` of its own.
Each provider draws its own region with its own deck at the same corner; inside
a modal both regions move into the dialog's top layer and still lie on each
other. `duration: 0` only makes it visible: the timed toasts leave after five
seconds, the lasting one stays and is overlapped by the next example's deck.

The library already says "put it once at the root of the application", and a
real application has exactly one `ToastProvider`. The demo page breaks that
rule ten times over, which is how the overlap arose.

A second defect shows once all toasts share one deck: the limit pushes out the
oldest standing toast whatever it is. Four parcel scans push out a standing
"Profile not saved" (`danger`, `duration: 0`, with "Retry"), and three
newer toasts push out a `loading` toast, whose later `update` then goes
nowhere and whose outcome is never shown. A message that is meant to stay until
it is read, or that waits for its outcome, is lost.

## Solution

**Toasts never lie on each other on the demo pages.** Every page of the demo
behaves like one application: one `ToastProvider` at its root, one deck, every
example's toasts in it. Inside a modal the whole deck stands above the dialog,
as one deck.

**A toast that stays is never pushed out.** A toast with `duration: 0` and a
`loading` toast neither give way to newer ones nor count toward the limit. The
limit still caps the toasts that leave by themselves: with the default of 3,
up to three timed toasts stand, plus every lasting and every loading one.

**One provider is the rule, and the library says so.** In development, a second
`ToastProvider` mounted in the same document while another one stands reports
it on the console. Nothing changes in production.

## User Stories

1. As a reader of the Toast page, I want the toasts of every example to stand in one deck, so that no card ever lies on another.
2. As a reader, I want "Scan four parcels" followed by "Save" in the profile modal to give one deck above the modal, with "Profile not saved" in front, so that I can read it and press "Retry".
3. As a reader, I want the counter on the front card to count every standing toast of the page, so that it tells the truth.
4. As a reader, I want "Go offline" followed by any other example to give one deck, so that a lasting toast never ends up under another deck.
5. As a reader, I want the deck to leave the modal as one deck when the modal closes, so that nothing jumps apart.
6. As a reader of "Where they stand", I want a position button to move the page's deck to that place, so that I see what `toast.position` does to every toast of an application.
7. As a reader of "How many stand at once", I want "Scan four parcels" to leave only the last two parcels standing, so that I see what `toast.limit` does.
8. As a reader of "Hold the toasts", I want the switch to hold every toast of the page, so that I see that `held` holds the application's deck.
9. As a reader of the UmrissProvider page, I want "At the root" to keep its toast for eight seconds, so that the example still shows the setting it is about.
10. As a reader, I want a setting I changed in one example to stay for the page until I leave it, so that the next example I try shows the same application.
11. As a reader, I want the page's settings back at their defaults when I come back to the page, so that what I saw before does not surprise me.
12. As a user of an application, I want an error toast with `duration: 0` to stay until I close it, however many toasts arrive after it, so that I never miss a failure.
13. As a user, I want "Retry" on a lasting error toast to stay reachable while newer confirmations come and go, so that I can still act on it.
14. As a user, I want a `loading` toast to stay until its outcome replaces it, however many toasts arrive meanwhile, so that I learn how the work turned out.
15. As a user, I want the timed toasts to keep giving way as before, so that a burst of confirmations does not pile up.
16. As a user, I want a `loading` toast that has turned into its outcome to count toward the limit from then on, so that it behaves like every timed toast.
17. As a user, I want the toasts held back by `held` to follow the same rule when they come back, so that a lasting toast is not lost during a hold.
18. As a screen reader user, I want a lasting toast to stay in its live region while newer ones are announced, so that I can still reach it with Alt+T.
19. As an application developer, I want a console message in development when a second `ToastProvider` mounts, so that I notice two decks before my users do.
20. As an application developer, I want the documentation to say that an application has one `ToastProvider` and what happens with two, so that I put it once at the root.
21. As an application developer, I want the changelog to say that lasting and loading toasts no longer give way, so that I can check pages that sent many of them.
22. As a maintainer, I want a browser test that sends toasts from two examples and opens the modal, so that two decks on one page are caught.

## Implementation Decisions

**The limit (core, `ToastProvider`)**

- A toast *may give way* when it leaves by itself: its effective duration (its own, else the provider's) is above 0 and its tone is not `loading`.
- When a toast arrives, only the standing toasts that may give way are counted against the limit, and only they are pushed out, oldest first, with the reason `dismiss` as today. The new toast itself counts only if it may give way.
- The limit is applied when a toast arrives, as today. `update` pushes nothing out: a `loading` toast that turns into its outcome counts from the next arrival on. The deck may stand above the limit for a moment; that is accepted.
- The same rule holds during a hold: of the toasts arriving while held, only those that may give way are pushed out.
- The text of `update` ("a toast that gave way to newer ones - a `loading` one too") and the `limit` text of `ToastConfig` are rewritten to the new rule. `CONTEXT.md`'s entry **Toast** says: the oldest that leaves by itself gives way once the limit is reached.

**One provider per application (core)**

- The library does not merge providers. Two providers are two decks; that stays a misuse, not a feature.
- In development only (`import.meta.env?.DEV`, like the duplicate-key warning of `useTree`), a `ToastProvider` that mounts while another one is mounted in the same document writes one `console.warn` prefixed `@umriss-ui/core:` naming the rule ("one `ToastProvider` per application, at its root"). Once per provider, nothing in production, no throw.
- `ToastProvider`'s text and the Toast page's Known limits name the rule and the consequence of breaking it (two decks at the same place).

**The demo: a page is one application**

- The demo's root keeps its one `ToastProvider`, and it gets a demo-only setting of its own: the `toast` configuration (position, limit, duration) and `held` the page's deck runs with. It starts at the defaults and goes back to them when the page changes.
- No example has a `ToastProvider` of its own any more. Examples 01–06 and 09 of the Toast page and the scenario "Dispatch a tour" use the root's; their comment "`useToast` needs a `ToastProvider` above it" stays true.
- The examples whose subject is a setting of the provider write that setting to the page's root when the reader acts, not on mount (several are on one page at once): "Where they stand" its position before it sends, "How many stand at once" its limit before it scans, "Hold the toasts" the switch's value, UmrissProvider "At the root" its duration before it deploys, "Everything at once" its short duration before it rebooks. The setting stays for the page until another example changes it or the page is left.
- "Everything at once" keeps its own `portalTarget` for its other overlays; its toasts stand in the page's deck.
- The visible code of those examples shows the setting where an application writes it (`UmrissProvider toast={…}` and `ToastProvider held={…}` at its root), not the demo's seam (user decision, 2026-10-14). This needs a third rule in the demo's source rules ("the file IS the example", which allows only two pure string rules and asks to question `?raw` before a third): a marked demo-only part of an example file is replaced, as text, by the root it stands for. The rule is pure string work like the other two, is written down and reasoned in the same place, and is tested like them; a reader never sees a demo-only API in an example's code.

## Testing Decisions

A good test checks what the reader sees and what `onClose` reports: which toasts stand, whether two cards lie on each other, whether "Retry" can be pressed. It does not check how many regions the DOM holds as a goal in itself, nor the provider's internal lists.

- **Unit, `tests-unit/toast.test.tsx`, `describe("Toast – limit")`** (prior art: "lets the oldest give way to the fourth, as dismissed", "takes the limit from the provider", and the limit case of the hold):
  - a `duration: 0` toast followed by four timed ones stays, and of the timed ones the oldest gives way;
  - a `loading` toast followed by four timed ones stays; its `update` to `success` then shows the outcome;
  - a `loading` toast turned into `success` gives way at the next arrival beyond the limit;
  - a provider default of `duration: 0` makes every toast lasting: none gives way;
  - during a hold, a lasting toast among four arrivals comes back.
- **Unit, the development message:** two providers mounted at once write one `console.warn`; one provider, or two after each other, write none.
- **Browser, `tests-visual/features-basics.spec.ts`**, beside the tests of "Inside a modal" (prior art: `insideAModal.ts` with `failToSave` and `sampleFrames`):
  - "Scan four parcels", then the modal's "Save": every card's box in every frame for 500 ms overlaps another only as the deck stacks it (one deck, the counter names all standing toasts), and "Retry" at its point is "Retry";
  - "Go offline", then "Scan four parcels" without a modal: one deck, "Working offline" still stands after the scans;
  - the existing tests of "Where they stand" and "How many stand at once" stay green against the new demo.
- `pnpm check core`, `pnpm check:site`, `pnpm test:visual:quick core`, and the full visual suite before the release; the screenshots of the Toast page are renewed where the deck now holds toasts of several examples.

## Out of Scope

- Merging several `ToastProvider`s into one deck, or one provider forwarding to an outer one: a real application has one.
- Separate React roots with a provider each (micro-frontends): two decks, reported by the development message.
- A queue for toasts beyond the limit; the limit on `update`.
- Exempting toasts with an action ("Undo"): they leave by themselves and keep giving way.

## Further Notes

- Confirmed by the user on 2026-10-14: settings examples write the page root's setting on interaction. The alternative considered and dropped was giving each example's toasts a box of their own (its stage as the containing block); it keeps settings local but shows toasts at a place no application has.
- The changelog entry goes under **Changed**: lasting and `loading` toasts no longer give way to the limit.
