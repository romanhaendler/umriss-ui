import { expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Example from "../demo/examples/AlarmBanner/02-a-critical-alert-arrives";

it("keeps the focus on a list row while a critical alert arrives and the banner changes", () => {
  render(<Example />);
  const box = screen.getAllByRole("checkbox")[0]!;
  box.focus();
  expect(document.activeElement).toBe(box);
  const banner = screen.getByRole("region", { name: "Alarms" });
  expect(banner.textContent).not.toContain("p95 latency above 300");

  fireEvent.click(screen.getByRole("button", { name: "Add a critical alert" }));

  expect(banner.textContent).toContain("p95 latency above 300");
  expect(document.activeElement).toBe(box);
});
