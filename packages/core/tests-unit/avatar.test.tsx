import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { Avatar } from "../src";

describe("Avatar", () => {
  it("is named by the name and shows the first letters of the first and last word", () => {
    const { getByRole } = render(<Avatar name="Ada King Lovelace" />);
    expect(getByRole("img", { name: "Ada King Lovelace" }).textContent).toBe("AL");
  });

  it("gives one letter for one word, and takes the initials it is given", () => {
    expect(render(<Avatar name="platform" />).container.textContent).toBe("P");
    expect(render(<Avatar name="Ada Lovelace" initials="AK" />).container.textContent).toBe("AK");
  });

  it("shows the picture, and the initials when it fails", () => {
    const { container, getByRole } = render(<Avatar name="Ada Lovelace" src="/missing.png" />);
    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("/missing.png");
    fireEvent.error(img);
    expect(container.querySelector("img")).toBeNull();
    expect(getByRole("img").textContent).toBe("AL");
  });
});
