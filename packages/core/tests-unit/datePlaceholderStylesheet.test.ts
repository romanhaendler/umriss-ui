/* The DatePicker placeholder stands on the secondary text token: the muted one
   is 3.4:1 on the field and axe reports it. */

import { describe, expect, it } from "vitest";
import CSS from "../src/components/DatePicker/DatePicker.module.css?raw";

describe("DatePicker placeholder", () => {
  it("reads the secondary text colour", () => {
    expect(CSS).toMatch(/\.placeholder \{[^}]*color:\s*var\(--u-color-text-secondary\)/);
  });
});
