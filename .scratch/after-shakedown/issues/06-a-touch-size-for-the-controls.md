# A touch size for the controls

Type:   grilling
Status: open

## Question

How do umriss controls reach a touch size, and what else does a touch screen get from the library?

`--u-control-height` stays 32 px under `pointer: coarse` and `ControlSizeProvider` offers `sm` and `md`; the
Tag remove (16x16) and the NumberInput stepper (20 px) fall below WCAG 2.5.8's 24 px
(`.scratch/shakedown/mobile-touch.md` 1). Five personas wished for touch (`wishes.md` section 2).

- The mechanism: a `touch` size in `ControlSizeProvider` the app chooses, or `@media (pointer: coarse)` raising
  the height to 44 px by itself, or both. What happens to a dense data screen on a touch laptop?
- What "touch" means for the whole library (media query, provider, both) - the native-picker ticket reuses it.
- Which other touch needs are the library's: safe-area insets (`mobile-touch.md` 2), `enterkeyhint` and
  `autocomplete` defaults (5), `prefers-contrast: more` (6), small targets (TreeView chevron, Splitter,
  `mobile-native.md` 7), the schedule plot trapping vertical scroll (`mobile-native.md` 9).
- The touch wishes: a bottom sheet, a media-query / coarse-pointer hook, a bottom tab bar, a touch route to a
  Tooltip, a long-press helper for ContextMenu, TabList overflow (`mobile-touch.md`, `mobile-native.md` 4-6,
  wishes).

If "how should 44 px look on a dense screen" stays open, a prototype is the next step.
