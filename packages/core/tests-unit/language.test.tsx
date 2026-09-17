/* The seam for formatting and wording (consumable-package 01).

   The characterisation in formatsCharacterisation.test.tsx holds down *what*
   comes out. Here stands *how* one changes it - and above all that one has to
   do nothing to get the default.

   The English texts asserted below are the shipped wording; they are the
   subject of the test and move only with the ticket that owns them. The German
   ones at the foot come from `@umriss-ui/core/wording/de`, which is no longer
   the default but is still shipped (ADR-0019). */

import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { DateRangePicker, DateTimeRangePicker } from "../src/components/DatePicker";
import {
  DEFAULT_FORMATS,
  DEFAULT_WORDING,
  LanguageProvider,
  mergeLanguage,
} from "../src/lib/language";
import { Input } from "../src/components/Input";
import { Spinner } from "../src/components/Spinner";
import { MultiSelect } from "../src/components/MultiSelect";
import { TreeSearch, TreeView, useTree } from "../src/components/TreeView";

describe("mergeLanguage – overriding entry by entry", () => {
  it("yields the default without a value", () => {
    const language = mergeLanguage(undefined);
    expect(language.wording).toBe(DEFAULT_WORDING);
    expect(language.formats).toBe(DEFAULT_FORMATS);
  });

  it("replaces exactly the entry given", () => {
    const { wording } = mergeLanguage({ wording: { clear: "Leeren" } });
    expect(wording.clear).toBe("Leeren");
  });

  it("leaves every entry not given on the default", () => {
    const { wording } = mergeLanguage({ wording: { clear: "Leeren" } });
    // No empty string, no key name - the shipped text.
    expect(wording.cancel).toBe("Cancel");
    expect(wording.today).toBe("Today");
  });

  it("merges the presets entry by entry as well", () => {
    const { wording } = mergeLanguage({ wording: { presets: { today: "Heute" } } });
    expect(wording.presets.today).toBe("Heute");
    expect(wording.presets.yesterday).toBe("Yesterday");
  });

  it("replaces a single formatter and leaves the rest standing", () => {
    const { formats } = mergeLanguage({
      formats: { date: (d) => `Tag ${d.getDate()}` },
    });
    expect(formats.date(new Date(2026, 2, 17))).toBe("Tag 17");
    expect(formats.number(1234.5, 1)).toBe("1.234,5");
  });

  it("lets function entries keep their arguments", () => {
    const { wording } = mergeLanguage({
      wording: { pageOfPages: (page, total) => `${page}/${total}` },
    });
    expect(wording.pageOfPages(2, 7)).toBe("2/7");
  });
});

describe("Without a provider – the tested normal case", () => {
  it("labels the clear cross in the text field in English", () => {
    render(<Input value="etwas" onChange={() => {}} clearable onClear={() => {}} />);
    expect(screen.getByLabelText("Clear input")).toBeTruthy();
  });

  it("labels the spinner in English", () => {
    render(<Spinner />);
    expect(screen.getByLabelText("Loading")).toBeTruthy();
  });
});

describe("With a provider – the override reaches the component", () => {
  it("carries an overridden entry into the text field", () => {
    render(
      <LanguageProvider wording={{ clearInput: "Eingabe leeren" }}>
        <Input value="etwas" onChange={() => {}} clearable onClear={() => {}} />
      </LanguageProvider>,
    );
    expect(screen.getByLabelText("Eingabe leeren")).toBeTruthy();
  });

  it("leaves a component the entry does not concern unchanged", () => {
    render(
      <LanguageProvider wording={{ clearInput: "Eingabe leeren" }}>
        <Spinner />
      </LanguageProvider>,
    );
    expect(screen.getByLabelText("Loading")).toBeTruthy();
  });
});

/* library-audit 03: words that stood in the component past the register. */
describe("Wording that used to stand as a literal", () => {

  it("takes the shipped buttons without a provider", () => {
    expect(DEFAULT_WORDING.filterReset).toBe("Reset");
    expect(DEFAULT_WORDING.filterDone).toBe("Done");
  });

  it("builds the multi-select summary out of the wording", () => {
    expect(DEFAULT_WORDING.multiSelectSummary(3, 12)).toBe("3 / 12");
    const { container } = render(
      <LanguageProvider wording={{ multiSelectSummary: (chosen, n) => `${chosen} from ${n}` }}>
        <MultiSelect
          options={[
            { value: "a", label: "Alpha" },
            { value: "b", label: "Beta" },
          ]}
          value={["a"]}
          onChange={() => undefined}
        />
      </LanguageProvider>,
    );
    fireEvent.click(container.querySelector('[aria-haspopup="dialog"]')!);
    expect(screen.getByText("1 from 2")).toBeTruthy();
  });
});

/* library-audit 02: the panel of the range with time was named after a
   placeholder entry, and its clear × shared the entry of the range without
   time - an application could not name the two differently. */
describe("Wording of the range with time", () => {
  it("no longer carries the placeholder entry", () => {
    expect("zeitraumMitZeitPlatzhalter" in DEFAULT_WORDING).toBe(false);
  });

  it("names the panel with an entry of its own", () => {
    render(
      <LanguageProvider wording={{ dateTimeRangePanel: "Range with time" }}>
        <DateTimeRangePicker value={null} onChange={() => undefined} />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Select range" }));
    expect(screen.getByRole("dialog", { name: "Range with time" })).toBeTruthy();
  });

  it("labels the clear × separately from the range without time", () => {
    const range = { from: new Date(2026, 2, 17, 8, 0), to: new Date(2026, 2, 17, 17, 0) };
    render(
      <LanguageProvider wording={{ dateTimeRangeClear: "Clear range with time" }}>
        <DateTimeRangePicker value={range} onChange={() => undefined} clearable />
        <DateRangePicker value={range} onChange={() => undefined} clearable />
      </LanguageProvider>,
    );
    expect(screen.getByLabelText("Clear range with time")).toBeTruthy();
    expect(screen.getByLabelText(DEFAULT_WORDING.dateRangeClear)).toBeTruthy();
  });
});

describe("Wording of the tree", () => {
  interface Folder {
    id: string;
    name: string;
    contents?: Folder[];
  }
  const READER = {
    key: (f: Folder) => f.id,
    children: (f: Folder) => f.contents,
    label: (f: Folder) => f.name,
  };
  const TREE: Folder[] = [{ id: "a", name: "Plants" }];

  function Sample() {
    const tree = useTree(TREE, { reader: READER, search: "Rainbow" });
    return (
      <>
        <TreeSearch tree={tree} aria-label="Suche" />
        <TreeView tree={tree} ariaLabel="Ablage">
          {(e) => e.node.name}
        </TreeView>
      </>
    );
  }

  it("takes the shipped defaults without a value", () => {
    render(<Sample />);
    expect(screen.getByLabelText("Suche").getAttribute("placeholder")).toBe(
      DEFAULT_WORDING.treeSearchPlaceholder,
    );
    expect(screen.getByText(DEFAULT_WORDING.treeNoMatches)).toBeTruthy();
  });

  it("lets a single entry be overridden and leaves the others standing", () => {
    render(
      <LanguageProvider wording={{ treeNoMatches: "Nichts gefunden." }}>
        <Sample />
      </LanguageProvider>,
    );
    expect(screen.getByText("Nichts gefunden.")).toBeTruthy();
    // The entry not overridden falls back on the default and not on an empty
    // text or a key.
    expect(screen.getByLabelText("Suche").getAttribute("placeholder")).toBe(
      DEFAULT_WORDING.treeSearchPlaceholder,
    );
  });
});

/* ADR-0019: German is shipped, behind the subpath and not in the barrel. One
   mount holds that wire, written the way a consumer writes it. It is not a
   conformance check over the register - the type is that, because both objects
   are typed `Wording`. */
describe("The German wording from `@umriss-ui/core/wording/de`", () => {
  it("labels the spinner in German when it is handed in", () => {
    render(
      <LanguageProvider wording={GERMAN_WORDING}>
        <Spinner />
      </LanguageProvider>,
    );
    expect(screen.getByLabelText("Wird geladen")).toBeTruthy();
  });
});
