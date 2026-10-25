/* The long press under a finger: the Tooltip's name and the context menu's opening. */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Tooltip } from "../src/components/Tooltip";
import { useContextMenuTrigger } from "../src/lib/useContextMenuTrigger";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const touch = { pointerType: "touch", clientX: 50, clientY: 60 };
const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe("Tooltip under a finger", () => {
  const setup = () => {
    const onClick = vi.fn();
    render(
      <Tooltip content="Hint">
        <button onClick={onClick}>Target</button>
      </Tooltip>,
    );
    return { onClick, target: screen.getByText("Target") };
  };

  it("shows after a 500 ms hold and hides 1.5 s after the lift; the click is swallowed", () => {
    const { onClick, target } = setup();
    fireEvent.pointerEnter(target, touch);
    fireEvent.pointerDown(target, touch);
    wait(499);
    expect(screen.queryByRole("tooltip")).toBeNull();
    wait(1);
    expect(screen.getByRole("tooltip").textContent).toBe("Hint");
    wait(3000);
    expect(screen.getByRole("tooltip")).toBeTruthy();
    fireEvent.pointerUp(target, touch);
    fireEvent.pointerLeave(target, touch);
    fireEvent.click(target);
    expect(onClick).not.toHaveBeenCalled();
    wait(1400);
    expect(screen.getByRole("tooltip")).toBeTruthy();
    wait(200);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("a 200 ms tap acts and shows no tip", () => {
    const { onClick, target } = setup();
    fireEvent.pointerEnter(target, touch);
    fireEvent.pointerDown(target, touch);
    wait(200);
    fireEvent.pointerUp(target, touch);
    fireEvent.click(target);
    wait(2000);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("a move beyond 10 px cancels", () => {
    const { target } = setup();
    fireEvent.pointerDown(target, touch);
    fireEvent.pointerMove(target, { ...touch, clientX: 62 });
    wait(600);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("a mouse press hides the tip as before", () => {
    const { target } = setup();
    fireEvent.pointerEnter(target, { pointerType: "mouse" });
    wait(400);
    expect(screen.getByRole("tooltip")).toBeTruthy();
    fireEvent.pointerDown(target, { pointerType: "mouse" });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});

describe("useContextMenuTrigger", () => {
  function Target({ onClick = vi.fn() }) {
    const [at, setAt] = useState<string>("none");
    const trigger = useContextMenuTrigger((p) => setAt(`${p.x},${p.y}`));
    return (
      <>
        <button {...trigger} onClick={onClick}>Row</button>
        <output>{at}</output>
      </>
    );
  }
  const out = () => screen.getByRole("status").textContent;

  it("opens at the pointer on a right-click", () => {
    render(<Target />);
    fireEvent.pointerDown(screen.getByText("Row"), { pointerType: "mouse", button: 2 });
    fireEvent.contextMenu(screen.getByText("Row"), { clientX: 7, clientY: 9 });
    expect(out()).toBe("7,9");
  });

  it("opens at the target's box on the context-menu key", () => {
    render(<Target />);
    fireEvent.keyDown(screen.getByText("Row"), { key: "ContextMenu" });
    expect(out()).toBe("0,0");
  });

  it("opens at the finger after 500 ms; the contextmenu and click that follow do nothing", () => {
    const onClick = vi.fn();
    render(<Target onClick={onClick} />);
    const row = screen.getByText("Row");
    fireEvent.pointerDown(row, touch);
    wait(500);
    expect(out()).toBe("50,60");
    // Android's contextmenu would open it a second time, at its own point.
    fireEvent.contextMenu(row, { clientX: 1, clientY: 2 });
    fireEvent.pointerUp(row, touch);
    fireEvent.click(row);
    expect(out()).toBe("50,60");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("a short tap reaches the target and opens nothing", () => {
    const onClick = vi.fn();
    render(<Target onClick={onClick} />);
    const row = screen.getByText("Row");
    fireEvent.pointerDown(row, touch);
    wait(200);
    fireEvent.pointerUp(row, touch);
    fireEvent.click(row);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(out()).toBe("none");
  });
});
