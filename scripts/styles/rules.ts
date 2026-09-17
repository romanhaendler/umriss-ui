/* What every stylesheet the library ships must be (ADR-0021): all of it inside
   the library's layers, and no selector that reaches beyond the elements the
   library rendered. Shared by the unit guards of each package and the dist
   check, so that source and build are held to one definition. */

import postcss, { type AtRule, type ChildNode, type Rule } from "postcss";
import { namesAClass } from "./selectors.ts";

/** The order statement every shipped stylesheet begins with. */
export const LAYER_ORDER = "@layer umriss.tokens, umriss.components;";

const LAYERS = new Set(["umriss.tokens", "umriss.components"]);

const inKeyframes = (rule: Rule) => {
  const parent = rule.parent;
  return parent?.type === "atrule" && /keyframes$/i.test((parent as AtRule).name);
};

/** Each offender as "<selector or at-rule>: <reason>". Empty when the
    stylesheet obeys both rules. */
export function offendersIn(css: string): string[] {
  const root = postcss.parse(css);
  const offenders: string[] = [];

  for (const node of root.nodes as ChildNode[]) {
    if (node.type === "comment") continue;
    if (node.type === "atrule" && node.name === "layer") {
      if (!node.nodes) continue; // the order statement
      if (!LAYERS.has(node.params.trim())) offenders.push(`@layer ${node.params.trim()}: not a layer of the library`);
      continue;
    }
    const label = node.type === "rule" ? node.selector : node.type === "atrule" ? `@${node.name} ${node.params}`.trim() : node.type;
    offenders.push(`${label}: outside a layer`);
  }

  root.walkRules((rule) => {
    if (inKeyframes(rule)) return;
    for (const selector of rule.selectors) {
      if (/:root\b/.test(selector)) {
        rule.each((child) => {
          if (child.type === "decl" && !child.prop.startsWith("--")) {
            offenders.push(`${selector}: declares ${child.prop}, not only custom properties`);
          }
        });
        continue;
      }
      if (!namesAClass(selector)) offenders.push(`${selector}: selects beyond the library's own elements`);
    }
  });

  return offenders;
}
