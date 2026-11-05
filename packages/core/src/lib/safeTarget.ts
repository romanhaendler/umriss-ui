import { warnOnce } from "./dev";

/* A link target is resolved against the document first; only these schemes
   pass, so `javascript:`, `vbscript:`, `data:` and the like do nothing.
   Relative and fragment targets resolve to the document's own scheme; with no
   document (a server) they resolve against a placeholder `http:` origin. */
const SAFE_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

/** Whether an address may be followed or written into an `href`. */
export function isSafeTarget(href: string): boolean {
  try {
    return SAFE_PROTOCOLS.includes(new URL(href, typeof document === "undefined" ? "http://localhost/" : document.baseURI).protocol);
  } catch {
    return false;
  }
}

/** The address when it is safe; otherwise `undefined`, with one DEV warning. */
export function safeTarget(href: string | undefined, component: string): string | undefined {
  if (href === undefined || isSafeTarget(href)) return href;
  warnOnce("@umriss-ui/core", `target:${component}`, `${component} refused an href with an unsafe scheme; only http, https, mailto, tel and relative targets pass.`);
  return undefined;
}
