/* An instant is written once the page has hydrated: the server's markup of a
   picker with a value holds no date or time, hydrating it raises no
   recoverable error, and the value's text shows afterwards. */

import { act } from "react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { DatePicker, DateRangePicker, DateTimePicker, DateTimeRangePicker } from "../src";

const from = new Date(2026, 2, 17, 9, 5);
const to = new Date(2026, 2, 19, 18, 30);
const noop = () => {};

const pickers: [string, () => ReactElement, RegExp][] = [
  ["DatePicker", () => <DatePicker aria-label="Due" value={from} onChange={noop} />, /17\/03\/2026/],
  ["DateRangePicker", () => <DateRangePicker aria-label="Span" value={{ from, to }} onChange={noop} />, /19\/03\/2026/],
  ["DateTimePicker", () => <DateTimePicker aria-label="At" value={from} onChange={noop} />, /09:05/],
  ["DateTimeRangePicker", () => <DateTimeRangePicker aria-label="Window" value={{ from, to }} onChange={noop} />, /18:30/],
];

describe.each(pickers)("%s with a value", (_name, picker, shown) => {
  it("is empty on a server and shows its value after hydration without an error", async () => {
    const html = renderToString(picker());
    expect(html).not.toMatch(/\d\d\/\d\d\/\d{4}|\d\d:\d\d/);

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.append(container);
    const onRecoverableError = vi.fn();
    await act(async () => {
      hydrateRoot(container, picker(), { onRecoverableError });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.textContent + [...container.querySelectorAll("input")].map((i) => i.value).join(" ")).toMatch(shown);
    container.remove();
  });
});
