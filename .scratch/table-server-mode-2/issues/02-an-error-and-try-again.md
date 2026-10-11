# 02 - An error, and "Try again"

Status: ready-for-agent
Type: task
Size: S

Blocked by: 01
Spec: `.scratch/table-server-mode-2/spec.md`, "A late answer and an error (T1)"

## What to build

`error?: string` in server mode. The message stands in place of the rows,
under the header, in the height of a page, in a `role="alert"`, with a "Try
again" button. Toolbar and pager stay. With `answers` passed the error is shown
only while `answers` is the current request; without it, as soon as it is set.
`error` wins over `loading`. "Try again" calls `onRequest(request)` with the
current request once more, past the dedupe of `requestKey`, which stays as it is.
The table clears nothing.

One new required key in the wording, `tryAgain` (English in core, German in
`wording/de`).

## Acceptance

- [ ] An error with matching `answers` replaces the rows; one for an older
      request does not.
- [ ] "Try again" calls `onRequest` with the current request; a second render
      with the same request still reports nothing (Strict Mode test unchanged).
- [ ] The alert is announced; "Try again" is reached by Tab and the table does not
      move focus to it.
- [ ] Skeleton or stale rows never show under an error.
- [ ] `tryAgain` is in both wordings; the wording completeness guard passes.
- [ ] A visual photograph of the error body in light and dark.
