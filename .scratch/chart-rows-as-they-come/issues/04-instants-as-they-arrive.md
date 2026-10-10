# 04 — Instants as they arrive

Status: ready-for-agent
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

- [ ] Type tests: a `Date` field and a function returning a `Date` are
      accepted by `XAxis value`; a `Date` field as a series' `value` is
      refused; `domain` takes a pair of `Date`s; `LimitLine value` and
      `LimitBand`'s edges take a `Date`.
- [ ] Mounted through `useChart`: rows with a `Date` field and no `time` give
      the ticks and the tooltip of a time axis.
- [ ] Mounted: rows with ISO strings and `time` give the same picture as the
      same instants in milliseconds; a string that does not parse is not drawn
      and warns in DEV naming the series and the row.
- [ ] Mounted: ISO strings with a time and no `time` are categories, and DEV
      asks whether `time` was meant; strings such as `"2026-01"` raise
      nothing.
- [ ] Mounted: a `domain` of two `Date`s and a limit at a `Date` stand where
      the same milliseconds stand.
- [ ] Materialisation unit tests: instants from `Date` and from strings; a
      number passes through untouched.
- [ ] The prop's comment states the platform's rule: a date with a time and
      no offset is local time, a date alone is UTC.
- [ ] The view, `setDomain`, `zoomLimits`, a `calendar` and `tickFormat`
      behave as before: their tests pass unchanged.
- [ ] The installation page's first chart reads ISO strings; "Plot instants on
      a time axis" reads `Date`s; "Mark moments and windows along time"
      takes a `Date`. The
      long series keep milliseconds. Screenshots are looked at before they are
      accepted: no picture moves.
- [ ] The benchmark example's figures stay inside what the capability record
      promises.
- [ ] Typecheck, the charts' unit tests, the demo smoke test and the own-data
      check pass.

## Comments
