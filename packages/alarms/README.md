# @umriss-ui/alarms

Alarm management for a control room: what happens to an alarm after the
application has raised it. `alarmModel` turns the application's alarms into a
view - lifecycle, acknowledgement, snoozing, flood and chatter - and
`AlarmList` shows it, worst first. The application generates the alarms and
applies every transition; the package reports what the operator asked for.

`AlarmBanner` shows the worst unacknowledged alarm on every screen, from an
unfiltered `alarmModel` view; keep it on screen with one line of the host's CSS,
`position: sticky; top: 0`. Its `onAnnunciate` is the cue for the application's
horn.

## Install

```bash
pnpm add @umriss-ui/alarms @umriss-ui/core @umriss-ui/table
```

`@umriss-ui/core` and `@umriss-ui/table` are **peer dependencies**, and React 19
or newer as well; TypeScript 5.4 or newer.

The package ships ES2022 syntax; an application that serves older browsers
transpiles it itself.

The entry begins with `"use client"`, the directive a framework with Server
Components reads to treat a module as client code. The list and the banner
are used from a Client Component file; both render to a string on the server and
in a test.

Under a finger Acknowledge, Shelve and Unshelve are 26 px;
`@umriss-ui/core/touch-scale.css` makes them 44 px, in any import order (core's
README, **Touch**).

## The boundary

The application generates its alarms, applies every transition and keeps the
result; the package derives a view from them and reports what the operator asked
for. It raises no alarm, sounds no horn - `onAnnunciate` is the cue - and keeps no
record. What it follows of ISA-18.2 and where it departs is in
[`docs/standards.md`](https://github.com/romanhaendler/umriss-ui/blob/main/docs/standards.md#isa-182---alarm-management).

## Documentation

The demo is the documentation; in a checkout, `pnpm dev:alarms` (port 4179)
opens it. Every export is listed in [API.md](https://github.com/romanhaendler/umriss-ui/blob/main/packages/alarms/API.md).
