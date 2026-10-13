/* Where a floating surface portals to - in one place.

   A tooltip portalling to the body would lie behind the dialog inside a modal.
   Two callers writing the same order by hand drift apart eventually.

   Internal, like `computePosition`. */

import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { flushSync } from "react-dom";

/**
 * The portal target for a surface at the anchor `anker`, in this order:
 *
 * 1. the nearest `<dialog>` ancestor of the anchor - only there does the
 *    surface reach the top layer and lie above the dialog instead of behind it;
 * 2. the provider's configured portal target (`usePortalTarget()`);
 * 3. the body.
 *
 * The dialog beats the setting: a panel portalling out of a modal into a
 * container at the body is invisible.
 *
 * It reads the DOM, so it belongs in an effect and not in rendering.
 */
export function portalTargetFor(
  anker: Element | null | undefined,
  eingestellt: () => HTMLElement | null,
): Element {
  return anker?.closest("dialog") ?? eingestellt() ?? document.body;
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

/* Where `:modal` is not understood (jsdom, old browsers) "has `open`" stands
   in for it. Every use of the selector goes through here: the unit test
   environment throws on it. */
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
export function topLayerPopover(target: Element | null): "manual" | undefined {
  return target instanceof HTMLDialogElement && "showPopover" in HTMLElement.prototype ? "manual" : undefined;
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
    if (!surface || surface.getAttribute("popover") !== "manual") return;
    let open = false;
    try {
      open = surface.matches(":popover-open");
    } catch {
      /* A browser that has `showPopover` has the selector; a stand-in may not. */
    }
    if (!open) surface.showPopover();
  });
}

function modalDialogs(): HTMLDialogElement[] {
  let found: NodeListOf<HTMLDialogElement>;
  try {
    found = document.querySelectorAll("dialog:modal");
  } catch {
    found = document.querySelectorAll("dialog[open]");
  }
  return [...found];
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
    let order = modalDialogs();
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        const node = record.target;
        if (node instanceof HTMLDialogElement && isModal(node) && !order.includes(node)) order.push(node);
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
