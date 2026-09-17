/* `box-sizing: border-box` on the library's own elements, and only there
   (ADR-0021). The page-wide `*, *::before, *::after` rule it replaces reached
   every element of the application; this step gives the box model to every
   selector that names a class of the stylesheet and whose subject is an element
   of its own - `.field input` gets it, `.stack > *` does not, because that is
   the caller's content.

   A selector the stylesheet already gives a `box-sizing` keeps its own. The
   rule is inserted in front of the first rule of each selector, as a rule of
   its own, so no declaration a stylesheet wrote is touched. */

import type { AtRule, Plugin, Rule } from "postcss";
import { namesAClass, subjectIsOwn } from "./selectors.ts";

const inKeyframes = (rule: Rule) => {
  const parent = rule.parent;
  return parent?.type === "atrule" && /keyframes$/i.test((parent as AtRule).name);
};

export function ownBox(): Plugin {
  return {
    postcssPlugin: "umriss-own-box",
    Once(root, { Rule: RuleNode }) {
      const declared = new Set<string>();
      root.walkDecls("box-sizing", (decl) => {
        if (decl.parent?.type === "rule") for (const s of (decl.parent as Rule).selectors) declared.add(s.trim());
      });

      const given = new Set<string>();
      root.walkRules((rule) => {
        if (inKeyframes(rule)) return;
        const own = rule.selectors
          .map((s) => s.trim())
          .filter((s) => namesAClass(s) && subjectIsOwn(s) && !declared.has(s) && !given.has(s));
        if (own.length === 0) return;
        for (const s of own) given.add(s);
        const box = new RuleNode({ selector: own.join(", "), raws: { between: " " } });
        box.append({ prop: "box-sizing", value: "border-box", raws: { before: " ", between: ": " } });
        box.raws.after = " ";
        rule.before(box);
      });
    },
  };
}
ownBox.postcss = true;
