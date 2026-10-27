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

What it follows of ISA-18.2 and where it departs stands in
[`docs/standards.md`](../../docs/standards.md); no conformance claimed.

Not published yet.

## Install

```bash
pnpm add @umriss-ui/alarms @umriss-ui/core @umriss-ui/table
```

`@umriss-ui/core` and `@umriss-ui/table` are **peer dependencies**, and React 19
or newer as well.

## Documentation

The demo is the documentation; in a checkout, `pnpm dev:alarms` (port 4179)
opens it. Every export is listed in [API.md](API.md).
