import type { ReactNode } from "react";
import type { SizeSpan, WidgetSize } from "./model";

/** What a widget's content is told. */
export interface WidgetContent<Options> {
  /** The size the widget stands at. */
  size: WidgetSize;
  /** The widget's options. */
  options: Options;
}

/** The props of `WidgetType`. */
export interface WidgetTypeProps<Options> {
  /** The name a view refers to this type by. Unique within the dashboard. */
  name: string;
  /** The type's name for a reader, and the title of its frame unless `title` says otherwise. */
  label: string;
  /** One sentence on what the type shows. */
  sentence: string;
  /** The sizes the type offers, each with the columns (of twelve) and rows it takes. */
  sizes: Partial<Record<WidgetSize, SizeSpan>>;
  /** The size a new widget of this type starts at. One of `sizes`. */
  start: WidgetSize;
  /** The options a new widget starts with. Their type is the options type of `title` and of the content. */
  defaultOptions: Options;
  /** The title of a frame as a function of its options; the `label` without it. */
  title?: (options: NoInfer<Options>) => string;
  /** The content, as a function of the size and the options. */
  children: (content: WidgetContent<NoInfer<Options>>) => ReactNode;
}

/** Declares one widget type inside a `Dashboard`. It draws nothing itself: the
    dashboard reads its props. The options type is inferred from `defaultOptions`. */
export function WidgetType<Options>(props: WidgetTypeProps<Options>): null {
  void props;
  return null;
}
