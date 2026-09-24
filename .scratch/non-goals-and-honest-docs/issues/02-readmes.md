# 02 - README truth

Status: done
Type: task

Spec: `.scratch/non-goals-and-honest-docs/spec.md`

## Scope

H2, H3.

## Acceptance

- No figure stands twice; every roadmap line matches its spec.

## Comments

Delivered. H2: the charts README no longer repeats the benchmark (its figures
were a run older than `capabilities.md`'s); it links to the record. It also
listed stacking among what the package "deliberately cannot do" - stacking is
"Later" with a spec of its own, so the sentence now names the real Out items and
ADR-0032. H3: core's roadmap no longer names the danger text tone (done,
0.7.0) or `library-audit` 09 (wontfix); it lists the open core specs by name,
and the two "Not yet met" notes point at `core-passthrough`. The other four
READMEs carry no roadmap; their claims were read against the open specs
(`schedule-a11y`, `table-grid-mode`, `table-server-mode`, `charts-stacking`)
and none claims what those specs still owe. `docs/releasing.md` step 2 is the
checklist item.
