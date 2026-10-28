import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { firstTabStop } from "../src/lib/firstTabStop";

function panel(html: string): HTMLElement {
  const el = document.createElement("div");
  el.innerHTML = html;
  document.body.append(el);
  return el;
}

/* jsdom has no layout: checkVisibility is stubbed to the part of it the cases
   need, display: none on the element or an ancestor. */
beforeEach(() => {
  HTMLElement.prototype.checkVisibility = function (this: HTMLElement) {
    return !this.closest<HTMLElement>("[style*='display:none'], [style*='display: none']");
  };
});

afterEach(() => {
  document.body.innerHTML = "";
  delete (HTMLElement.prototype as Partial<HTMLElement>).checkVisibility;
});

describe("firstTabStop", () => {
  it("is the chosen radio of a group, not the first", () => {
    const p = panel(
      `<input type="radio" name="a" id="r1"><input type="radio" name="a" id="r2"><input type="radio" name="a" id="r3" checked>`,
    );
    expect(firstTabStop(p)?.id).toBe("r3");
  });

  it("is the first enabled radio of a group with none chosen", () => {
    const p = panel(
      `<input type="radio" name="a" id="r1" disabled><input type="radio" name="a" id="r2"><input type="radio" name="a" id="r3">`,
    );
    expect(firstTabStop(p)?.id).toBe("r2");
  });

  it("lets each of two groups stand for itself and skips the rest of a group", () => {
    const p = panel(
      `<input type="radio" name="a" id="a1"><input type="radio" name="a" id="a2" checked>
       <input type="radio" name="b" id="b1" checked><button id="btn">x</button>`,
    );
    expect(firstTabStop(p)?.id).toBe("a2");
    p.querySelector("#a2")?.setAttribute("disabled", "");
    p.querySelector("#a1")?.setAttribute("disabled", "");
    expect(firstTabStop(p)?.id).toBe("b1");
  });

  it("is the tab stop of a roving composite, not its first item", () => {
    const p = panel(
      `<div role="tablist"><button role="tab" tabindex="-1" id="t1"></button><button role="tab" tabindex="0" id="t2"></button></div>`,
    );
    expect(firstTabStop(p)?.id).toBe("t2");
  });

  it("skips a hidden first button", () => {
    const p = panel(`<button id="h" style="display:none"></button><button id="v"></button>`);
    expect(firstTabStop(p)?.id).toBe("v");
  });

  it("skips an inert subtree", () => {
    const p = panel(`<div inert><button id="h"></button></div><button id="v"></button>`);
    expect(firstTabStop(p)?.id).toBe("v");
  });

  it("is null for an empty panel", () => {
    expect(firstTabStop(panel(`<p>text</p>`))).toBeNull();
  });
});
