/* The fold of `#own-styles` (control-sizes 06), on its own so that a package's
   tests reach it without the build plugin around it. */

import postcss, { type AtRule, type Container, type Rule } from "postcss";

/* A composing module carries a compiled copy of `own.module.css`, so a build
   holds it once per module: 78 times in core's stylesheet, half of its bytes
   (ADR-0021 wants one copy per package). The build folds the copies into one.
   Why that moves no picture:

   - The copies are the same text. A module's class names hash the file they
     come from and the line they stand on, so `.field` of every copy reads
     `_field_1krlf_91`, and a component's own `.field` reads otherwise. A rule
     that stands twice, in the same layer and the same `@media`, with such a
     name is one source rule included twice - and its class goes on every
     element that composes it, whichever module's copy it was.
   - Across layers order does not count: `umriss.base` (text, ink, extent,
     scroll) loses to every rule of `umriss.components` wherever it stands, and
     the repeated layer-order statements declare nothing the first one has not.
     Only inside `umriss.components` does position count, between rules of the
     same specificity: the ring (`.ring:focus-visible`) and the touch size
     (`.field.field`) against a component's `.sm .input` or `.item:focus-visible`.
   - There the rule of an element stands where its LAST copy stands - a later
     copy overrides the same-specificity rule a component wrote before it, and
     that copy is as good for the element as the one of its own module. So the
     last copy is the one kept, and each own rule keeps the position that
     decided it. Keeping the first would let `.sm .input` (NumberInput) beat
     the 16px touch size of a field, which today it does not.

   Only a build folds: a dev server hands out each module's CSS on its own and
   there is no stylesheet to fold. */
const ownRule = /\._(?:text|dense|ink|extent|field|fieldRoot|scroll|ring)_\w+_\d+/;

function contextOf(node: Rule): string {
  const path: string[] = [];
  for (let up: Container["parent"] | Rule["parent"] = node.parent; up && up.type !== "root"; up = up.parent) {
    const at = up as AtRule;
    path.push(`@${at.name} ${at.params}`);
  }
  return path.join("|");
}

export function foldOwnCopies(css: string): string {
  const root = postcss.parse(css, { from: undefined });
  const rules: Rule[] = [];
  const order = new Set<string>();
  root.walk((node) => {
    if (node.type === "rule" && ownRule.test(node.selector)) rules.push(node);
    else if (node.type === "atrule" && node.name === "layer" && !node.nodes && node.parent?.type === "root") {
      if (order.has(node.params)) node.remove();
      else order.add(node.params);
    }
  });
  const kept = new Set<string>();
  for (const rule of rules.reverse()) {
    const key = `${contextOf(rule)}|${rule.toString()}`;
    if (kept.has(key)) rule.remove();
    else kept.add(key);
  }
  /* A block the folding emptied goes with its rules. */
  root.walkAtRules((at) => {
    if (at.nodes?.length === 0) at.remove();
  });
  return root.toString();
}
