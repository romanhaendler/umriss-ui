/* Where a floating surface portals to - in one place.

   A tooltip portalling to the body would lie behind the dialog inside a modal.
   Two callers writing the same order by hand drift apart eventually.

   Internal, like `computePosition`. */

import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { flushSync } from "react-dom";

/** A modal dialog of a foreign library (Radix, Headless UI): it is no
    `<dialog>`, so the top layer is not its, but it makes the rest of the page
    inert and a surface outside it is neither visible nor clickable. */
export const FOREIGN_MODAL = '[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]';

/** Where a surface goes: a node of the page, or a shadow root as a whole. */
export type PortalTarget = Element | ShadowRoot;

/** Whether a node is a shadow root, told by its shape and not by `instanceof`,
    which fails for a root of another document (an iframe). */
export const isShadowRoot = (node: Node | null | undefined): node is ShadowRoot =>
  node?.nodeType === 11 && "host" in node;

/**
 * The portal target for a surface at the anchor `anker`, in this order:
 *
 * 1. the nearest `<dialog>` or foreign modal dialog (`FOREIGN_MODAL`) around
 *    the anchor - only there does the surface lie above the dialog instead of
 *    behind it, or inert;
 * 2. the provider's configured portal target (`usePortalTarget()`), when it
 *    stands in the anchor's own document or shadow root;
 * 3. the shadow root the anchor stands in, else the body of the anchor's own
 *    document (an iframe's, not the top page's).
 *
 * The dialog beats the setting: a panel portalling out of a modal into a
 * container at the body is invisible.
 *
 * It reads the DOM, so it belongs in an effect and not in rendering.
 */
export function portalTargetFor(
  anker: Element | null | undefined,
  eingestellt: () => HTMLElement | null,
): PortalTarget {
  const modal = anker?.closest(`dialog, ${FOREIGN_MODAL}`);
  if (modal) return modal;
  const root = anker?.getRootNode();
  const configured = eingestellt();
  if (configured && (!anker || configured.getRootNode() === root)) return configured;
  return isShadowRoot(root) ? root : (anker?.ownerDocument ?? document).body;
}

/**
 * Where the fixed box of a surface in `target` starts, in viewport pixels.
 * A fixed box is laid out against the viewport unless an ancestor has a
 * `transform`, `filter` or `contain` - a centred foreign dialog does - and
 * then against that ancestor. The difference is read from a probe at 0,0.
 * Nothing is read for the body, a shadow root or a top-layer popover, whose
 * origin is the viewport.
 */
export function fixedOrigin(target: PortalTarget | null): { x: number; y: number } {
  if (!target || isShadowRoot(target) || target === target.ownerDocument.body) return { x: 0, y: 0 };
  const probe = target.ownerDocument.createElement("span");
  probe.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none";
  target.append(probe);
  const rect = probe.getBoundingClientRect();
  probe.remove();
  return { x: rect.left, y: rect.top };
}

/**
 * The portal target for the toast region, in this order:
 *
 * 1. the topmost modal dialog (`useTopmostModalDialog`) - a toast outside it
 *    lies behind it and is inert;
 * 2. the provider's configured portal target;
 * 3. the body.
 *
 * It reads the DOM, so it belongs in an effect and not in rendering.
 */
export function toastTargetFor(
  dialog: HTMLDialogElement | null,
  configured: () => HTMLElement | null,
): Element {
  return dialog ?? configured() ?? document.body;
}

/** Whether a node is a `<dialog>`, told by its name and not by `instanceof`, so
    that no render path needs the global `HTMLDialogElement`: a server has none. */
export const isDialog = (node: Node | null | undefined): node is HTMLDialogElement => node?.nodeName === "DIALOG";

/* Where `:modal` is not understood (jsdom, old browsers) "has `open`" stands
   in for it. The one use of the selector: the unit test environment throws on
   it. */
function isModal(dialog: HTMLDialogElement): boolean {
  try {
    return dialog.matches(":modal");
  } catch {
    return dialog.open;
  }
}

/**
 * Whether a surface portalled to `target` stands in the top layer: inside a
 * dialog, where the dialog's own `transform`, `overflow` and `filter` would
 * otherwise cut or move a fixed box, and only where the Popover API exists.
 * Elsewhere `z-index` orders the surface.
 *
 * The value for the surface's `popover` attribute, or `undefined`. The surface
 * is shown by `useShownInTopLayer`.
 */
export function topLayerPopover(target: PortalTarget | null): "manual" | undefined {
  /* Nothing is read from the DOM for no target: on a server there is none. */
  return isDialog(target) && "showPopover" in HTMLElement.prototype
    ? "manual"
    : undefined;
}

/**
 * Shows the surface `ref` when it carries `popover` (`topLayerPopover`), in a
 * layout effect so that nothing is painted between the attribute and the
 * showing. It runs after every commit, since a surface that comes and goes
 * (a tooltip) is a new element each time; it must stand before the effects
 * that measure the surface. A surface shown already is left alone: StrictMode
 * runs the effect twice, and `showPopover` throws on an open popover.
 */
export function useShownInTopLayer(ref: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const surface = ref.current;
    /* A surface whose dialog left the document is no longer anywhere to show:
       `showPopover` throws on it. */
    if (!surface?.isConnected || surface.getAttribute("popover") !== "manual") return;
    let open = false;
    try {
      open = surface.matches(":popover-open");
    } catch {
      /* A browser that has `showPopover` has the selector; a stand-in may not. */
    }
    if (!open) surface.showPopover();
  });
}

/**
 * The modal dialog opened last, or `null`. The top layer's order cannot be
 * read from the DOM and document order is wrong for nested dialogs, so the
 * order of opening is kept in a list.
 *
 * It watches changes of `open` for as long as the caller is mounted. A dialog
 * that leaves the document while open sends no such record, so removed nodes
 * are watched too - but only while a dialog is the answer, not on every DOM
 * change of the page.
 */
export function useTopmostModalDialog(): HTMLDialogElement | null {
  const [topmost, setTopmost] = useState<HTMLDialogElement | null>(null);

  useEffect(() => {
    let order = [...document.querySelectorAll("dialog")].filter(isModal);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        const node = record.target;
        if (isDialog(node) && isModal(node) && !order.includes(node)) order.push(node);
      }
      /* A closed dialog is not drawn, and what stands inside it goes with it:
         the move has to land before the next frame, not in a task of its own. */
      update(true);
    });
    const watch = (hosted: boolean) =>
      observer.observe(document, { subtree: true, attributes: true, attributeFilter: ["open"], childList: hosted });
    /* Only a change is passed on: while a dialog is the answer this runs on
       every DOM change of the page. */
    let current: HTMLDialogElement | null = null;
    function update(sync = false) {
      order = order.filter((dialog) => dialog.isConnected && isModal(dialog));
      const next = order.at(-1) ?? null;
      if (next === current) return;
      current = next;
      watch(next !== null);
      if (sync) flushSync(() => setTopmost(next));
      else setTopmost(next);
    }
    watch(false);
    update();
    return () => observer.disconnect();
  }, []);

  return topmost;
}
