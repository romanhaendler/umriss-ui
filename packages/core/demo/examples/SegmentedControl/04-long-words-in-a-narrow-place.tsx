import { FormField, SegmentedControl } from "../../../src";

export const title = "Long words in a narrow place";
export const lead =
  "The control is as wide as its words and never wider than its place: on a phone, words that do not fit end in an ellipsis. Short words are the form's strength - past three or four of them, a Select is the better choice.";

export default function LongWordsInANarrowPlace() {
  return (
    <FormField label="Readings">
      <SegmentedControl
        defaultValue="raw"
        options={[
          { value: "raw", label: "Raw readings from the sensors" },
          { value: "cleaned", label: "Cleaned and validated readings" },
        ]}
      />
    </FormField>
  );
}
