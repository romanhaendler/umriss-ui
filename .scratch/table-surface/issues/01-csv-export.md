# 01 — Export the filtered set

Status: done

Spec: `.scratch/table-surface/spec.md`

## Scope

A pure function that turns the filtered set and the visible column descriptors
into delimiter-separated text.

- Semicolon as the field separator, comma as the decimal separator.
- Values containing a separator, a quotation mark or a line break are quoted and
  escaped.
- A byte-order mark, so a German spreadsheet opens the file as the right
  encoding without an import dialogue.
- Column labels form the header row — which is why the column descriptor gains a
  human-readable label in this ticket.

The function **returns text**. Handing it to the user as a file is the
application's decision, because that is where the browser, the filename and the
timing belong.

## Acceptance

- Unit tests, and they carry most of the value here: values containing the
  separator, values containing quotation marks, values containing line breaks,
  empty values, numbers in German notation, and the header row taken from the
  labels.
- One test asserts that it exports the **filtered set and not the visible page**.
  That assertion is the whole reason the function takes the filtered set as its
  argument.
- Demo: an export action on the table tile that shows the produced text.

## Notes

Do this first. It is the item most likely to be wrong in a way nobody notices
until a file reaches a spreadsheet, and it is entirely pure, so the tests are
cheap and complete.

Fixture data belongs in the test, not the demo's rows — the coupling to demo
content is already known to break the suite.
