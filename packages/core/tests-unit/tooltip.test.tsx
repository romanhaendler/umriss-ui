/* Tooltip (popover-seam). It takes only the geometry of the primitive; the
   portal, the entrance and the disappearing on scroll remain its own. So far
   it was touched by no test - the change of the position calculation would
   otherwise have remained unevidenced. */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Tooltip } from "../src/components/Tooltip";
import { UmrissProvider } from "../src/lib/provider";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const show = () => act(() => vi.advanceTimersByTime(400));

describe("Tooltip", () => {
  it("appears only after the delay", () => {
    render(
      <Tooltip content="Hint">
        <button>Target</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByText("Target"));
    expect(screen.queryByRole("tooltip")).toBeNull();
    show();
    expect(screen.getByRole("tooltip").textContent).toBe("Hint");
  });

  it("disappears again when the pointer leaves", () => {
    render(
      <Tooltip content="Hint">
        <button>Target</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByText("Target"));
    show();
    fireEvent.pointerLeave(screen.getByText("Target"));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("appears on keyboard focus too and links itself with the target", () => {
    render(
      <Tooltip content="Hint">
        <button>Target</button>
      </Tooltip>,
    );
    const target = screen.getByText("Target");
    fireEvent.focus(target);
    show();
    const tooltip = screen.getByRole("tooltip");
    expect(target.getAttribute("aria-describedby")).toBe(tooltip.id);
  });

  it("closes on Escape", () => {
    render(
      <Tooltip content="Hint">
        <button>Target</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByText("Target"));
    show();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  /* library-audit 01: the tooltip always portalled to the body and thereby lay
     behind the dialog inside a modal. It now takes the same rule as the
     popover - out of the same function. */
  describe("portal target", () => {
    it("portals into the nearest dialog ancestor of the trigger", () => {
      render(
        <dialog open data-testid="dialog">
          <Tooltip content="Hint">
            <button>Target</button>
          </Tooltip>
        </dialog>,
      );
      fireEvent.pointerEnter(screen.getByText("Target"));
      show();
      expect(screen.getByRole("tooltip").parentElement).toBe(screen.getByTestId("dialog"));
    });

    it("takes the configured portal target without a dialog", () => {
      const target = document.createElement("div");
      document.body.appendChild(target);
      render(
        <UmrissProvider portalTarget={target}>
          <Tooltip content="Hint">
            <button>Target</button>
          </Tooltip>
        </UmrissProvider>,
      );
      fireEvent.pointerEnter(screen.getByText("Target"));
      show();
      expect(screen.getByRole("tooltip").parentElement).toBe(target);
      target.remove();
    });

    it("lets the dialog beat the configured portal target", () => {
      const target = document.createElement("div");
      document.body.appendChild(target);
      render(
        <UmrissProvider portalTarget={target}>
          <dialog open data-testid="dialog">
            <Tooltip content="Hint">
              <button>Target</button>
            </Tooltip>
          </dialog>
        </UmrissProvider>,
      );
      fireEvent.pointerEnter(screen.getByText("Target"));
      show();
      expect(screen.getByRole("tooltip").parentElement).toBe(screen.getByTestId("dialog"));
      target.remove();
    });

    it("lands at the body without either", () => {
      render(
        <Tooltip content="Hint">
          <button>Target</button>
        </Tooltip>,
      );
      fireEvent.pointerEnter(screen.getByText("Target"));
      show();
      expect(screen.getByRole("tooltip").parentElement).toBe(document.body);
    });
  });

  /* Its own policy, deliberately different from the panels': those travel
     along on scroll, the tooltip disappears. */
  it("disappears on scrolling instead of travelling along", () => {
    render(
      <Tooltip content="Hint">
        <button>Target</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByText("Target"));
    show();
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
