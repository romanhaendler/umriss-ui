import { useState } from "react";
import type { FormEvent } from "react";
import { Button, FormField, Grid, Input, Stack, Text } from "../../../src";

export const title = "Take a delivery address";
export const lead = "Check the fields on submit and hand each message to its `FormField`; until then the fields stay uncontrolled.";

interface Errors {
  name?: string;
  street?: string;
  postcode?: string;
}

function check(data: FormData): Errors {
  const errors: Errors = {};
  if (String(data.get("name")).trim() === "") errors.name = "Name the consignee.";
  if (String(data.get("street")).trim() === "") errors.street = "Give a street and number.";
  if (!/^\d{5}$/.test(String(data.get("postcode")))) errors.postcode = "A postcode here has five digits.";
  return errors;
}

export default function TakeADeliveryAddress() {
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = check(new FormData(event.currentTarget));
    setErrors(next);
    setSaved(Object.keys(next).length === 0);
  };

  return (
    <form onSubmit={submit} noValidate style={{ maxWidth: 520 }}>
      <Stack gap={4}>
        <FormField label="Consignee" required error={errors.name}>
          <Input name="name" autoComplete="organization" defaultValue="Oakridge Pharmacy" />
        </FormField>
        <FormField label="Street" required error={errors.street}>
          <Input name="street" autoComplete="street-address" />
        </FormField>
        <Grid minItemWidth="160px" gap={4}>
          <FormField label="Postcode" required error={errors.postcode}>
            <Input name="postcode" numeric autoComplete="postal-code" defaultValue="204" />
          </FormField>
          <FormField label="Town">
            <Input name="town" autoComplete="address-level2" defaultValue="Ferrow" />
          </FormField>
        </Grid>
        <Stack direction="row" gap={3} align="center">
          <Button type="submit" variant="primary" size="sm">
            Save address
          </Button>
          {saved && (
            <Text size="sm" tone="muted">
              Saved to shipment 100829.
            </Text>
          )}
        </Stack>
      </Stack>
    </form>
  );
}
