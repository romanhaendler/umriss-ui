/* The one Trusted Types policy of the demo shell, and the one way the shell sets
   HTML. A page served with `require-trusted-types-for 'script'; trusted-types
   umriss-demo` accepts an HTML sink only from this policy; the library itself
   creates none, so any sink in its code is a violation. Where Trusted Types do
   not exist (other browsers, jsdom, the prerender) the helper returns the
   string, which `dangerouslySetInnerHTML` takes as it is. */

/* The DOM typings of this TypeScript do not carry Trusted Types yet. */
const trustedTypes = (
  globalThis as { trustedTypes?: { createPolicy(name: string, rules: { createHTML(html: string): string }): { createHTML(html: string): unknown } } }
).trustedTypes;

const policy = trustedTypes?.createPolicy("umriss-demo", { createHTML: (html) => html }) ?? null;

/** HTML the shell itself made (highlighted source, API tables) as a value an HTML sink accepts. */
export function trustedHtml(html: string): string {
  return (policy ? policy.createHTML(html) : html) as string;
}
