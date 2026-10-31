import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Slider } from "../src";
afterEach(cleanup);
const press = (key: string, props: Record<string, unknown>) => {
  const onChange = vi.fn();
  render(<Slider aria-label="s" onValueChange={onChange} {...props} />);
  fireEvent.keyDown(screen.getByRole("slider"), { key });
  return onChange;
};
describe("p29 slider", () => {
  it("min 0.5 step 1: ArrowRight from min lands on 1.5", () => {
    expect(press("ArrowRight", { min: 0.5, max: 10.5, step: 1 })).toHaveBeenCalledWith(1.5);
  });
  it("step 1e-7 is not rounded to integers", () => {
    expect(press("ArrowRight", { min: 0, max: 1, step: 1e-7, defaultValue: 0.5 })).toHaveBeenCalledWith(0.5000001);
  });
  it("min 0.25 step 0.5 End goes to the top of the grid 9.75", () => {
    expect(press("End", { min: 0.25, max: 10, step: 0.5 })).toHaveBeenCalledWith(9.75);
  });
});
