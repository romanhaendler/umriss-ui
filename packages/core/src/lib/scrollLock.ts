/* The page's scroll is locked while any dialog stands: a count, so a nested
   dialog's closing does not free the page under the outer one. The browser
   locks nothing itself; the scrollbar's width is made up in padding so the
   page does not jump - unless the root holds a stable scrollbar gutter, which
   already keeps that width. */
let scrollLocks = 0;
let scrollRestore: (() => void) | null = null;

export function lockScroll(): void {
  if (scrollLocks++ > 0) return;
  const root = document.documentElement;
  const { overflow, paddingRight } = root.style;
  const computed = getComputedStyle(root);
  const bar = window.innerWidth - root.clientWidth;
  const gutter = computed.getPropertyValue("scrollbar-gutter").includes("stable");
  root.style.overflow = "hidden";
  if (bar > 0 && !gutter) root.style.paddingRight = `calc(${computed.paddingRight} + ${bar}px)`;
  scrollRestore = () => {
    root.style.overflow = overflow;
    root.style.paddingRight = paddingRight;
  };
}

export function unlockScroll(): void {
  if (--scrollLocks > 0) return;
  scrollLocks = 0;
  scrollRestore?.();
  scrollRestore = null;
}
