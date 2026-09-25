/* jsdom polyfills for the browser APIs the components presuppose. */

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

/* Without globals:true the testing library does not install itself; without
   that, the DOM would stand between the tests. */
afterEach(cleanup);

if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

if (typeof window.ResizeObserver !== "function") {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  window.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

/* jsdom does not know `PointerEvent` at all. Without the replacement the
   testing library builds a plain event for `fireEvent.pointerDown`, and
   `button`, `clientX` and `pointerId` are null in it - a pointer gesture could
   then not be reproduced, only triggered.

   It inherits from `MouseEvent`, because button and coordinates are already
   right there; on top of that comes exactly what the pointer gesture reads. */
if (typeof window.PointerEvent !== "function") {
  interface PointerInit extends MouseEventInit {
    pointerId?: number;
    pointerType?: string;
    isPrimary?: boolean;
  }
  class PointerEventStub extends MouseEvent {
    readonly pointerId: number;
    readonly pointerType: string;
    readonly isPrimary: boolean;
    constructor(type: string, init: PointerInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
      this.pointerType = init.pointerType ?? "mouse";
      this.isPrimary = init.isPrimary ?? true;
    }
  }
  window.PointerEvent = PointerEventStub as unknown as typeof PointerEvent;
  (globalThis as { PointerEvent?: typeof PointerEvent }).PointerEvent =
    window.PointerEvent;
}

/* jsdom does not know pointer capture. The table (column width) and the dock
   (grip) both call it so that a drag continues when the pointer leaves the
   element - a promise of the platform that jsdom does not reproduce and that a
   test here could not observe either. The replacement only keeps a record, so
   that `hasPointerCapture` tells the truth during teardown. */
if (typeof Element.prototype.setPointerCapture !== "function") {
  const captured = new WeakMap<Element, Set<number>>();
  Element.prototype.setPointerCapture = function (this: Element, id: number) {
    const ids = captured.get(this) ?? new Set<number>();
    ids.add(id);
    captured.set(this, ids);
  };
  Element.prototype.releasePointerCapture = function (this: Element, id: number) {
    captured.get(this)?.delete(id);
  };
  Element.prototype.hasPointerCapture = function (this: Element, id: number) {
    return captured.get(this)?.has(id) ?? false;
  };
}

/* jsdom knows no canvas 2D context, and the control room's charts and
   schedule draw on one. Their scenes cope with null; the stub only keeps
   jsdom's "not implemented" out of the output, as in charts' own setup. */
HTMLCanvasElement.prototype.getContext = (() => null) as HTMLCanvasElement["getContext"];

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => undefined;
}

/* jsdom knows <dialog>, but not showModal()/close(). The replacement here does
   exactly what a test can observe of it: it mirrors the open attribute and
   reports the closing.

   What it expressly does NOT do: top layer, focus trap, Escape as a
   cancellation, backdrop. Those are promises of the platform, not of the
   library, and a replacement that rebuilt them would in the end be checking
   itself. They are checked in the browser - features-basics.spec.ts for the
   modal, features-shell.spec.ts for the palette. */
if (
  typeof HTMLDialogElement === "function" &&
  typeof HTMLDialogElement.prototype.showModal !== "function"
) {
  const open = function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.show = open;
  HTMLDialogElement.prototype.showModal = open;
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement, value?: string) {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    if (value !== undefined) this.returnValue = value;
    this.dispatchEvent(new Event("close"));
  };
}

/* React 19: enable act() support in test environments explicitly. */
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
