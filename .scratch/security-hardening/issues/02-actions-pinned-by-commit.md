# 02 - Every workflow names its actions by commit

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/security-hardening/spec.md` (Implementation Decisions, "Action pins")

## What to build

Every action in the CI, Visual and Publish workflows is pinned to the full
commit SHA its current release tag points to, with that release as a comment
beside it, so a moved tag cannot change what runs. Dependabot proposes updates
to these pins, and to nothing else.

## Acceptance criteria

- [ ] Every `uses:` in every workflow names a 40-character SHA followed by `# vX.Y.Z`.
- [ ] Each SHA is the commit the named release tag points to, read from the action's own repository (`git ls-remote` or the GitHub API), not from a third party.
- [ ] A Dependabot configuration covers the `github-actions` ecosystem only, monthly, grouped into one pull request; no npm ecosystem entry.
- [ ] The workflows are still valid YAML and their behaviour is unchanged (a diff that touches only `uses:` lines plus the new Dependabot file).
