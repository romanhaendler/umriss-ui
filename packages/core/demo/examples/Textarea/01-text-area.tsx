import { FormField, Textarea } from "../../../src";

export const title = "Text area";
export const lead = "Set `rows` for the height the text usually needs; the user can drag it taller.";

export default function TextArea() {
  return (
    <FormField label="Incident summary" style={{ maxWidth: 480 }}>
      <Textarea rows={3} placeholder="What happened, what customers saw, what is being done" />
    </FormField>
  );
}
