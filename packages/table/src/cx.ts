import styles from "./Table.module.css";

/* Joins class names. Our own two lines instead of an export from
   @umriss-ui/core: a surface does not grow wider for a one-liner. */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(" ");

/* The class that puts a cell on its column's side; start is the cell's own. */
export const sideClass = (side: "start" | "center" | "end"): string | false =>
  side === "end" ? styles.alignEnd! : side === "center" && styles.alignCenter!;
