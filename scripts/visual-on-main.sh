#!/usr/bin/env bash
# Was it me? Runs the visual tests matching a pattern against `main`, exported
# into a temporary directory. Usage: scripts/visual-on-main.sh '<grep pattern>'
set -euo pipefail

[ $# -eq 1 ] || { echo "usage: $0 '<grep pattern>'" >&2; exit 2; }
pattern=$1

base=${UMRISS_PORT_BASE:-4173}
for offset in 0 1 2 3 4 5 6; do
  port=$((base + offset))
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "port $port is in use (another run?); refusing to start" >&2
    exit 1
  fi
done

root=$(git rev-parse --show-toplevel)
dir=$(mktemp -d)
trap 'rm -rf "$dir"' EXIT

git -C "$root" archive main | tar -x -C "$dir"
cd "$dir"
pnpm install --offline --frozen-lockfile
status=0
pnpm exec playwright test -g "$pattern" || status=$?
echo "visual-on-main: exit $status for '$pattern' on main"
exit $status
