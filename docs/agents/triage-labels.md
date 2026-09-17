# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |
| —                          | `done`               | Delivered; kept for the record           |

`done` is a local addition with no counterpart in the skill vocabulary. The five
canonical roles all describe work that has yet to happen, so none of them fits a
spec whose implementation has shipped — and leaving such a spec on
`ready-for-agent` is how an agent ends up re-implementing something that already
exists. A spec marked `done` carries its delivery report under `## Comments`. Specs are kept rather than deleted: they are the written record
of why the code looks the way it does.

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

Because this repo uses a local-markdown tracker, a "label" is the value of the `Status:` line near the top of an issue file — not a tracker-side label object. See `issue-tracker.md`.

Edit the right-hand column to match whatever vocabulary you actually use.
