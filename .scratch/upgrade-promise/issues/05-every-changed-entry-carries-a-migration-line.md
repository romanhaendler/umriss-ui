# 05 - Every "Changed" entry carries a migration line

Status: ready-for-agent
Type: task
Size: S

Blocked by: `01-the-adr-the-upgrade-promise.md`
Spec: `.scratch/upgrade-promise/spec.md`

## What to build

Every entry under "Changed" tells a caller what to do, and a release cannot go out with an entry that does
not.

- **The form.** Every top-level entry under `### Changed` carries a nested item that begins `Migration:`. It
  says what a caller changes, or that nothing changes and what to look at:

  ```markdown
  - **A dialog-role `Popover` takes the focus when it opens** - ...
    - Migration: nothing to change; a test that expected the focus on the trigger now finds it in the panel.
  ```

- **The rule** stands in `docs/releasing.md`, step 1, where the changelog is written:
  - the form above;
  - a rename's line names the old name, the new one, and the release that removes the old one;
  - a removal stands under "Changed" with its own line.
- **The check.** `check-dist` reads the package's `CHANGELOG.md` (it is packed) and finds the section of the
  package's own version (`## <version> – …`):
  - if there is none, it fails: "no heading for <version>";
  - every top-level entry under that section's `### Changed` must have a nested `Migration:` item with text
    after it. A missing one fails, quoting the entry's bold lead.

  Earlier sections are not checked; they were written before the rule.
- **`pnpm changelog`** stays a draft printer. It prints commit subjects before the changelog is written, so
  there is nothing for it to check.
- **The current section.** Give the "Changed" entries of the current version (0.41.1, two per package) their
  migration lines, so that the check is green from the start.

## Acceptance criteria

- [ ] `pnpm -r check:dist` passes, with the 0.41.1 "Changed" entries of all six changelogs carrying a
      `Migration:` item.
- [ ] Remove one `Migration:` item and the check fails, quoting that entry. Rename the version's heading and
      it fails with "no heading". Both were tried by hand and reverted.
- [ ] `docs/releasing.md` step 1 states the form and the two rules about renames and removals.
