# Shakedown: ten everyday screens built with core alone (0.40.4)

Status: needs-triage

Login, settings, a 15-field form, a wizard, notifications, upload, profile, search, an app shell and an admin
list of 200 users, built with core only (react-router 7, Vite 8 with `cssTarget`, TS 7 `skipLibCheck:false`,
Chromium), 514 lines of TSX, 2026-10-24. Plus a coverage diff against MUI, Mantine and Radix Primitives
(from knowledge of their docs, not fetched).

## Findings

1. **[Break] Playwright's `.check()` / `.uncheck()` time out on `Checkbox` and `Switch`:** the real input is
   1×1 px with opacity 0 and the drawn box/track intercepts the pointer. Every consumer testing with
   Playwright needs `{force:true}` or a label click. Idea: stretch the input over the box (`inset:0`).
2. **[Misfit] `Button loading` sets `disabled`, so a focused submit button drops focus to `<body>`** and
   keeps it there after loading. Idea: `aria-disabled` and ignored clicks while loading.
3. **[Misfit] `Checkbox` has no invalid state:** inside a `FormField` with `error` it gets the description
   but no `aria-invalid`, and the box stays grey while every other field turns red. `Switch` has `invalid`.
4. **[Misfit] A closed `Drawer` or `Modal` keeps its children mounted:** duplicate labels in the DOM (E2E
   selectors match twice), effects run while closed. Render only while open, or document it.
5. **[Look] Radios look like rounded squares**, close to an unchecked checkbox (check against the design
   language before changing).
6. **[Look] A disabled primary button in dark mode is a light grey block**, the brightest thing on the bar.
7. **[Misfit] `VisuallyHidden` is `position:absolute`:** inside a non-positioned scrolling wrapper it caused
   51 px of page overflow at 375 px.

## What the screens needed beyond core (wishes, all unlisted)

| Wish | Screen | Workaround | Elsewhere |
|---|---|---|---|
| Password field with reveal toggle; an end-adornment slot on `Input` | login | 12 lines + icons | Mantine `PasswordInput` |
| An icon set (a "more" glyph for menus, eye, search) | login, shell, admin | inline SVGs | MUI icons, react-icons |
| Pagination in core (it lives in `@umriss-ui/table`) | search, admin | 14 lines | MUI, Mantine `Pagination` |
| Avatar with initials and image fallback | profile, shell | 12 lines | MUI, Mantine, Radix `Avatar` |
| Inline edit | profile | 14 lines | - |
| AppShell, NavLink, bottom navigation | shell | 30 lines | Mantine `AppShell`/`NavLink`, MUI `BottomNavigation` |
| A list / list item row, a dot badge | notifications | 20 lines | MUI `ListItem`, `Badge dot` |
| Per-file progress and status in `FileInput` | upload | 25 lines | Mantine Dropzone |
| A clickable Stepper step, focus on step change | wizard | 15 lines | MUI `StepButton` |
| A table (core only) | admin | 25 lines; the table package would replace ~40 | MUI DataGrid, TanStack |

Not needed by any screen: Autocomplete (Combobox), Rating, ColorPicker, Transfer list, Timeline, Image, Pill,
ToggleButton (SegmentedControl), Fab, Hover card, Backdrop, Container, Aspect ratio, Scroll area. never:
ADR-0032 carousel and rich text - no screen needed them. never: ADR-0060 form validation - **Instead holds**:
own validation through `FormField error`/`required`, about 20 lines, no friction.

## Held up

`aria-invalid` and `aria-describedby` through `FormField` on 7 of 8 field kinds (Checkbox excepted) · an
error summary's links focus every control, Combobox and DatePicker included · router `useBlocker` with
`ConfirmDialog`: Escape keeps the page and returns focus · Menu at 375 px fits and returns focus · Drawer
navigation, the `Ctrl+K` palette and `announce` work first time · `FileInput` as a pure drop zone names
refused types · dark mode on the settings screen · no page overflow at 375 px apart from finding 7 ·
StrictMode clean · uniform heights and radii in field rows.
