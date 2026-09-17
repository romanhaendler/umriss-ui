/* Ids the library builds out of the caller's values (library-audit 04).

   A caller's value may contain anything, whitespace included - an id may not,
   where it is read by an IDREFS attribute: `aria-labelledby`,
   `aria-describedby` and `aria-controls` split at whitespace. A tab named
   "first page" named its panel with two ids that do not exist. And two trees
   on one page handed the same id to their checkboxes.

   The rule: the raw value never enters an id. `idPart` makes it free of
   whitespace and stays unique doing so; the basis of every id is a component's
   `useId()`. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { idPart } from "../src/lib/idPart";
import { Tab, TabList, TabPanel, Tabs } from "../src/components/Tabs";
import { RadioGroup } from "../src/components/RadioGroup";
import { TreeView, useTree, type NodeReader } from "../src/components/TreeView";
import { CommandPalette } from "../src/components/CommandPalette";

const withoutWhitespace = (id: string | null | undefined): boolean =>
  typeof id === "string" && id.length > 0 && !/\s/.test(id);

describe("idPart", () => {
  it("lets no whitespace into an id", () => {
    expect(withoutWhitespace(idPart("zwei worte\tund\nmehr"))).toBe(true);
  });

  it("stays unique, even against its own escaping", () => {
    /* The fifth value is "a", a NO-BREAK space, "b" - written as an escape
       because an invisible character in a fixture cannot be read. It must not
       collapse onto the plain-space value at the front, which is the whole
       point of the case. */
    const values = ["a b", "a-b", "a_b", "a_20_b", "a b", "ä"];
    expect(new Set(values.map(idPart)).size).toBe(values.length);
  });

  it("leaves simple values readable", () => {
    expect(idPart("tabelle-1")).toBe("tabelle-1");
    expect(idPart(42)).toBe("42");
  });
});

describe("Tabs – a value with a space", () => {
  it("names the panel after its tab and points at the right one", () => {
    render(
      <Tabs value="first page" onChange={() => undefined}>
        <TabList>
          <Tab value="first page">First</Tab>
          <Tab value="second">Second</Tab>
        </TabList>
        <TabPanel value="first page">Content</TabPanel>
      </Tabs>,
    );
    const tab = screen.getByRole("tab", { name: "First" });
    const panel = screen.getByRole("tabpanel", { name: "First" });
    expect(withoutWhitespace(tab.id)).toBe(true);
    expect(tab.getAttribute("aria-controls")).toBe(panel.id);
  });
});

describe("RadioGroup – a value with a space", () => {
  it("attaches the description to the option all the same", () => {
    render(
      <RadioGroup
        aria-label="Versand"
        options={[
          { value: "selbst abholen", label: "Abholung", description: "Im Lager." },
          { value: "post", label: "Post" },
        ]}
        defaultValue="post"
      />,
    );
    // An option's name is its whole label, description included.
    const option = screen.getByRole("radio", { name: /Abholung/ });
    const description = option.getAttribute("aria-describedby");
    expect(withoutWhitespace(option.id)).toBe(true);
    expect(withoutWhitespace(description)).toBe(true);
    expect(document.getElementById(description!)?.textContent).toBe("Im Lager.");
  });
});

describe("TreeView – two trees on one page", () => {
  interface Leaf {
    id: string;
    name: string;
  }
  const READER: NodeReader<Leaf> = {
    key: (l) => l.id,
    children: () => undefined,
    label: (l) => l.name,
  };

  function TreeProbe({ name, onChecked }: { name: string; onChecked: () => void }) {
    const tree = useTree(
      [
        { id: "a", name: `${name} A` },
        { id: "b", name: `${name} B` },
      ],
      { reader: READER, onChecked },
    );
    return (
      <TreeView tree={tree} ariaLabel={name} checkable>
        {(e) => e.node.name}
      </TreeView>
    );
  }

  it("hands out different ids, and a click on the label hits its own checkbox", () => {
    const left = vi.fn();
    const right = vi.fn();
    const { container } = render(
      <>
        <TreeProbe name="Links" onChecked={left} />
        <TreeProbe name="Rechts" onChecked={right} />
      </>,
    );
    const ids = [...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')].map((e) => e.id);
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(4);

    const box = screen.getByRole("tree", { name: "Rechts" }).querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    const label = [...container.querySelectorAll("label")].find((l) => l.htmlFor === box.id) ?? box.closest("label")!;
    fireEvent.click(label);
    expect(right).toHaveBeenCalled();
    expect(left).not.toHaveBeenCalled();
  });
});

describe("Command palette – a group and a candidate with spaces", () => {
  it("names the group after its heading and points at the right row", () => {
    render(
      <CommandPalette
        open
        onClose={() => undefined}
        onChoose={() => undefined}
        items={[{ id: "row one", label: "Table", group: "Two words" }]}
      />,
    );
    const field = screen.getByRole("combobox");
    fireEvent.change(field, { target: { value: "tab" } });
    expect(screen.getByRole("group", { name: "Two words" })).toBeTruthy();
    const row = screen.getByRole("option");
    expect(withoutWhitespace(row.id)).toBe(true);
    expect(field.getAttribute("aria-activedescendant")).toBe(row.id);
  });
});
