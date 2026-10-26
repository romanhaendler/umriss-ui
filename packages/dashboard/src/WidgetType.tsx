import type { ReactNode } from "react";
import { FormField, Input, useWording } from "@umriss-ui/core";
import type { Wording } from "@umriss-ui/core";
import type { SizeSpan, WidgetSize } from "./model";

/** What a widget's content is told. */
export interface WidgetContent<Options> {
  /** The size the widget stands at. */
  size: WidgetSize;
  /** The widget's options. */
  options: Options;
}

/** What a type's form is given. */
export interface WidgetFormProps<Options> {
  /** The widget's current options. */
  options: Options;
  /** Replaces the options; one step of the draft. */
  change: (options: Options) => void;
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
  /** The options a new widget starts with, and the ones a stored widget's missing keys are read from: stored plain options are spread over them, one level deep. Their type is the options type of `title` and of the content. */
  defaultOptions: Options;
  /** The title of a frame as a function of its options; the `label` without it. */
  title?: (options: NoInfer<Options>) => string;
  /** The form for the options, opened from the widget's menu. Without it the menu has no options entry. */
  form?: (props: WidgetFormProps<NoInfer<Options>>) => ReactNode;
  /** The content, as a function of the size and the options. */
  children: (content: WidgetContent<NoInfer<Options>>) => ReactNode;
}

/** Declares one widget type inside a `Dashboard`. It draws nothing itself: the
    dashboard reads its props. The options type is inferred from `defaultOptions`. */
export function WidgetType<Options>(props: WidgetTypeProps<Options>): null {
  void props;
  return null;
}

/** The options of the heading widget type. */
export interface HeadingOptions {
  /** The title across the full width. */
  text: string;
}

/** The built-in heading widget type, to put inside `Dashboard` when the
    application wants readers to divide their dashboard: one size, `full`, one
    row, its text as its options, drawn as a title without a card. */
export function HeadingType(): null {
  return null;
}

/** The name the heading type goes by in a view. */
export const HEADING_NAME = "heading";

/** The title of a widget's frame: its type's `title` of the options, else the label. */
export const titleOf = (type: Pick<WidgetTypeProps<unknown>, "title" | "label">, options: unknown): string => type.title?.(options) ?? type.label;

function HeadingForm({ options, change }: WidgetFormProps<HeadingOptions>) {
  const wording = useWording();
  return (
    <FormField label={wording.dashboardHeadingField}>
      <Input value={options.text} onChange={(event) => change({ text: event.target.value })} />
    </FormField>
  );
}

/** What the dashboard reads the heading type as, worded as the reader reads. */
export function headingTypeOf(wording: Wording): WidgetTypeProps<HeadingOptions> {
  return {
    name: HEADING_NAME,
    label: wording.dashboardHeadingLabel,
    sentence: wording.dashboardHeadingSentence,
    sizes: { full: { columns: 12, rows: 1 } },
    start: "full",
    defaultOptions: { text: wording.dashboardHeadingText },
    title: (options) => options.text || wording.dashboardHeadingLabel,
    form: HeadingForm,
    children: () => null,
  };
}
