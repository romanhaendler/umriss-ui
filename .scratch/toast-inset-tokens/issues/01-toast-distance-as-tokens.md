# 01 — The toast's distance from the window's edge as tokens

Status: done

Blocked by: None (can start immediately)

Spec: `.scratch/toast-inset-tokens/spec.md`

## What to build

An application with a fixed header sets `--u-toast-inset-top` on `:root` and
every `top-*` toast appears below the header, at every width; a toolbar at the
bottom is kept clear the same way with `--u-toast-inset-bottom`. Nobody who
sets neither token sees a pixel move. The two tokens stand on the Theming page
with their defaults, the page says they take effect on `:root` only, and the
"Where they stand" example points at them - so no application needs a
selector on the toast's internal markup again (ADR-0045).

## Acceptance criteria

- [x] Both tokens are declared in core's token stylesheet, in a section of their own, on `:root` in `umriss.tokens`; the phone default stands in a `max-width: 600px` block in the same layer.
- [x] The toast region reads the top token at its top edge and the bottom token at its bottom edge; its phone rule no longer sets `top`/`bottom` and keeps everything else it does.
- [x] Without the tokens set, the region stands 20 px from its edge at 1280 px and 16 px at 320 px, for all six positions - as before.
- [x] With the top token set on `:root`, all three `top-*` positions stand at its value at 1280 and at 320 px, and the `bottom-*` positions do not move; the same the other way round for the bottom token.
- [x] Each token's comment says its phone default and that it takes effect on `:root`; both rows appear in the Theming page's token table and in the llms text.
- [x] The Theming page's section on a token for one region names the toast as the exception (it hangs in `body`, not in the region).
- [x] The "Where they stand" example's lead mentions the two tokens.
- [x] Core's changelog has a feature entry.
- [x] Playwright measures the cases above on the "Where they stand" example; lint, types, unit and visual suites are green.

## Comments

Delivered. The tokens stand in their own "Toast" section of the token
stylesheet, the phone default in a `max-width: 600px` block in the tokens
layer; the region reads each once and its phone rule no longer sets the edge.
Six Playwright tests in the basics feature spec measure all six positions at
1280 and 320 px, unset and with each token on `:root`. The Theming page's
portal limit names the two tokens; the "Where they stand" lead points at them.
