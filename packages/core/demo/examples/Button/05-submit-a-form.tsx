import { useState } from "react";
import type { FormEvent } from "react";
import { Button, FormField, Input, Stack } from "../../../src";

export const title = "Submit a form";
export const lead = "A button is `type=\"button\"` unless you say otherwise; set `type=\"submit\"` on the one that sends the form, so Enter in a field sends it too.";

export default function SubmitAForm() {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    window.setTimeout(() => setSaving(false), 1200);
  };

  return (
    <form onSubmit={submit}>
      <Stack direction="row" gap={3} align="flex-end" wrap>
        <FormField label="Project name">
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </FormField>
        <Button type="submit" variant="primary" loading={saving} disabled={name.trim() === ""}>
          Create project
        </Button>
      </Stack>
    </form>
  );
}
