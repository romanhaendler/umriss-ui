# The select draws its own list

Status: ready-for-agent
Date:   2026-10-02
Origin: the user, on the `Select` "Cost centre": "Da ist für einen winzigen
Moment irgendwie die Farbe oder der Inhalt anders" - in Firefox on Windows. After
the measurement below: "Ja aber wie lösen wir das denn jetzt?", and the choice of
"own list on the desktop" over "always our own" and "leave it native".

## What was measured

- Page side, every few ms around the click: Chromium, WebKit and Firefox change
  no colour, background or type of the select - only `:focus`, `:active`,
  `:open`.
- Firefox on Linux (Docker, Xvfb, the whole screen at 60 fps, real X clicks) -
  the same `SelectChild`/`SelectParent` code that draws the list on Windows -
  shows the list in one frame, finished. No frame in between.
- Firefox on Windows, the user's test page of eight variants: **all eight
  flicker, the unstyled native select too** - "als ob der Inhalt minimalst
  später da wäre". The list is Firefox's own window; Windows shows it a moment
  before its content. Nothing in our CSS can reach it.

## Decided (ADR-0043)

1. **Under a mouse, a pen and the keyboard the `Select` opens its own list**, in
   the one popover, with the look and the keys of the `Combobox`'s list. Under a
   finger the system's own picker stays - the wheel on a phone. Told apart per
   interaction by `pointerType`, as `Toast` does, never by a media query: a
   laptop with a touch screen takes both.
2. **The `<select>` stays the field.** It keeps the value, the form (`name`,
   `required`, reset, submit), the `ref`, `onChange` and the `<option>`
   children. The list is drawn from its options; choosing writes the select's
   value and fires its `input` and `change` events, so a controlled and an
   uncontrolled select behave as before. Nothing in the API changes.
3. **The keys of the Combobox.** Closed: ArrowDown/ArrowUp, Alt+Arrow, F4,
   Space and Enter open the list on the chosen option (each of them opens the
   system's list somewhere, so each is ours). Open: the arrows move, Home/End,
   PageUp/PageDown, typing jumps to the next option that starts with it,
   Enter/Space choose, Escape and Tab close. Typing in a closed select keeps the
   system's behaviour.
4. **The list says what VoiceOver does not**, as the Combobox does
   (listbox-announcements): the count on opening, the option moved onto. The
   focus stays on the select; it carries `aria-expanded`, `aria-controls` and
   `aria-activedescendant`.
5. **One list for both.** The listbox markup and styles of the Combobox move to
   one internal piece both draw; the Combobox's pictures do not change.
6. **What stays native:** `multiple` (a list box, no popup), a disabled select,
   and every touch.

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | One list for Combobox and Select (extraction, no visible change) | M |
| 02 | The select opens it: pointer, keys, choosing, form | L |
| 03 | Announcements and ARIA | S |
| 04 | Docs: component comment, demo lead, README, CHANGELOG, ADR-0043 | S |
| 05 | Tests and baselines, Firefox on Linux recorded | M |
| 06 | Final polish, accepted by the user on the rendered page | S |

## Testing

- jsdom: opening by pointer and by each key, choosing fires `change`, a
  controlled select stays at its prop, a form reset, `multiple` and touch stay
  native, the announcements.
- Browser suite: the list opens, chooses, closes in Chromium; the field holds
  its width (ADR-0041).
- Firefox on Linux in Docker, recorded at 60 fps: the system's popup never
  appears under a mouse.
- The user, on Windows in Firefox: no flicker.

## Out of scope

- A searchable select: that is the `Combobox`.
- Drawing the list under a finger.
