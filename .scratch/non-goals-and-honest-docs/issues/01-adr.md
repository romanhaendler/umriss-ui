# 01 - ADR-0032: what umriss is not

Status: done
Type: task

Spec: `.scratch/non-goals-and-honest-docs/spec.md`

## Scope

H1; ADR index updated.

## Acceptance

- The ADR exists and every capabilities "Out" row points to it.

## Comments

Delivered: `docs/adr/0032-what-umriss-is-not.md` - everywhere (languages and
RTL, rich text and carousel), the table (pivot; range selection, its
clipboard, undo), the charts (pie/donut/radar/candlestick, log and category
scale, WebGL, and the rest of the capability record's "Out" by reference), the
schedule (dependency types, critical path). Each with the domain reason and
what a caller does instead. Indexed in `docs/adr/README.md` (thirty-two), named
in `docs/README.md`'s map. The one capabilities "Out" list,
`packages/charts/docs/capabilities.md`, points to it; core's tree record keeps
its "Deliberately open", which is about tree behaviour and not scope.
Clipboard is named only for ranges: `comparison-roadmap` keeps a row clipboard
among its "later" items, and `table-grid-mode` already points here.
