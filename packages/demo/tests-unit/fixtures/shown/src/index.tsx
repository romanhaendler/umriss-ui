/* Fixture: the package the examples of `shownIn.test.ts` import. Never
   rendered; what matters is which declaration each use resolves to. */

import type { ReactNode } from "react";

export interface BaseProps {
  /** An id, declared once and inherited by two tables. */
  id?: string;
}

export interface DialProps extends BaseProps {
  /** The value the needle points at. */
  value: number;
  /** Red or not. */
  tone?: "neutral" | "alarm";
  /** Half size. */
  size?: "sm" | "md";
  /** A label - set only through a spread of a loose object. */
  label?: string;
}

export function Dial(props: DialProps): null {
  void props;
  return null;
}

export interface SliderProps extends BaseProps {
  /** Shares its name with the dial's - and nothing else. */
  value?: number;
  /** One step. */
  step?: number;
}

export function Slider(props: SliderProps): null {
  void props;
  return null;
}

export interface PanelProps {
  /** What the panel holds. */
  children?: ReactNode;
  /** Its heading. */
  heading?: string;
}

export function Panel(props: PanelProps): null {
  void props;
  return null;
}

export interface MeterOptions {
  /** The unit read out. */
  unit: string;
  /** How many readings are kept. */
  keep?: number;
}

export interface MeterHandle {
  /** The latest reading. */
  latest: number;
  /** Forgets every reading. */
  reset: () => void;
}

export function useMeter(options: MeterOptions): MeterHandle {
  void options;
  return { latest: 0, reset: () => {} };
}
