/* Fixture: the package the examples of `shownIn.test.ts` import. Never
   rendered; what matters is which declaration each use resolves to. */

import type { ReactNode } from "react";

/** What every instrument takes. */
export interface BaseProps {
  /** An id, declared once and inherited by two tables. */
  id?: string;
}

/** The props of a dial. */
export interface DialProps extends BaseProps {
  /** The value the needle points at. */
  value: number;
  /** Red or not. */
  tone?: "neutral" | "alarm";
  /** Half size. */
  size?: "sm" | "md";
  /** A label - set only through a spread of a loose object. */
  label?: string;
  /** Its unit - set only by a configurator. */
  unit?: string;
}

/** A dial. */
export function Dial(props: DialProps): null {
  void props;
  return null;
}

/** The props of a slider. */
export interface SliderProps extends BaseProps {
  /** Shares its name with the dial's - and nothing else. */
  value?: number;
  /** One step. */
  step?: number;
}

/** A slider. */
export function Slider(props: SliderProps): null {
  void props;
  return null;
}

/** The props of a panel. */
export interface PanelProps {
  /** What the panel holds. */
  children?: ReactNode;
  /** Its heading. */
  heading?: string;
  /** A frame around it - set only by a configurator. */
  framed?: boolean;
  /** Marks along its edge. */
  marks?: readonly PanelMark[];
}

/** A mark on a panel's edge. */
export interface PanelMark {
  /** Where it stands. */
  at: number;
  /** What it says. */
  note?: string;
}

/** A panel. */
export function Panel(props: PanelProps): null {
  void props;
  return null;
}

/** What a meter is set up with. */
export interface MeterOptions {
  /** The unit read out. */
  unit: string;
  /** How many readings are kept. */
  keep?: number;
}

/** What a meter hands back. */
export interface MeterHandle {
  /** The latest reading. */
  latest: number;
  /** Forgets every reading. */
  reset: () => void;
}

/** A meter. */
export function useMeter(options: MeterOptions): MeterHandle {
  void options;
  return { latest: 0, reset: () => {} };
}
