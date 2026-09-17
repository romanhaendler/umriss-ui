/* Where a floating surface portals to - in one place.

   The rule stood only in the popover until library-audit 01, and the tooltip
   had been forgotten when that was rebuilt: it went on portalling to the body
   and lay behind the dialog inside a modal. Two callers writing the same order
   by hand drift apart eventually; that has already happened here once.

   Internal, like `computePosition`. */

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
