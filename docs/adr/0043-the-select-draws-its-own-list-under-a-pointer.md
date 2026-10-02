# The select draws its own list under a pointer and the keys

Status: accepted
Date:   2026-10

The `Select` was the system's own control: a styled `<select>` whose list the
browser drew. In Firefox on Windows that list flickered as it opened - the
content a moment later than its window. Measured: our CSS changes nothing at
the opening in Chromium, WebKit or Firefox; Firefox on Linux, drawing the list
with the same code, shows it in one frame; and on Windows every select
flickered, the unstyled one too. The list is the browser's window, out of the
page's reach. The probe: `.scratch/select-listbox/spec.md`.

**Under a mouse, a pen and the keyboard the `Select` opens its own list**, in
the one popover, with the look and the keys of the `Combobox`'s list - the
library's three fields with a list now open the same list. **Under a finger the
system's picker stays**: the wheel on a phone is the better control there, and
the flicker is a desktop's. The two are told apart per interaction by the
pointer's type, never by a media query, so a laptop with a touch screen takes
the one its user reaches for.

**The `<select>` stays the field.** It keeps the value, the form - `name`,
`required`, reset, submit - the `ref`, `onChange` and the `<option>` children.
The list is drawn from its options; choosing writes the select's value and
fires its `input` and `change` events. A controlled select stays at its prop,
an uncontrolled one keeps what was chosen, and no caller changes a line. A
select with `multiple` is a list box with no popup and stays as it is.

**The keys are the Combobox's.** The keys that open the system's list - the
arrows, Alt with an arrow, F4, Space - open ours, on the chosen option. Enter
does not: a closed select passes it on, so a form submits and a table's grid
commits its edit (ADR-0036), and the Combobox's Enter opens nothing either.
Open, the arrows move, Home and End, Page Up and Page Down jump, typing goes to
the next option that begins with it, Enter and Space choose, Escape and Tab
close. Typing in a closed select keeps the system's behaviour.

**What it costs.** The select is no longer "maximum accessibility without
building one ourselves": the focus stays on the `<select>`, which carries
`aria-expanded`, `aria-controls` and `aria-activedescendant`, and the list says
through the shared announcer what VoiceOver does not read (the
listbox-announcements of the Combobox). The list follows the page's tokens
instead of the system's colours; forced colours draw it as they draw the
Combobox's.

## Considered

- **Leave it native.** Every select on every site flickers so in Firefox on
  Windows. Turned down by the user: the library's fields are meant to look
  finished, and the Combobox beside it did not flicker.
- **Always draw the list, under a finger too.** One path for every device, but
  it takes the wheel from a phone for a flaw a phone does not have.
- **`appearance: base-select`.** The platform's own customisable select draws
  the list in the page - in Chromium only; Firefox, where the flicker is, has
  none.
