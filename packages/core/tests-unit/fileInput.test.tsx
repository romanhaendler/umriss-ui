/* The file input at the seam a caller has (core-layout-extras 03): the
   native `<input type="file">` behind a key, so Space, Enter, a label and a
   form's `name` come from the platform, and a drop zone around it. The files
   are listed and reported; sending them anywhere is the application's.

   A drop is not filtered by the browser - the picker is - so `accept` is the
   component's rule there, and it is the platform's rule as the HTML standard
   writes it: an extension, a MIME type, or a type's whole family. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { FileInput, FormField, LanguageProvider } from "../src";
import { accepts } from "../src/components/FileInput/accept";
import { GERMAN_WORDING } from "../src/lib/language/de";

const file = (name: string, type = "", bytes = 2048) => new File([new Uint8Array(bytes)], name, { type });

const CSV = file("recipe-0412.csv", "text/csv", 12_300);
const PNG = file("label.png", "image/png", 2_400_000);
const PDF = file("manual.pdf", "application/pdf");

const zone = (container: HTMLElement) => container.firstElementChild as HTMLElement;
const drop = (container: HTMLElement, files: File[]) =>
  fireEvent.drop(zone(container), { dataTransfer: { files, types: ["Files"] } });
const listed = () => within(screen.getByRole("list")).getAllByRole("listitem").map((item) => item.textContent);

describe("accepts - the HTML standard's rule for `accept`", () => {
  it("takes everything without a rule", () => {
    expect(accepts(PDF, undefined)).toBe(true);
    expect(accepts(PDF, "")).toBe(true);
  });

  it("matches an extension regardless of case, a MIME type, and a type's family", () => {
    expect(accepts(file("RECIPE.CSV"), ".csv")).toBe(true);
    expect(accepts(CSV, "text/csv")).toBe(true);
    expect(accepts(PNG, "image/*")).toBe(true);
    expect(accepts(PDF, "image/*")).toBe(false);
    expect(accepts(PDF, ".csv, image/*")).toBe(false);
    expect(accepts(PNG, ".csv, image/*")).toBe(true);
  });

  it("does not take a family for a type of its own name", () => {
    expect(accepts(file("x.bin", "imagery/x"), "image/*")).toBe(false);
  });
});

describe("FileInput", () => {
  it("is the native file input, named by its field", () => {
    render(
      <FormField label="Recipe file">
        <FileInput accept=".csv" />
      </FormField>,
    );
    const input = screen.getByLabelText("Recipe file") as HTMLInputElement;
    expect(input.type).toBe("file");
    expect(input.accept).toBe(".csv");
    expect(input.multiple).toBe(false);
  });

  it("is named by its key where no field names it, singular or plural", () => {
    const { container, rerender } = render(<FileInput />);
    expect(screen.getByLabelText("Choose a file")).toBeTruthy();
    expect(zone(container).textContent).toContain("or drop it here");
    rerender(<FileInput multiple />);
    expect(screen.getByLabelText("Choose files")).toBeTruthy();
    expect(zone(container).textContent).toContain("or drop them here");
  });

  it("lists the chosen files with their size, and reports them", () => {
    const changed = vi.fn();
    render(<FileInput multiple onChange={changed} />);
    fireEvent.change(screen.getByLabelText("Choose files"), { target: { files: [CSV, PNG] } });
    expect(listed()).toEqual([expect.stringContaining("recipe-0412.csv"), expect.stringContaining("label.png")]);
    expect(listed()[0]).toContain("12 kB");
    expect(listed()[1]).toContain("2.4 MB");
    expect(changed).toHaveBeenCalledWith([CSV, PNG]);
  });

  it("takes files dropped on the zone, and only those it accepts", () => {
    const changed = vi.fn();
    const { container } = render(<FileInput multiple accept=".csv,image/*" onChange={changed} />);
    drop(container, [CSV, PDF, PNG]);
    expect(changed).toHaveBeenCalledWith([CSV, PNG]);
    expect(listed()).toHaveLength(2);
    expect(zone(container).textContent).toContain("manual.pdf is not an accepted type");
  });

  it("takes the first file of a drop where it takes one", () => {
    const changed = vi.fn();
    const { container } = render(<FileInput onChange={changed} />);
    drop(container, [CSV, PNG]);
    expect(changed).toHaveBeenCalledWith([CSV]);
  });

  it("marks the zone while files are dragged over it", () => {
    const { container } = render(<FileInput />);
    fireEvent.dragEnter(zone(container), { dataTransfer: { types: ["Files"] } });
    expect(zone(container).hasAttribute("data-dragging")).toBe(true);
    fireEvent.dragLeave(zone(container), { relatedTarget: document.body });
    expect(zone(container).hasAttribute("data-dragging")).toBe(false);
  });

  it("removes a listed file by its key", () => {
    const changed = vi.fn();
    render(<FileInput multiple onChange={changed} />);
    fireEvent.change(screen.getByLabelText("Choose files"), { target: { files: [CSV, PNG] } });
    fireEvent.click(screen.getByRole("button", { name: "Remove recipe-0412.csv" }));
    expect(changed).toHaveBeenLastCalledWith([PNG]);
    expect(listed()).toEqual([expect.stringContaining("label.png")]);
  });

  it("controlled: shows the caller's files and waits until they follow", () => {
    function Controlled() {
      const [files, setFiles] = useState<File[]>([CSV]);
      return (
        <>
          <FileInput aria-label="Held" value={[PDF]} onChange={() => undefined} />
          <FileInput aria-label="Following" value={files} onChange={setFiles} multiple />
        </>
      );
    }
    render(<Controlled />);
    fireEvent.change(screen.getByLabelText("Held"), { target: { files: [PNG] } });
    expect(screen.getByText("manual.pdf")).toBeTruthy();
    expect(screen.queryByText("label.png")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Remove recipe-0412.csv" }));
    expect(screen.queryByText("recipe-0412.csv")).toBeNull();
  });

  it("takes no drop and no removal while disabled", () => {
    const changed = vi.fn();
    const { container } = render(<FileInput disabled value={[CSV]} onChange={changed} />);
    drop(container, [PNG]);
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Remove recipe-0412.csv" })).toHaveProperty("disabled", true);
  });

  /* Not preventing the drop would let the browser open the file in place of
     the page - a disabled zone still catches it, and keeps nothing. */
  it("catches a drop while disabled, so the browser does not open the file", () => {
    const { container } = render(<FileInput disabled />);
    const carried = { dataTransfer: { files: [PNG], types: ["Files"] } };
    expect(fireEvent.dragOver(zone(container), carried)).toBe(false);
    expect(fireEvent.drop(zone(container), carried)).toBe(false);
    expect(zone(container).hasAttribute("data-dragging")).toBe(false);
  });

  /* Space and Enter open the platform's dialog on a focused file input. jsdom
     has no dialog, so what is asserted is that nothing of ours stands between
     the key and the native control; the dialog itself opens in the browser
     suite. */
  it("leaves Space and Enter to the native control", () => {
    render(<FileInput />);
    const input = screen.getByLabelText("Choose a file");
    for (const key of [" ", "Enter"]) {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      input.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
  });

  it("says invalid to a screen reader, from the form field", () => {
    render(
      <FormField label="Attachment" error="A CSV file is required">
        <FileInput />
      </FormField>,
    );
    const input = screen.getByLabelText("Attachment");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("speaks German under the German wording", () => {
    const { container } = render(
      <LanguageProvider wording={GERMAN_WORDING}>
        <FileInput multiple accept=".csv" />
      </LanguageProvider>,
    );
    expect(screen.getByLabelText("Dateien auswählen")).toBeTruthy();
    drop(container, [CSV, PDF]);
    expect(screen.getByRole("button", { name: "recipe-0412.csv entfernen" })).toBeTruthy();
    expect(zone(container).textContent).toContain("manual.pdf ist kein zugelassener Dateityp");
  });
});
