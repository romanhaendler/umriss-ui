/* Where a field's width is said (control-sizes 02, ADR-0041): the root that
   carries it, and what `chars` writes there. The layout itself - what the
   width does in a row, a column, a phone - stands in the browser suite
   (features-sizes.spec.ts); this is the half jsdom can see. */

import { describe, expect, it } from "vitest";
import { createRef } from "react";
import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import {
  Combobox,
  ControlSizeProvider,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  DateTimeRangePicker,
  DEFAULT_WORDING,
  Input,
  MultiSelect,
  NumberInput,
  Select,
  Textarea,
} from "../src";

/** The field's root: the outermost element it renders. */
const root = (ui: ReactElement) => render(ui).container.firstElementChild as HTMLElement;
const chars = (element: HTMLElement) => element.style.getPropertyValue("--_chars");

const FIELDS: Record<string, (props: { chars?: number; style?: object }) => ReactElement> = {
  Input: (p) => <Input aria-label="Field" {...p} />,
  Textarea: (p) => <Textarea aria-label="Field" {...p} />,
  Select: (p) => (
    <Select aria-label="Field" {...p}>
      <option>A</option>
    </Select>
  ),
  NumberInput: (p) => <NumberInput aria-label="Field" value={null} onChange={() => {}} {...p} />,
  Combobox: (p) => <Combobox aria-label="Field" value={null} onChange={() => {}} options={[]} {...p} />,
  MultiSelect: (p) => <MultiSelect aria-label="Field" value={[]} onChange={() => {}} options={[]} {...p} />,
  DatePicker: (p) => <DatePicker aria-label="Field" value={null} onChange={() => {}} {...p} />,
  DateTimePicker: (p) => <DateTimePicker aria-label="Field" value={null} onChange={() => {}} {...p} />,
  DateRangePicker: (p) => <DateRangePicker aria-label="Field" value={null} onChange={() => {}} {...p} />,
  DateTimeRangePicker: (p) => <DateTimeRangePicker aria-label="Field" value={null} onChange={() => {}} {...p} />,
};

describe("chars on every field", () => {
  for (const [name, field] of Object.entries(FIELDS)) {
    it(`${name}: fixes the root at the count`, () => {
      const element = root(field({ chars: 7 }));
      expect(chars(element)).toBe("7");
      expect(element.style.inlineSize).toBe("fit-content");
    });

    it(`${name}: without it, the root is not fixed`, () => {
      expect(root(field({})).style.inlineSize).toBe("");
    });
  }

  /* `style` reaches the root of every field, and the caller's own wins over the width. */
  for (const name of Object.keys(FIELDS)) {
    it(`${name}: a caller's style wins over chars`, () => {
      const element = root(FIELDS[name]!({ chars: 7, style: { inlineSize: "120px", marginTop: "3px" } }));
      expect(element.style.inlineSize).toBe("120px");
      expect(element.style.marginTop).toBe("3px");
      expect(chars(element)).toBe("7");
    });
  }
});

describe("Input and Textarea always wear their wrapper", () => {
  it("Input: the class on the wrapper, ref and rest on the input", () => {
    const ref = createRef<HTMLInputElement>();
    const element = root(<Input ref={ref} className="probe" name="city" aria-label="City" />);
    expect(element.tagName).toBe("SPAN");
    expect(element.classList.contains("probe")).toBe(true);
    expect(ref.current?.parentElement).toBe(element);
    expect(ref.current?.name).toBe("city");
  });

  it("Input: a hidden input is no field and stands bare", () => {
    const element = root(<Input type="hidden" name="token" value="x" className="probe" readOnly />);
    expect(element.tagName).toBe("INPUT");
    expect(element.classList.contains("probe")).toBe(true);
  });

  it("Textarea: the class on the wrapper, with a count or without", () => {
    for (const ui of [
      <Textarea key="plain" className="probe" aria-label="Note" />,
      <Textarea key="counted" className="probe" aria-label="Note" maxLength={20} showCount />,
    ]) {
      const element = root(ui);
      expect(element.tagName).toBe("SPAN");
      expect(element.classList.contains("probe")).toBe(true);
      expect(element.querySelector("textarea")?.classList.contains("probe")).toBe(false);
    }
  });
});

/* A server renders the width into the markup: an application rendered by
   Next.js or Remix shows its fields at their width before any script runs,
   and hydration finds the same style - nothing is measured on the client. */
describe("rendered on a server", () => {
  it("writes the count and the fixed width into the style attribute", () => {
    const html = renderToString(
      <ControlSizeProvider size="sm">
        <Input aria-label="Postcode" chars={5} />
        <DatePicker aria-label="Due" value={null} onChange={() => {}} />
      </ControlSizeProvider>,
    );
    expect(html).toContain("--_chars:5");
    expect(html).toContain("inline-size:fit-content");
    // The picker's natural count from its format, and the provider's size.
    expect(html).toMatch(/--_chars:\d+/);
    expect(html).toMatch(/_wrapperSm_|_sm_/);
  });
});

describe("a field's own count", () => {
  it("NumberInput counts a prefix and a suffix given as text, with their gap", () => {
    const element = root(<NumberInput aria-label="Weight" value={null} onChange={() => {}} suffix="kg" />);
    expect(element.style.getPropertyValue("--_extra")).toBe("3");
  });

  it("NumberInput does not count an adornment that is no text", () => {
    const element = root(<NumberInput aria-label="Weight" value={null} onChange={() => {}} suffix={<svg />} />);
    expect(element.style.getPropertyValue("--_extra")).toBe("");
  });

  it("a date picker is as wide as its longest value in the formats in use", () => {
    // 28/12/2026 - ten characters in the default formats - or the placeholder, if longer.
    expect(chars(root(FIELDS.DatePicker!({})))).toBe(
      String(Math.max("28/12/2026".length, DEFAULT_WORDING.datePlaceholder.length)),
    );
    // Two dates, the dash between them counted as three.
    expect(chars(root(FIELDS.DateRangePicker!({})))).toBe(String(2 * 10 + 3));
  });

  it("a placeholder longer than the value sets the count", () => {
    const element = root(
      <DatePicker aria-label="Due" value={null} onChange={() => {}} placeholder="Pick the day the invoice is due" />,
    );
    expect(chars(element)).toBe(String("Pick the day the invoice is due".length));
  });
});
