# Documentation a coding agent can read

Status: done
Date:   2026-09-24
Origin: the library comparison of 24 Sep 2026 (notes in `docs/research/library-comparison-2026-09/`); order in `.scratch/comparison-roadmap/spec.md`.

## Problem

In 2026 MUI, Mantine, Ant Design, Chakra, React Aria, shadcn, Bryntum, DHTMLX,
Syncfusion, Kendo and SVAR ship an `llms.txt`, most an MCP server or agent
skills. umriss has none; a coding agent asked to use it falls back to what it
guesses. The demo already derives its props tables from `src/` and holds every
example's source - the material exists, only the text form is missing.

## Decisions

Taken on the user's standing trust ("I trust you fully to work out the topics
we really need"); each can be challenged before its ticket starts.

| # | Question | Decision |
| --- | --- | --- |
| A1 | What is generated? | Per package: `llms.txt` (an index: what the package is, every page with one line and a link) and `llms-full.txt` (every page as Markdown: the page's lead, the props table, every example's source, the why pages). Generated from the demo's outline, `props.json` and the example sources at `build:pages` time. |
| A2 | Where does it live? | Published beside the demo pages (`/<package>/llms.txt`), and shipped inside each npm package as `docs/llms-full.md`, pinned to that version - MUI's lesson that an agent must read the docs of the version installed. |
| A3 | An MCP server? | Not now. SVAR needed one because its API outgrew llms.txt; umriss's does not. A later spec if the full file passes ~200 kB. |
| A4 | How is it held? | A test that every exported name of every package appears in its `llms-full.txt`, and that every example compiles as it stands there (it is the same source). |

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | The Markdown generator | M |
| 02 | All five packages and the index | S |
| 03 | Published and shipped | S |
| 04 | The completeness guard | S |

## Testing

Unit tests of the generator on a fixture; the completeness guard (A4) over all
five packages.

## Out of scope

An MCP server, agent skills, embeddings/search. Translating the docs.
