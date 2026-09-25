import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { AngleGlyph } from "../../lib/glyphs";
import { useWording } from "../../lib/language";
import { mergeRefs } from "../../lib/mergeRefs";
import { Menu, MenuItem } from "../Menu";
import { foldedCount } from "./fold";
import styles from "./Breadcrumb.module.css";

/** One level of the trail. */
export interface BreadcrumbEntry {
  /** The level's name, as the trail and the menu of folded levels show it. */
  label: ReactNode;
  /** The level's address. Alone, the browser follows it. */
  href?: string;
  /** Routing is the caller's: given, it runs instead of the browser's
      navigation - on the link and in the menu of folded levels. A level with
      `onSelect` and no `href` is a button. */
  onSelect?: () => void;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** The trail from the root to the current page; the last is the page. */
  items: readonly BreadcrumbEntry[];
}

const separator = <AngleGlyph size={8} className={styles.separator} />;

/* Where a page stands: plant, line, machine. A navigation landmark with an
   ordered list, and the last level says `aria-current="page"`. When the trail
   is wider than its place, the middle levels fold into a `Menu` behind one
   key - measured, not guessed: a hidden copy of the whole trail gives each
   level's width, and `foldedCount` decides. */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { items, className, ...rest },
  ref,
) {
  const wording = useWording();
  const navRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLOListElement>(null);
  const [folded, setFolded] = useState(0);

  const measure = useCallback(() => {
    const nav = navRef.current;
    const copy = measureRef.current;
    if (!nav || !copy) return;
    const levels = Array.from(copy.querySelectorAll<HTMLElement>("[data-measure-level]")).map((l) => l.offsetWidth);
    const more = copy.querySelector<HTMLElement>("[data-measure-more]")?.offsetWidth ?? 0;
    const gap = Number.parseFloat(getComputedStyle(copy).columnGap) || 0;
    setFolded(foldedCount(levels, more, gap, nav.clientWidth));
  }, []);

  /* After every commit - a changed trail changes the widths - and on every
     change of the place; it sets the count only when it changes. */
  useLayoutEffect(() => measure());

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(nav);
    return () => observer.disconnect();
  }, [measure]);

  const last = items.length - 1;
  const hidden = items.slice(1, 1 + folded);
  const follow = (item: BreadcrumbEntry) => {
    if (item.onSelect) item.onSelect();
    else if (item.href) window.location.assign(item.href);
  };

  const level = (item: BreadcrumbEntry, index: number) => {
    const current = index === last ? ("page" as const) : undefined;
    if (item.href !== undefined) {
      return (
        <a
          href={item.href}
          aria-current={current}
          className={cx(styles.link, current && styles.current)}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            if (!item.onSelect) return;
            event.preventDefault();
            item.onSelect();
          }}
        >
          {item.label}
        </a>
      );
    }
    if (item.onSelect && !current) {
      return (
        <button type="button" className={styles.link} onClick={item.onSelect}>
          {item.label}
        </button>
      );
    }
    return (
      <span aria-current={current} className={cx(styles.text, current && styles.current)}>
        {item.label}
      </span>
    );
  };

  return (
    <nav ref={mergeRefs(navRef, ref)} aria-label={wording.breadcrumb} className={cx(styles.breadcrumb, className)} {...rest}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          if (index > 0 && index <= folded) {
            if (index > 1) return null;
            return (
              <li key="more" className={styles.item}>
                <Menu
                  trigger={
                    <button type="button" className={styles.more} aria-label={wording.breadcrumbFolded}>
                      …
                    </button>
                  }
                >
                  {hidden.map((entry, i) => (
                    <MenuItem key={i} onSelect={() => follow(entry)}>
                      {entry.label}
                    </MenuItem>
                  ))}
                </Menu>
                {separator}
              </li>
            );
          }
          return (
            <li key={index} className={cx(styles.item, index === last && styles.lastItem)}>
              {level(item, index)}
              {index < last && separator}
            </li>
          );
        })}
      </ol>
      {/* The whole trail once more, invisible, for its widths: spans with the
          same type as the levels, and the menu's key. */}
      <ol ref={measureRef} className={cx(styles.list, styles.measure)} aria-hidden="true">
        {items.map((item, index) => (
          <li key={index} className={styles.item} data-measure-level="">
            <span className={cx(styles.text, index === last && styles.current)}>{item.label}</span>
            {index < last && separator}
          </li>
        ))}
        <li className={styles.item} data-measure-more="">
          <span className={styles.more}>…</span>
          {separator}
        </li>
      </ol>
    </nav>
  );
});
