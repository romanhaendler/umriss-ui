/* What the three lists say through the shared announcer
   (listbox-announcements 02): the count on opening and on every filter, the
   option the keys moved onto with the state VoiceOver leaves out, and in the
   multi-select what was added or removed where no checkbox said it.

   Read after the rest, as a screen reader would hear it; the announcer's own
   mechanics stand in announce.test.ts. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Combobox } from "../src/components/Combobox";
import { MultiSelect } from "../src/components/MultiSelect";
import { CommandPalette } from "../src/components/CommandPalette";
import { LanguageProvider } from "../src/lib/language";
import { GERMAN_WORDING } from "../src/lib/language/de";
import { ANNOUNCE_REST } from "../src/lib/announce";

/** What the region of `host` says once the announcements have rested. */
function heard(host: Element = document.body): string | null {
  act(() => {
    vi.advanceTimersByTime(ANNOUNCE_REST);
  });
  const region = Array.from(host.children).find((c) => c.hasAttribute("data-umriss-announcer"));
  return region?.textContent ?? null;
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  // The region outlives the render; the next test must not hear this one.
  document.querySelectorAll("[data-umriss-announcer]").forEach((r) => r.remove());
});

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta", disabled: true },
  { value: "c", label: "Gamma" },
  { value: "d", label: "Delta" },
];

describe("Combobox - what it says", () => {
  const setup = (value: string | null = null) => {
    render(<Combobox options={OPTIONS} value={value} onChange={vi.fn()} aria-label="Letter" />);
    return screen.getByRole("combobox");
  };

  it("counts the options on opening and on every letter", () => {
    const input = setup();
    fireEvent.click(input);
    expect(heard()).toBe("4 options");
    fireEvent.change(input, { target: { value: "ta" } });
    expect(heard()).toBe("2 options");
    fireEvent.change(input, { target: { value: "del" } });
    expect(heard()).toBe("1 option");
  });

  it("says the empty text where nothing is left", () => {
    const input = setup();
    fireEvent.change(input, { target: { value: "xyz" } });
    expect(heard()).toBe("No matches");
  });

  it("names the option the keys moved onto, with its state", () => {
    const input = setup("c");
    fireEvent.click(input);
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(heard()).toBe("Beta, unavailable");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(heard()).toBe("Gamma, selected");
  });

  it("opening by the arrow key counts too", () => {
    const input = setup();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(heard()).toBe("4 options");
  });

  it("speaks German under a German wording", () => {
    render(
      <LanguageProvider wording={GERMAN_WORDING}>
        <Combobox options={OPTIONS} value="a" onChange={vi.fn()} aria-label="Buchstabe" />
      </LanguageProvider>,
    );
    const input = screen.getByRole("combobox");
    fireEvent.click(input);
    expect(heard()).toBe("4 Optionen");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(heard()).toBe("Alpha, ausgewählt");
  });
});

describe("MultiSelect - what it says", () => {
  function Harness({ initial = [] as string[] }) {
    const [value, setValue] = useState<string[]>(initial);
    return <MultiSelect options={OPTIONS} value={value} onChange={setValue} aria-label="Letters" />;
  }
  const main = () => screen.getAllByRole("button").find((b) => b.getAttribute("aria-haspopup") === "dialog")!;
  const search = () => screen.getByRole("textbox", { name: "Search options" });

  it("counts the options on opening, on searching and on a change of scope", () => {
    render(<Harness initial={["a"]} />);
    fireEvent.click(main());
    expect(heard()).toBe("4 options");
    fireEvent.change(search(), { target: { value: "ta" } });
    expect(heard()).toBe("2 options");
    fireEvent.change(search(), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Selected (1)" }));
    expect(heard()).toBe("1 option");
  });

  it("says what Enter in the search added and removed", () => {
    render(<Harness />);
    fireEvent.click(main());
    fireEvent.change(search(), { target: { value: "gam" } });
    fireEvent.keyDown(search(), { key: "Enter" });
    expect(heard()).toBe("Gamma added");
    fireEvent.keyDown(search(), { key: "Enter" });
    expect(heard()).toBe("Gamma removed");
  });

  it("says what a chip and Backspace removed", () => {
    render(<Harness initial={["a", "c"]} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove Alpha" }));
    expect(heard()).toBe("Alpha removed");
    fireEvent.keyDown(main(), { key: "Backspace" });
    expect(heard()).toBe("Gamma removed");
  });

  it("leaves a checkbox's own tick to the checkbox", () => {
    // A focused checkbox says "checked" itself; a second voice would double it.
    render(<Harness />);
    fireEvent.click(main());
    heard();
    fireEvent.click(screen.getByRole("checkbox", { name: "Alpha" }));
    expect(heard()).toBe("4 options");
  });
});

describe("CommandPalette - what it says", () => {
  const ITEMS = [
    { id: "table", label: "Table", group: "Data" },
    { id: "filter", label: "TableFilterStrip", group: "Data" },
    { id: "tree", label: "TreeView", group: "Structure" },
  ];
  const setup = (restingItems?: typeof ITEMS) => {
    render(<CommandPalette open onClose={vi.fn()} items={ITEMS} restingItems={restingItems} onChoose={vi.fn()} />);
    return { field: screen.getByRole("combobox"), dialog: screen.getByRole("dialog") };
  };

  it("counts the finds inside its own dialog, where the page behind is inert", () => {
    const { field, dialog } = setup();
    fireEvent.change(field, { target: { value: "table" } });
    expect(heard(dialog)).toBe("2 finds");
    fireEvent.change(field, { target: { value: "tablef" } });
    expect(heard(dialog)).toBe("1 find");
    fireEvent.change(field, { target: { value: "zzz" } });
    expect(heard(dialog)).toBe("Nothing found");
  });

  it("counts a resting list on opening", () => {
    const { dialog } = setup(ITEMS.slice(0, 2));
    expect(heard(dialog)).toBe("2 finds");
  });

  it("says nothing on opening to an empty field alone", () => {
    const { dialog } = setup();
    expect(heard(dialog)).toBeNull();
  });

  it("names the find the keys moved onto, with its group", () => {
    const { field, dialog } = setup(ITEMS);
    fireEvent.keyDown(field, { key: "ArrowDown" });
    expect(heard(dialog)).toBe("TableFilterStrip, Data");
    fireEvent.keyDown(field, { key: "ArrowDown" });
    expect(heard(dialog)).toBe("TreeView, Structure");
  });
});
