# 02 - Stored options are read over the type's defaults

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/dashboard-small-wishes/spec.md`

## What to build

A widget type that gains an option in an update meets kept arrangements without it. Today the content gets
the stored options as they are, so the new key is `undefined`, and a widget whose options are missing stays
broken until a reader edits it (`.scratch/shakedown/dashboard.md` 5). From now on the reading of a stored
arrangement fills the gaps from the type.

- **The merge.** The reading against the declared types gives each widget's options as follows:
  - when the type's `defaultOptions` is a plain object, a stored plain object is spread over it, one level
    deep. The stored keys win, and keys only the defaults have are taken from them;
  - stored options that are absent, `null`, an array or a primitive read as the defaults;
  - when `defaultOptions` is no plain object, the stored options stand as they are, and only absent options
    read as the defaults;
  - widgets of a type not declared are not read and keep their options as stored.
- **One reading for everything.** The content, the title, the form, the draft and the hook's `view` see the
  merged options. "Done" reports them when something changed. A reading that only added defaults is no
  change, so "Done" without a change still reports nothing.
- **The doc comment of `defaultOptions`** says that a stored widget's missing keys are read from them, so
  `API.md` says it. The README sentence is ticket 03's.
- **The unit test**, beside the stored-arrangement tests. Kept widgets:
  - one lacking a key the type declares;
  - one without options;
  - one with options that are a string;
  - one of a type not declared.

  It asserts on what each content shows, on the hook's `view`, and on what "Done" reports after one move.
- **Changelog**, under "Changed", with its migration line: an application that merged the defaults into
  stored options itself may drop that code.

## Acceptance criteria

- [ ] The unit test passes, and fails without the merge.
- [ ] "Done" after a move reports the merged options of the widgets that were read, and the stored options
      of the widget whose type is not declared, unchanged.
- [ ] "Edit" then "Done" with no change reports nothing, for a kept arrangement that lacked keys.
- [ ] The existing stored-arrangement and lenient-reading tests pass unchanged.
- [ ] `pnpm check dashboard` and `pnpm check:site` pass, and `API.md` is regenerated.
