/* `box-sizing: border-box` on the library's own elements, and only there
   (ADR-0021). The page-wide `*, *::before, *::after` rule it replaces reached
   every element of the application; this step reaches the elements that carry
   a class of the stylesheet - and nothing a caller placed inside them.

   Every class the stylesheet names gets a rule of its own, `.value { box-sizing:
   border-box }`, however it is used: `.verdict[data-verdict] .value` is the only
   rule some classes have, and the element carries its class in every state. A
   subject named by type or attribute (`.field input`) gets its full selector,
   because a bare `input` would be the page's. A subject that is `*` or a bare
   pseudo-class is the caller's content and gets nothing.

   The class rules stand at the head of the layer the class first appears in,
   before every rule of the stylesheet, so whatever a stylesheet declares itself
   wins; a class the stylesheet gives a `box-sizing` of its own is skipped. */

import type { AtRule, Container, Declaration, Plugin, Rule } from "postcss";
import { classesOf, namesAClass, subject, subjectIsOwn } from "./selectors.ts";

const inKeyframes = (rule: Rule) => {
  const parent = rule.parent;
  return parent?.type === "atrule" && /keyframes$/i.test((parent as AtRule).name);
};

/** The layer block a rule stands in, or the stylesheet itself. */
function headOf(rule: Rule): Container {
  for (let node = rule.parent; node; node = node.parent) {
    if (node.type === "atrule" && (node as AtRule).name === "layer") return node as AtRule;
    if (node.type === "root") return node as Container;
  }
  return rule.root();
}

export function ownBox(): Plugin {
  return {
    postcssPlugin: "umriss-own-box",
    Once(root, { Rule: RuleNode }) {
      const declared = new Set<string>();
      root.walkDecls("box-sizing", (decl) => {
        if (decl.parent?.type !== "rule") return;
        for (const s of (decl.parent as Rule).selectors) {
          declared.add(s.trim());
          if (/^\.[\w-]+$/.test(s.trim())) declared.add(s.trim());
        }
      });

      const given = new Set<string>();
      const lastAt = new Map<Container, Rule>();
      const box = (selector: string) => {
        const rule = new RuleNode({ selector, raws: { between: " ", after: " " } });
        rule.append({ prop: "box-sizing", value: "border-box", raws: { before: " ", between: ": " } });
        return rule;
      };

      root.walkRules((rule) => {
        if (inKeyframes(rule) || given.has(rule.selector)) return;
        const head = headOf(rule);
        for (const raw of rule.selectors) {
          const selector = raw.trim();
          if (!namesAClass(selector)) continue;
          for (const name of classesOf(selector)) {
            if (declared.has(name) || given.has(name)) continue;
            given.add(name);
            const node = box(name);
            const last = lastAt.get(head);
            if (last) last.after(node);
            else head.prepend(node);
            lastAt.set(head, node);
          }
          const own = subject(selector);
          if (subjectIsOwn(selector) && !own.startsWith(".") && !declared.has(selector) && !given.has(selector)) {
            given.add(selector);
            rule.before(box(selector));
          }
        }
      });
    },
  };
}
ownBox.postcss = true;
/* Squircle corners on the library's own elements (ADR-0021). The base layer
   set `corner-shape: squircle` on `*` inside `@supports`, which reached every
   rounded element of the application. This step gives it to every own rule that
   sets a radius, right after the radius; a browser without `corner-shape`
   ignores the declaration and keeps round corners, as before. */
export function ownCorners(): Plugin {
  return {
    postcssPlugin: "umriss-own-corners",
    Once(root) {
      root.walkRules((rule) => {
        if (inKeyframes(rule)) return;
        if (!rule.selectors.every((s) => namesAClass(s) && subjectIsOwn(s))) return;
        let hasShape = false;
        let lastRadius: Declaration | undefined;
        rule.each((node) => {
          if (node.type !== "decl") return;
          if (node.prop === "corner-shape") hasShape = true;
          if (/^border(-[a-z]+)*-radius$/.test(node.prop)) lastRadius = node;
        });
        if (!hasShape && lastRadius) lastRadius.after({ prop: "corner-shape", value: "squircle", raws: { before: " ", between: ": " } });
      });
    },
  };
}
ownCorners.postcss = true;
