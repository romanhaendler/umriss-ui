# 07 — Tests and baselines

Status: done
Type: test
Blocked by: 01, 02, 03, 04, 05

## What

The table's unit and browser suites green; every moved baseline renewed with
`--update-snapshots` after the pictures were looked at, scene by scene. This
ticket is the permission for the table's baselines to move (CONTEXT,
**Baseline**).

## Comments

**Delivered, 2 Oct 2026.** cb76b44 and the core baselines. 317 table pictures and 15 core pictures looked at beside their predecessors, light and dark. Found on the way: a span's value sat above its row (top-aligned for wrapping rows) - fixed before the baselines were taken. Six behaviour tests timed out under eight workers and passed alone.
