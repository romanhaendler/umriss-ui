# What a chart says without its colours

Status: ready-for-agent
Date:   2026-09-24
Origin: the library comparison of 24 Sep 2026 (notes in `docs/research/library-comparison-2026-09/`); order in `.scratch/comparison-roadmap/spec.md`.

## Problem

Two accessibility basics the charts still lack, both named by the comparison as
must-haves (Highcharts, Recharts 3, MUI X 9 ship them): a **data table** a reader
can open instead of walking, and an **encoding without colour** - verdict colours
alone do not reach a colour-blind reader, and a canvas ignores the Windows
contrast mode (`forced-colors`) entirely. `capabilities.md` lists the table
under "Later" (charts-a11y Q5).

## Decisions

Taken on the user's standing trust ("I trust you fully to work out the topics
we really need"); each can be challenged before its ticket starts.

| # | Question | Decision |
| --- | --- | --- |
| C1 | Where does the table come from? | A `<DataTable />` child that registers like `Legend` (charts depends on nothing, so no core `Table`): a disclosure key "Show data" (wording) beside the legend, and a plain, styled `<table>` of the visible domain - x, then one column per visible series in its format. |
| C2 | Long series | The table shows the visible domain; above 500 rows it shows the downsampled course (first/min/max/last per column, marked as such in its caption) and says how many readings it stands for. Never 600,000 rows in the DOM. |
| C3 | Encoding without colour | `Chart encoding="marks"` assigns each series a dash pattern and a marker shape by its palette slot (the same order as the colours); limit bands draw a hatch; state bands and matrix cells take a pattern per state/bucket. Default off, so no picture moves; on by itself under `forced-colors: active`. |
| C4 | forced-colors on canvas | Under `forced-colors: active` the theme resolves to system colours (`CanvasText`, `Canvas`, `Highlight`, `GrayText`) and C3's marks switch on: the canvas cannot be forced, so the chart forces itself. |
| C5 | Wording | "Show data"/"Hide data", the caption, "downsampled from N readings" in `ChartsWording`, German beside it. |

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | The data table | M |
| 02 | Encoding by marks | M |
| 03 | Forced colours on the canvas | M |
| 04 | Final polish round | S |

## Testing

Pure mapping tests (slot → marks, downsample caption), jsdom for the table,
Playwright with `forcedColors` emulation, axe.

## Out of scope

Sonification; export of the table (the caller has the data); a table in the
schedule (its own spec).
