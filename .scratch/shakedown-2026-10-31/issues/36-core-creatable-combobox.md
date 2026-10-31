# 36: Core - a creatable Combobox

Status:     done
Blocked by: 07

Spec: `../spec.md`, decision 8. Source: H5 wish (MUI Autocomplete `freeSolo`).

- [x] For string values, the Combobox can take typed text as the value (`creatable` or the name decided in the ticket): an "Add "…"" option or Enter on text that matches no option, reported through `onValueChange`; optional `onCreate` for the app to add it to the options.
- [x] Announced and in both wordings; the form posts the text.
- [x] Unit tests; an example; `pnpm check core`, `pnpm check:site`.

## Comments

**Delivered (2026-10-31, run coordinator).** `creatable` and `onCreate(text)` on Combobox: typed text that
matches no label (by `fold()`) shows as a last row `Add "text"`; Enter on it or a click makes the text the
value and calls `onCreate`; the field shows it without it standing in `options`; it posts and resets like
any value; announced (`optionAdded`), wording `createOption`. Example "A value that is new" - looked at:
reads clearly. Decided: with partial matches Enter keeps the first match, the Add row is reached by
arrow; leaving the field does not create; no type-level restriction to strings (documented).
