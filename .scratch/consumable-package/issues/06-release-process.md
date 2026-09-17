# 06 — Release process, and the client-only decision on record

Status: done

Spec: `.scratch/consumable-package/spec.md`

## Scope

Two things, both documentation-shaped.

**A release process.** The package sits at nought point one point nought, has no
changelog of its own, and has no publishing step. Today that is harmless: there
is one consumer and it lives in the same repository. The moment there is a
second, every upgrade becomes a wager about what changed.

- The package gets its own changelog, describing what changed **for a consumer**
  rather than what changed in the repository. The repository's root changelog
  stays as it is.
- Version numbers become meaningful: minor for additions, patch for fixes, with
  anything that changes existing behaviour called out explicitly whatever the
  number does.
- A publishing step, so consuming the package does not require a path reference
  into someone else's checkout.

**The client-only decision on record.** The library targets client-rendered
applications. The annotations a server-rendering framework would require are
deliberately absent. Write that into the package documentation so a prospective
consumer discovers it by reading rather than by debugging.

## Acceptance

- Package changelog exists and covers the releases to date at whatever
  granularity is honest.
- The versioning rule is written down.
- A publishing step exists and has been run at least once, even if only to a
  local or internal target.
- The client-only target is stated in the package documentation.

## Notes

Nothing is **built** for the client-only half — the deliverable is the written
decision. It closes a question that would otherwise be re-asked by inference
every time someone notices the missing annotations.

Deliver this last of the six, or whenever a second consumer actually appears —
whichever comes first. It is the only ticket here with no effect until that
happens.
