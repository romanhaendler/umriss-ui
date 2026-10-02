# 02 — The select opens it

Status: ready-for-agent
Type: feature

## What

Under a mouse or pen (`pointerType`) the select's press opens the list instead of the system's; the keys of ADR-0043 open it too. Options and optgroups come from the select; choosing sets its value and fires `input` and `change`. Touch, `multiple` and a disabled select stay native. The field holds its width (ADR-0041).
