# Security

## Reporting a vulnerability

Report it privately, through GitHub's private vulnerability reporting for this
repository: <https://github.com/romanhaendler/umriss-ui/security/advisories/new>.
Do not open a public issue or pull request for it.

Say which package and version are affected, what an attacker could do, and the
steps or a small example that show it.

## Which versions get a fix

A fix goes into the latest minor of the current major: the latest `0.x` minor
until `1.0.0`, the latest `1.x` minor from then on. Older minors get no fix, and
`0.x` gets none after `1.0.0` — move to the latest minor. The rule is
[ADR-0083](docs/adr/0083-from-1-0-a-break-costs-a-major.md).

## What to expect

No bounty is offered, and no response or fix deadline is promised. Reports are
read and answered as the maintainer can.
