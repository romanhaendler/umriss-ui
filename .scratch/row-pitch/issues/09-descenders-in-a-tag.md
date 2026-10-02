# 09 — Descenders in a tag

Status: ready-for-agent
Type: fix

Found by the user on 2 Oct 2026, in the table toolbar's chips: "dass in den
Chips in der Toolbar zum Beispiel Buchstaben wie 'g' unten abgeschnitten
werden."

## Why

`Tag` (core) sets `line-height: var(--u-leading-none)` - a line as tall as
the type - and its text clips for the ellipsis (`overflow: hidden`). A
descender reaches below a line of 1, so "Grouped", "Weight" or "kg" lost
their tails wherever the text sat in a tag: the grouping and the conditions
of the table toolbar, and every removable tag.

## What

- `.text` in `Tag.module.css` takes a line of 1.5: 18 px at the tag's 12 px,
  whole, and inside its 22 px.
- A probe over every page of the table and core demos for an element that
  clips and whose content is taller than its box.

## Acceptance

- The probe finds nothing but visually hidden text.
- The tag's height stays 22 px.
