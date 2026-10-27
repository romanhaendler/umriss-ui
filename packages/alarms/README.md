# @umriss-ui/alarms

Alarm management for a control room: what happens to an alarm after the
application has raised it. `alarmModel` turns the application's alarms into a
view - lifecycle, acknowledgement, snoozing, flood and chatter - and
`AlarmList` shows it, worst first. The application generates the alarms and
applies every transition; the package reports what the operator asked for.

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
