/* Server mode in a filled frame: the request carries the fitted page. jsdom
   lays nothing out - the layout mock of fittedPage.test.tsx: rows of 20 px, a
   head of one row, a scroll area `area` tall - and a ResizeObserver the test
   fires by hand. */

import { useState } from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Pagination, useTable } from "../src";
import type { TableRequest } from "../src";

interface Row {
  id: string;
}

const rowsOf = (from: number, n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: `r${from + i}` }));

let area = 260;
let fire: (() => void)[] = [];
let asked: TableRequest[] = [];

function layout() {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const shorter = this.style.height.startsWith("calc(100% - ");
    const row = this.tagName === "TR" || this.tagName === "THEAD" || this.tagName === "TFOOT";
    const height = row ? 20 : shorter ? 93 : 100;
    return { height, top: 0, left: 0, bottom: height, right: 0, width: 0, x: 0, y: 0, toJSON: () => ({}) };
  });
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.querySelector(":scope > table") ? area : 0;
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        fire.push(callback);
      }
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
}

function Server() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useTable(rows, {
    rowKey: (r) => r.id,
    pageSize: 5,
    server: true,
    rowCount: 100,
    onRequest: (request) => {
      asked.push(request);
      setLoading(true);
      setTimeout(() => {
        setRows(rowsOf((request.page - 1) * request.pageSize, request.pageSize));
        setLoading(false);
      }, 100);
    },
  });
  return (
    <t.Table aria-label="Rows" loading={loading}>
      <t.Column value="id" label="Id" rowHeader />
      <Pagination />
    </t.Table>
  );
}

const resize = (to: number) => {
  area = to;
  act(() => fire.forEach((callback) => callback()));
};
const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
const rowsShown = () => document.querySelectorAll("tbody > tr:not([data-filler]):not([aria-hidden])").length;
const slots = () => document.querySelectorAll("tbody > tr:not([data-filler])").length;

beforeEach(() => {
  vi.useFakeTimers();
  area = 20 + 12 * 20;
  fire = [];
  asked = [];
  layout();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Server mode in a filled frame", () => {
  it("asks once, with the measured page size and never with an unmeasured one", () => {
    render(<Server />);
    advance(1000);
    expect(asked).toHaveLength(1);
    expect(asked[0]).toMatchObject({ page: 1, pageSize: 12 });
  });

  it("sends one request after a run of resizes, once the size has held 300 ms", () => {
    render(<Server />);
    advance(500);
    asked.length = 0;
    for (const height of [200, 220, 240, 280, 300, 320]) {
      resize(height);
      advance(100);
    }
    expect(asked).toHaveLength(0);
    advance(300);
    expect(asked).toHaveLength(1);
    expect(asked[0]).toMatchObject({ pageSize: 15 });
  });

  it("keeps the rows and shows placeholders for the new slots meanwhile; surplus rows leave", () => {
    render(<Server />);
    advance(500);
    expect(rowsShown()).toBe(12);
    resize(20 + 15 * 20);
    advance(300);
    expect(rowsShown()).toBe(12);
    expect(slots()).toBe(15);
    advance(100);
    expect(rowsShown()).toBe(15);
    resize(20 + 8 * 20);
    advance(300);
    expect(slots()).toBe(8);
    expect(rowsShown()).toBe(8);
  });

  it("keeps the anchor row's page from the page and its offset", () => {
    render(<Server />);
    advance(500);
    act(() => screen.getByRole("button", { name: /next/i }).click());
    advance(500);
    expect(asked.at(-1)).toMatchObject({ page: 2, pageSize: 12 });
    resize(20 + 6 * 20);
    advance(300);
    expect(asked.at(-1)).toMatchObject({ page: 3, pageSize: 6 });
  });
});
