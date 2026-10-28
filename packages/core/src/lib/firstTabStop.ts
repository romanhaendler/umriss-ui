const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]';

function visible(el: HTMLElement): boolean {
  if (el.closest("[inert]")) return false;
  if (typeof el.checkVisibility === "function") {
    return el.checkVisibility({ visibilityProperty: true });
  }
  /* Without checkVisibility (an older engine) display: none on the element or an
     ancestor and the element's own visibility decide. */
  for (let n: HTMLElement | null = el; n; n = n.parentElement) {
    if (getComputedStyle(n).display === "none") return false;
  }
  return getComputedStyle(el).visibility !== "hidden";
}

/* The first element in document order that a Tab press would reach: focusable,
   tabIndex 0 or more (so a roving -1 is skipped), rendered, visible, not inert.
   A named radio stands for its group - the chosen one, else the first enabled;
   the group's other radios are skipped. Null when there is none. */
export function firstTabStop(container: HTMLElement): HTMLElement | null {
  const radios = (name: string, form: HTMLFormElement | null) =>
    [...container.querySelectorAll<HTMLInputElement>('input[type="radio"]')].filter(
      (r) => r.name === name && r.form === form && !r.disabled && visible(r),
    );
  for (const el of container.querySelectorAll<HTMLElement>(FOCUSABLE)) {
    if (el.tabIndex < 0 || !visible(el)) continue;
    if (el instanceof HTMLInputElement && el.type === "radio" && el.name) {
      const group = radios(el.name, el.form);
      const stop = group.find((r) => r.checked) ?? group[0];
      if (stop === el) return el;
      continue;
    }
    return el;
  }
  return null;
}
