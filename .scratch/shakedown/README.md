# Shakedown 2026-10-24: where to start

The first shakedown (procedure: `docs/agents/shakedown/`) put the six packed packages into 30 host apps and
the hands of 19 personas. Every file here is `Status: needs-triage`; ✓ in a file marks a finding the
coordinating session confirmed in the source. The hosts themselves were throwaway (session scratch).

## Order of work

2. **The confirmed defects with small fixes**, each from its red as the first test:
   - Modal/Drawer closes on a click inside a Popover, Menu or DatePicker (`core.md` A2)
   - `ToastProvider` throws under SSR (`core.md` A4)
   - d.ts under `exactOptionalPropertyTypes` (`core.md` A5) and the unexported types (B11, `design-system.md` 1)
   - a dialog-role Popover never moves focus in - ColumnMenu and column filters 49–80 Tabs away
     (`audit-family.md` 1, `accessibility.md` P10 2 and P11 1)
   - shadow DOM: a click inside a Popover closes it (`core.md` B3)
   - Breadcrumb's overflow menu runs `javascript:` hrefs (`security.md` 1)
   - CSV formula injection (`table.md` 1)
   - calculation rounding on the binary value, 1.005 → 1.00 (`calculation.md` 1); a tiny given shown as 0
     (`data-science.md` 1)
   - dashboard: a malformed stored view crashes; Done deletes unknown widgets; no per-widget Suspense
     (`dashboard.md` 1–3)
   - DEV warnings dead in Vite; `--column` shared by dashboard and calculation; `tHead?.rows[0]` under
     happy-dom; `import.meta` breaks Jest (`cross-package.md` 8, 9, 15, 16)
   - freshness wrong after a clock jump (`kiosk.md` 1); tooltip limits rounded by the axis format
     (`operator-screens.md` 1)
3. **Consumability decisions:** Jest and Vitest out of the box (an `exports` `default` condition, the CSS
   import), server components (`cross-package.md` 2–5), the root-prop contract across packages
   (`audit-family.md` 5, `qa.md` 2), touch sizes (`mobile-touch.md` 1), handing pickers to native controls on
   touch (`mobile-native.md`).
4. **Wishes and the "never" list:** `wishes.md` - three "never" decisions failed their own Instead in practice
   (chart export, pivot with unknown columns, a scroll box in a dashboard widget).
5. **Alarm management:** `.scratch/alarm-management/requirements.md` - eight decisions for the maintainer.

## The files

Per package: `core.md`, `charts.md`, `table.md`, `table-export.md`, `schedule.md`, `calculation.md`,
`dashboard.md`. Across packages: `cross-package.md`, `design-family.md`, `accessibility.md`, `mobile-touch.md`,
`mobile-native.md`, `zoom.md`, `security.md`, `qa.md`, `upgrade.md`, `agent-docs.md`. By persona:
`core-screens.md`, `composed-app.md`, `audit-family.md`, `design-system.md`, `operator-screens.md`,
`data-science.md`, `reports-bi.md`, `kiosk.md`. All wishes: `wishes.md`.
