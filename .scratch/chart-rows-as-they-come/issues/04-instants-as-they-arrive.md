# 04 — Instants as they arrive

Status: done
Type: task

Blocked by: 01
Spec: "Solution" (third and fourth bullet), "Implementation Decisions"
D15–D18, D24; user stories 26–32, 45

## What to build

A developer whose rows hold a date as it came - a `Date`, or the ISO 8601
string the API sent - names that field on the x axis. A `Date` puts the axis
in time without `time` being said. With `time`, a string is read as an ISO
8601 instant by the platform's parser; what does not parse is not placed, and
DEV names the series and the row. Without `time` a string stays a category
(ticket 01) - and where every category of an axis reads as an ISO instant
with a time, DEV asks whether `time` was meant.

A place the caller names on a time axis may be a `Date` as well: a fixed
`domain` pair, and the values of `LimitLine` and `LimitBand` along x.

Milliseconds stay accepted and stay the fast path. The view, `setDomain`,
`zoomLimits`, the working calendar and what `tickFormat` is handed stay
milliseconds.

## Acceptance

- [x] Type tests: a `Date` field and a function returning a `Date` are
      accepted by `XAxis value`; a `Date` field as a series' `value` is
      refused; `domain` takes a pair of `Date`s; `LimitLine value` and
      `LimitBand`'s edges take a `Date`.
- [x] Mounted through `useChart`: rows with a `Date` field and no `time` give
      the ticks and the tooltip of a time axis.
- [x] Mounted: rows with ISO strings and `time` give the same picture as the
      same instants in milliseconds; a string that does not parse is not drawn
      and warns in DEV naming the series and the row.
- [x] Mounted: ISO strings with a time and no `time` are categories, and DEV
      asks whether `time` was meant; strings such as `"2026-01"` raise
      nothing.
- [x] Mounted: a `domain` of two `Date`s and a limit at a `Date` stand where
      the same milliseconds stand.
- [x] Materialisation unit tests: instants from `Date` and from strings; a
      number passes through untouched.
- [x] The prop's comment states the platform's rule: a date with a time and
      no offset is local time, a date alone is UTC.
- [x] The view, `setDomain`, `zoomLimits`, a `calendar` and `tickFormat`
      behave as before: their tests pass unchanged.
- [x] The installation page's first chart reads ISO strings; "Plot instants on
      a time axis" reads `Date`s; "Mark moments and windows along time"
      takes a `Date`. The
      long series keep milliseconds. Screenshots are looked at before they are
      accepted: no picture moves.
- [x] The benchmark example's figures stay inside what the capability record
      promises.
- [x] Typecheck, the charts' unit tests, the demo smoke test and the own-data
      check pass.

## Comments

Delivered. The scene learns per x axis whether its rows bring a `Date` first
(`dated`) and treats that axis as one that says `time`. A series on a time
axis whose first place is a number goes as it came - the fast path, one
accessor call to find out; one that brings a `Date` or a string has each read
by `instantOf`. On an axis that says `time` no category is read, so a string
is an instant only there. `domain` and the limits take a `Date` at the
component and hand the scene its milliseconds; nothing the view keeps changed.

DEV: a string that is no instant, with its series and row; categories that
are all ISO instants with a time, asked whether `time` was meant - a month or
a day alone raises nothing.

Tests: `tests-unit/instants.jsdom.test.tsx`, "An instant" in
`tests-unit/materialize.test.ts`, eight lines in
`tests-unit/useChart.test-d.tsx`. The three examples' pictures moved at their
leads only; the plots are the same to the pixel.
