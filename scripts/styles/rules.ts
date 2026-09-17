/* What every stylesheet the library ships must be (ADR-0021): all of it inside
   the library's layers, and no selector that reaches beyond the elements the
   library rendered. Shared by the unit guards of each package and the dist
   check, so that source and build are held to one definition. */

import postcss, { type ChildNode } from "postcss";
import { inKeyframes, namesAClass, namesThePage } from "./selectors.ts";

/** The library's cascade layers, lowest first. */
export const LAYERS = ["umriss.tokens", "umriss.base", "umriss.components"] as const;

/** The order statement every shipped stylesheet begins with. */
export const LAYER_ORDER = `@layer ${LAYERS.join(", ")};`;

/** Whether the first statement of a stylesheet - after comments, written out
    or minified - is the layer order. */
export function beginsWithLayerOrder(css: string): boolean {
  const first = postcss.parse(css).nodes.find((node) => node.type !== "comment");
  if (first?.type !== "atrule" || first.name !== "layer" || first.nodes) return false;
  return first.params.split(",").map((name) => name.trim()).join(", ") === LAYERS.join(", ");
}

/** Each offender as "<selector or at-rule>: <reason>". Empty when the
    stylesheet obeys both rules. */
export function offendersIn(css: string): string[] {
  const root = postcss.parse(css);
  const offenders: string[] = [];

  for (const node of root.nodes as ChildNode[]) {
    if (node.type === "comment") continue;
    if (node.type === "atrule" && node.name === "layer") {
      if (!node.nodes) continue; // the order statement
      if (!(LAYERS as readonly string[]).includes(node.params.trim())) offenders.push(`@layer ${node.params.trim()}: not a layer of the library`);
      continue;
    }
    const label = node.type === "rule" ? node.selector : node.type === "atrule" ? `@${node.name} ${node.params}`.trim() : node.type;
    offenders.push(`${label}: outside a layer`);
  }

  root.walkRules((rule) => {
    if (inKeyframes(rule)) return;
    for (const selector of rule.selectors) {
      if (selector.trim() === ":root") {
        rule.each((child) => {
          if (child.type === "decl" && !child.prop.startsWith("--")) {
            offenders.push(`${selector}: declares ${child.prop}, not only custom properties`);
          }
        });
        continue;
      }
      if (!namesAClass(selector) || namesThePage(selector)) {
        offenders.push(`${selector}: selects beyond the library's own elements`);
      }
    }
  });

  return offenders;
}
