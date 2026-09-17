/* Every element a component makes reachable by keyboard shows the focus in a
   style of its own (ADR-0021).

   The base layer once put a ring on every `:focus-visible` of the page, and the
   components leaned on it without anyone noticing: when it went, the close
   buttons of Modal and Toast, the calendar's days and the pickers' presets were
   left with the browser's outline. The browser check (`ownBase.ts`) sees what a
   Tab through an example reaches; a panel that is closed while it tabs stays
   invisible to it. This reads the source instead.

   A focusable element is a native `button`, `a`, `input`, `select` or
   `textarea`, or anything with a `tabIndex` - except a literal
   `tabIndex={-1}`, which takes the element out of the tab order, unless the
   element carries `data-nav`: MultiSelect moves the focus between such elements
   with the arrow keys, and a focus that moves there has to show. Its focus
   style is a rule in the component's own stylesheets that names one of the
   element's classes together with `:focus-visible` or `:focus-within`, a
   sibling ring (`.input:focus-visible + .box`), or `composes: ring`. Whatever
   the reading cannot see - classes taken from a variable, a ring on a wrapper -
   is named with its reason by the guard that calls it. Not a JSX parser: it
   has to be right for the components this workspace writes. */

export interface FocusableElement {
  /** "<file> <tag> .<class> .<class>" - the key an exception is named by. */
  key: string;
  classes: string[];
}

const NATIVE = new Set(["button", "a", "input", "select", "textarea"]);

/** The focusable elements of one component source, with their module classes. */
export function focusableElements(file: string, source: string): FocusableElement[] {
  const found: FocusableElement[] = [];
  for (const match of source.matchAll(/<([a-z][a-z0-9]*)\b((?:[^<>{}]|\{(?:[^{}]|\{[^{}]*\})*\})*?)\/?>/g)) {
    const [, tag, attributes] = match as unknown as [string, string, string];
    const tabIndex = /tabIndex=\{([^}]*)\}/.exec(attributes)?.[1]?.trim();
    const byArrows = /(^|\s)data-nav(\s|=|$)/.test(attributes);
    const reachable = tabIndex === undefined ? NATIVE.has(tag) : tabIndex !== "-1" || byArrows;
    if (!reachable) continue;
    const classes = [...attributes.matchAll(/styles\.([A-Za-z]\w*)/g)].map((m) => m[1]!);
    found.push({ key: `${file} ${tag}${classes.map((c) => ` .${c}`).join("")}`, classes });
  }
  return found;
}

/** Whether the stylesheets give one of the classes a focus style. */
export function hasFocusStyle(classes: readonly string[], stylesheets: string): boolean {
  const css = stylesheets.replace(/\/\*[\s\S]*?\*\//g, "");
  return classes.some((name) => {
    const cls = `\\.${name}(?![\\w-])`;
    return (
      new RegExp(`${cls}[^{},]*:focus-(visible|within)`).test(css) ||
      new RegExp(`${cls}\\s*\\{[^}]*composes:[^;]*\\bring\\b`).test(css)
    );
  });
}
