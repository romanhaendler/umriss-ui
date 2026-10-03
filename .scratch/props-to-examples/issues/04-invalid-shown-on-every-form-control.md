# 04: `invalid` shown on every form control

Status: done
Blocked by: 03 (A prop without an example fails the build)
Spec: `.scratch/props-to-examples/spec.md`

**What to build:** One example "With an error" on each of the 13 pages whose control takes `invalid` — Input, Textarea, NumberInput, Switch, FileInput, Select, Combobox, MultiSelect, DatePicker, DateTimePicker, DateRangePicker, DateTimeRangePicker and the TreeView page for `TreeSearch` — each showing the control invalid inside a FormField with its message. The 13 entries leave core's exception list.

- [x] 13 new examples, each one file with its own data, a title and a lead, runnable as copied (own-data check green)
- [x] Each `invalid` row's "Shown in" names its page's new example first
- [x] Core's exception list no longer holds any `invalid` entry, and the gate passes
- [x] Screenshot baselines exist for the new examples, light and dark

## Comments

Delivered: one example "With an error" on each of the 13 pages. On the twelve control pages it stands right after States. On TreeView it stands after "Search with the path", because that example introduces `TreeSearch`. The examples after it moved one number down; the example ids are unchanged. Each example runs a live check on its own state. The check's reason goes to the `FormField` as `error`, and its verdict goes to the control as `invalid={error !== undefined}`. So the field is red with its message, and it clears once the value passes. The data and messages come from the page's States example: postcode, root cause, quantity, tier 1 paging, postmortem, VAT rate, vehicle, skills, delivery date, resolved time, leave, downtime. On TreeView, an alert rule's services must be ticked. `packages/core/demo/unshown.json` lost its 13 `invalid` entries (52 → 39). `TreeSearchProps.invalid` is now shown by its own example, and the TreeView example comes first in its row. Core's CHANGELOG has an entry.

Proof: `pnpm --filter @umriss-ui/core props` passes the gate. Each `invalid` row's `shownIn` begins with its own page's `with-an-error`. lint, typecheck and test:unit are green after the rebase onto main (language switch). Playwright ui-light + ui-dark ran `screenshots.spec.ts` on the 13 pages (page heads and every example): 152 passed. ui-light ran own-data, own-base, silent-pages, features-tree and features-page: 159 passed, 1 skipped.

Baselines: 26 new (13 examples × light/dark), and I looked at each one. 14 were renewed: `combobox--assign-an-incident`, `fileinput--require-a-file-before-sending`, `fileinput--import-budgets`, `input--clear-the-field`, `textarea--grow-with-the-text`, `textarea--count-the-characters` and `treeview--search-check-and-reveal`, light and dark. The new example above each one moved it to another half pixel ("A picture can move because the page grew", docs/testing.md). The diffs show glyph-edge rasterisation only, ±1 px in height. No page head moved.

Deviation, for the spec owner: the JSDoc of every `invalid` says `FormField` sets it itself once it carries an `error`, and by hand it is "only necessary without `FormField`". Inside a `FormField` with an `error`, as the ticket asks, the explicit `invalid` is therefore redundant (the control reads `invalid ?? field.invalid`). The examples keep it because the ticket and the spec ask for it, and the leads do not claim it is required. If the docs should instead show the case where it is needed (a control without `FormField`), that is a follow-up.
