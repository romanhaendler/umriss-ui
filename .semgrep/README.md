The rule sets `p/javascript` (its rule ids equal `p/typescript`'s, so one file serves both), `p/react`, `p/xss`, `p/secrets` and `p/github-actions`
of the Semgrep registry, vendored as YAML (`javascript.yaml`, ...) because the
registry does not pin them: a run changes only with a commit. Fetched 2026-10-28 with Semgrep 1.181.1.
Refresh: `curl -sL -o <pack>.yaml https://semgrep.dev/c/p/<pack>` for each pack (the workflow pack's file is `github-actions.yaml`), then `pnpm semgrep` and read the new findings.
The scan itself is `scripts/semgrep.sh`; its image digest is bumped with the Semgrep version.
