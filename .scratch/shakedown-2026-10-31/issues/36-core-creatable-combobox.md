# 36: Core - a creatable Combobox

Status:     ready-for-agent
Blocked by: 07

Spec: `../spec.md`, decision 8. Source: H5 wish (MUI Autocomplete `freeSolo`).

- [ ] For string values, the Combobox can take typed text as the value (`creatable` or the name decided in the ticket): an "Add "…"" option or Enter on text that matches no option, reported through `onValueChange`; optional `onCreate` for the app to add it to the options.
- [ ] Announced and in both wordings; the form posts the text.
- [ ] Unit tests; an example; `pnpm check core`, `pnpm check:site`.

## Comments
