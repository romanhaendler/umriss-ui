#!/bin/sh
# Semgrep over the seven packages' sources and the workflows, in the pinned
# official image, with the vendored rule sets in .semgrep/ (see its README).
# Offline from the Semgrep app: no login, no metrics, no upload. Any finding
# (--error) fails the run; an accepted one carries `nosemgrep: <rule-id>` and a
# reason at its line.
set -eu
cd "$(dirname "$0")/.."
exec docker run --rm -v "$PWD:/src" -w /src \
  semgrep/semgrep@sha256:3db5c7af55eb1f512eac0abf0ab69a97b52c74b5e9a27314c221aee1a78d7ab2 \
  semgrep scan --metrics=off --disable-version-check --error \
  --config .semgrep \
  packages/core/src packages/charts/src packages/table/src packages/schedule/src \
  packages/calculation/src packages/dashboard/src packages/alarms/src .github/workflows
