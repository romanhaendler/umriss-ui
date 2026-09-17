/* The command palette (command-palette 04 and 06).

   What is checked is what a person observes: where the arrow keys lead, what
   happens to the mark while typing, what is reported when Enter falls. What is
   not checked are class names, effects and the rank formula - that stands in
   search.test.ts, and there purely without a DOM.

   The models are baumBedienung.test.tsx (the keyboard) and popover.test.tsx
   (dismissing, focus). */

import { describe, expect, it, vi } from "vitest";
import { act, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  CommandPalette,
  useCommandPaletteShortcut,
  type CommandPaletteItem,
} from "../src/components/CommandPalette";
import { LanguageProvider } from "../src/lib/language";

const ITEMS: CommandPaletteItem[] = [
  { id: "table", label: "Table", group: "Table" },
  { id: "tablefilter", label: "TableFilterStrip", group: "Table" },
  { id: "treeview", label: "TreeView", group: "Struktur" },
  { id: "datetime", label: "DateTimePicker", group: "Formulare" },
];

function Harness({
  items = ITEMS,
  onChoose = vi.fn(),
  initiallyOpen = true,
  restingItems,
}: {
  items?: CommandPaletteItem[];
  onChoose?: (id: string) => void;
  initiallyOpen?: boolean;
  restingItems?: CommandPaletteItem[];
}) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open</button>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        onChoose={onChoose}
        restingItems={restingItems}
      />
    </div>
  );
}

const field = () => screen.getByRole("combobox");
const rows = () => screen.queryAllByRole("option");
const labels = () => rows().map((r) => r.textContent);
const marked = () => rows().find((r) => r.getAttribute("aria-selected") === "true");

const type = (text: string) => fireEvent.change(field(), { target: { value: text } });

/* ------------------------------------------------------------------ */

describe("Command palette - the resting state and the empty state", () => {
  it("shows no row before the first character", () => {
    // The window is a search field and not a menu. Without this rule the list can
    // only shrink, and the growth would not be producible at all.
    render(<Harness />);
    expect(rows()).toHaveLength(0);
  });

  it("says in one row when the query finds nothing", () => {
    render(<Harness />);
    type("zzzzz");
    expect(rows()).toHaveLength(0);
    expect(screen.getByText("Nothing found")).toBeTruthy();
  });

  it("does not say that in the resting state - nothing was searched for there", () => {
    render(<Harness />);
    expect(screen.queryByText("Nothing found")).toBeNull();
  });

  it("starts again in the resting state on every opening", () => {
    render(<Harness />);
    type("table");
    expect(rows().length).toBeGreaterThan(0);
    fireEvent.keyDown(field(), { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(rows()).toHaveLength(0);
  });
});

/* The resting state is empty without a value and stays so. Whoever wants to fill
   it says WITH WHAT - "all" is only one of several sensible cases and the worst
   one with long lists. */
describe("Command palette - a filled resting state", () => {
  const RESTING = [
    { id: "charge", label: "Charge anlegen", group: "Commands" },
    { id: "schicht", label: "Close the shift", group: "Commands" },
  ];

  it("shows before the first character what the caller names", () => {
    render(<Harness restingItems={RESTING} />);
    expect(labels()).toHaveLength(2);
    expect(screen.getByRole("option", { name: /Charge anlegen/ })).toBeTruthy();
  });

  it("keeps the caller's order in doing so", () => {
    // Without a query there is no rank; the order belongs to the caller.
    render(<Harness restingItems={[...RESTING].reverse()} />);
    expect(labels()[0]).toContain("Close the shift");
  });

  it("marks nothing in doing so", () => {
    // Nothing has been searched for - a mark would be a lie.
    render(<Harness restingItems={RESTING} />);
    expect(rows()[0]!.querySelectorAll("span span")).toHaveLength(0);
  });

  it("does not say in the resting state that nothing was found", () => {
    render(<Harness restingItems={[]} />);
    expect(screen.queryByText("Nothing found")).toBeNull();
  });

  it("gives way to the finds on the first character and comes back afterwards", () => {
    render(<Harness restingItems={RESTING} />);
    type("tree");
    expect(labels()).toEqual(["TreeViewStruktur"]);
    type("");
    expect(labels()).toHaveLength(2);
  });

  it("lets the rows be chosen and operated with the arrows", () => {
    const onChoose = vi.fn();
    render(<Harness restingItems={RESTING} onChoose={onChoose} />);
    fireEvent.keyDown(field(), { key: "ArrowDown" });
    fireEvent.keyDown(field(), { key: "Enter" });
    expect(onChoose).toHaveBeenCalledWith("schicht");
  });

  it("then also shows the foot - there is already something to move", () => {
    render(<Harness restingItems={RESTING} />);
    expect(screen.getByText("close")).toBeTruthy();
  });

  it("changes nothing about the case without a value", () => {
    render(<Harness />);
    expect(rows()).toHaveLength(0);
    expect(screen.queryByText("close")).toBeNull();
  });
});

describe("Command palette - the keyboard", () => {
  it("moves the mark down and up", () => {
    render(<Harness />);
    type("table");
    expect(marked()?.textContent).toContain("Table");

    fireEvent.keyDown(field(), { key: "ArrowDown" });
    expect(marked()?.textContent).toContain("TableFilterStrip");

    fireEvent.keyDown(field(), { key: "ArrowUp" });
    expect(marked()?.textContent).toContain("Table");
  });

  it("runs round at both ends", () => {
    render(<Harness />);
    type("table");
    const count = rows().length;
    expect(count).toBeGreaterThan(1);

    fireEvent.keyDown(field(), { key: "ArrowUp" });
    expect(marked()).toBe(rows()[count - 1]);

    fireEvent.keyDown(field(), { key: "ArrowDown" });
    expect(marked()).toBe(rows()[0]);
  });

  it("leaves the headings out", () => {
    // Headings are not options; "down" therefore always lands on something
    // choosable, across a group boundary as well.
    render(<Harness />);
    type("t");
    const steps = rows().length;
    expect(screen.getAllByRole("group").length).toBeGreaterThan(1);
    for (let i = 0; i < steps; i++) {
      fireEvent.keyDown(field(), { key: "ArrowDown" });
      expect(marked()).toBeTruthy();
    }
  });

  it("reports the id of the marked entry with Enter", () => {
    const onChoose = vi.fn();
    render(<Harness onChoose={onChoose} />);
    type("tree");
    fireEvent.keyDown(field(), { key: "Enter" });
    expect(onChoose).toHaveBeenCalledWith("treeview");
  });

  it("reports nothing when nothing is found", () => {
    const onChoose = vi.fn();
    render(<Harness onChoose={onChoose} />);
    type("zzzzz");
    fireEvent.keyDown(field(), { key: "Enter" });
    expect(onChoose).not.toHaveBeenCalled();
  });

  it("closes with Escape and gives the focus back", () => {
    render(<Harness initiallyOpen={false} />);
    const trigger = screen.getByRole("button", { name: "Open" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(document.activeElement).toBe(field());

    fireEvent.keyDown(field(), { key: "Escape" });
    expect(document.querySelector("dialog")!.hasAttribute("open")).toBe(false);
    // The focus goes back where it came from - otherwise it stands at the top of
    // the page after closing.
    expect(document.activeElement).toBe(trigger);
  });
});

/* library-audit 04: a row chose on every mousedown, including that of the right
   button - whoever wanted the context menu had already chosen. */
describe("Command palette - only the main button chooses", () => {
  it("does not choose on a right click, but does on a left click", () => {
    const onChoose = vi.fn();
    render(<Harness onChoose={onChoose} />);
    type("tab");
    fireEvent.mouseDown(rows()[0]!, { button: 2 });
    expect(onChoose).not.toHaveBeenCalled();
    fireEvent.mouseDown(rows()[0]!, { button: 0 });
    expect(onChoose).toHaveBeenCalledTimes(1);
  });
});

/* library-audit 01: every gesture reported twice - once itself and once through
   the close event that its own `dialog.close()` triggered. */
describe("Command palette - onClose exactly once", () => {
  function CountHarness({ onClose }: { onClose: () => void }) {
    const [open, setOpen] = useState(true);
    return (
      <CommandPalette
        open={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        items={ITEMS}
        onChoose={() => undefined}
      />
    );
  }
  const dialog = () => document.querySelector("dialog")!;

  it("on Escape in the field", () => {
    const onClose = vi.fn();
    render(<CountHarness onClose={onClose} />);
    fireEvent.keyDown(field(), { key: "Escape" });
    expect(dialog().hasAttribute("open")).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("on the cancelling of the dialog", () => {
    const onClose = vi.fn();
    render(<CountHarness onClose={onClose} />);
    fireEvent(dialog(), new Event("cancel", { cancelable: true }));
    expect(dialog().hasAttribute("open")).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("on a click on the backdrop", () => {
    const onClose = vi.fn();
    render(<CountHarness onClose={onClose} />);
    fireEvent.mouseDown(dialog());
    expect(dialog().hasAttribute("open")).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("reports an Escape the browser does not let be cancelled only once", () => {
    const onClose = vi.fn();
    render(<CountHarness onClose={onClose} />);
    act(() => {
      dialog().dispatchEvent(new Event("cancel", { cancelable: false }));
      dialog().close();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("reports a close that does not come from the choreography", () => {
    const onClose = vi.fn();
    render(<CountHarness onClose={onClose} />);
    act(() => dialog().close());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("Command palette - the mark while typing", () => {
  it("stays on the same entry as long as it still fits", () => {
    // The case at issue: one has found what one wanted and types on only to make
    // the list shorter.
    render(<Harness />);
    type("ta");
    fireEvent.keyDown(field(), { key: "ArrowDown" });
    const held = marked()!.textContent;

    type("tab");
    expect(marked()!.textContent).toBe(held);
  });

  it("falls back to the first when the held one is gone", () => {
    render(<Harness />);
    type("t");
    fireEvent.keyDown(field(), { key: "ArrowDown" });
    fireEvent.keyDown(field(), { key: "ArrowDown" });

    type("tree");
    // Never on nothing: with finds the mark stands on the first.
    expect(marked()).toBe(rows()[0]);
    expect(marked()!.textContent).toContain("TreeView");
  });
});

describe("Command palette - the pointer against the keyboard", () => {
  /* The one rule jsdom can express at all: the difference between "the pointer
     is above the row" and "the pointer has moved". The real case - the list
     shrinks under the resting mouse - belongs in the browser and stands in
     features-shell.spec.ts. */

  it("does not take the mark when a row merely slides under the pointer", () => {
    render(<Harness />);
    type("table");
    const second = rows()[1]!;

    // pointerenter alone: that is exactly what fires when the list repaints under
    // a motionless pointer.
    fireEvent.pointerEnter(second);
    expect(marked()).toBe(rows()[0]);
  });

  it("takes the mark on a real movement", () => {
    render(<Harness />);
    type("table");
    const second = rows()[1]!;

    fireEvent.pointerMove(second);
    expect(marked()).toBe(second);
  });

  it("gives the mark back to the keyboard on the next arrow key", () => {
    render(<Harness />);
    type("table");
    fireEvent.pointerMove(rows()[1]!);
    expect(marked()).toBe(rows()[1]);

    fireEvent.keyDown(field(), { key: "ArrowUp" });
    expect(marked()).toBe(rows()[0]);

    // And now it belongs to the keyboard again: mere sweeping over does not count.
    fireEvent.pointerEnter(rows()[1]!);
    expect(marked()).toBe(rows()[0]);
  });

  it("chooses a row on a click, no matter who has the mark", () => {
    const onChoose = vi.fn();
    render(<Harness onChoose={onChoose} />);
    type("table");
    fireEvent.mouseDown(rows()[1]!);
    expect(onChoose).toHaveBeenCalledWith("tablefilter");
  });
});

describe("Command palette - the announcement and the build-up", () => {
  it("names the window and sets up the field and the list as a pair", () => {
    render(<Harness />);
    expect(screen.getByRole("dialog", { name: "Command palette" })).toBeTruthy();
    type("table");
    expect(field().getAttribute("aria-controls")).toBe(screen.getByRole("listbox").id);
  });

  it("lets aria-activedescendant follow the mark", () => {
    render(<Harness />);
    type("table");
    expect(field().getAttribute("aria-activedescendant")).toBe(marked()!.id);

    fireEvent.keyDown(field(), { key: "ArrowDown" });
    expect(field().getAttribute("aria-activedescendant")).toBe(marked()!.id);
  });

  it("puts no list there at all in the resting state", () => {
    // An empty listbox is not an empty state but a role that promises a structure
    // which does not exist.
    render(<Harness />);
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(field().getAttribute("aria-controls")).toBeNull();
    expect(field().getAttribute("aria-activedescendant")).toBeNull();
    expect(field().getAttribute("aria-expanded")).toBe("false");
  });

  it("hangs the rows on their heading", () => {
    render(<Harness />);
    type("table");
    const group = screen.getByRole("group");
    const heading = document.getElementById(group.getAttribute("aria-labelledby")!);
    expect(heading?.textContent).toBe("Table");
    expect(group.querySelectorAll('[role="option"]').length).toBe(2);
  });

  it("announces the number of finds when it changes", () => {
    render(<Harness />);
    type("table");
    expect(screen.getByRole("status").textContent).toBe("2 finds");
    type("tablef");
    expect(screen.getByRole("status").textContent).toBe("1 find");
  });

  it("marks the matched characters", () => {
    // A find that no substring explains must let one see why it is one.
    render(<Harness />);
    type("dtp");
    const hit = rows()[0]!;
    expect(hit.textContent).toContain("DateTimePicker");
    expect([...hit.querySelectorAll("span span")].map((s) => s.textContent).join("")).toBe(
      "DTP",
    );
  });
});

describe("Command palette - the wording", () => {
  it("lets every text be overridden", () => {
    render(
      <LanguageProvider wording={{ palettePanel: "Command window", paletteNoFinds: "No results" }}>
        <Harness />
      </LanguageProvider>,
    );
    expect(screen.getByRole("dialog", { name: "Command window" })).toBeTruthy();
    type("zzzzz");
    expect(screen.getByText("No results")).toBeTruthy();
  });

  it("lets the legend of the Escape key be overridden too", () => {
    // The arrows and the return symbol are glyphs; "Esc" is a word.
    render(
      <LanguageProvider wording={{ paletteKeyEsc: "Échap" }}>
        <Harness />
      </LanguageProvider>,
    );
    type("table");
    expect(screen.getByText("Échap")).toBeTruthy();
  });

  it("shows the foot only once something has been typed", () => {
    /* The one place at which two requirements of the spec contradict each other:
       the foot is to be findable "on first use" (story 36), and the window is to
       be ONLY the field in the resting state (story 50, ticket 05). Both at once
       is impossible. The resting state wins, because it is what produces the
       growth movement the package is about in the first place - and the foot is
       there after the first keystroke, so before anybody needs any of the three
       keys. Written down in the spec. */
    render(<Harness />);
    expect(screen.queryByText("close")).toBeNull();
    type("table");
    expect(screen.getByText("close")).toBeTruthy();
  });

  it("does not use the empty state of the combobox", () => {
    // `noMatches` belongs to the combobox. Whoever changes the one does not
    // silently change the other along with it.
    render(
      <LanguageProvider wording={{ noMatches: "GEAENDERT" }}>
        <Harness />
      </LanguageProvider>,
    );
    type("zzzzz");
    expect(screen.queryByText("GEAENDERT")).toBeNull();
    expect(screen.getByText("Nothing found")).toBeTruthy();
  });
});

describe("useCommandPaletteShortcut", () => {
  function Shortcut({ onOpen }: { onOpen: () => void }) {
    useCommandPaletteShortcut(onOpen);
    return (
      <div>
        <input aria-label="Textfeld" />
        <button>Knopf</button>
      </div>
    );
  }

  it("opens on Ctrl+K and on Meta+K", () => {
    const onOpen = vi.fn();
    render(<Shortcut onOpen={onOpen} />);
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it("opens on /", () => {
    const onOpen = vi.fn();
    render(<Shortcut onOpen={onOpen} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "/" });
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("does NOT open on / when the focus stands in a text field", () => {
    // Otherwise no field on the page can take a slash any more.
    const onOpen = vi.fn();
    render(<Shortcut onOpen={onOpen} />);
    fireEvent.keyDown(screen.getByLabelText("Textfeld"), { key: "/" });
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("takes a new callback along without changing the listener", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<Shortcut onOpen={first} />);
    rerender(<Shortcut onOpen={second} />);
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
