import { Card, CardBody, FormField, Grid, Input, Select, Stack, Textarea } from "../../../src";

export const title = "A field fills its place";
export const lead =
  "Say nothing about width, and a field fills the place it is given - the card's column, a grid's cell. The form below has no width in it but the card's.";

export default function FillThePlace() {
  return (
    <Card style={{ maxWidth: 560 }}>
      <CardBody>
        <Stack gap={4}>
          <Grid columns={2} gap={4}>
            <FormField label="First name">
              <Input autoComplete="given-name" />
            </FormField>
            <FormField label="Last name">
              <Input autoComplete="family-name" />
            </FormField>
          </Grid>
          <FormField label="Delivery service">
            <Select defaultValue="standard">
              <option value="standard">Standard, two to three working days</option>
              <option value="express">Express, next working day before noon</option>
            </Select>
          </FormField>
          <FormField label="Note for the driver" hint="Where the parcel may be left if nobody is home.">
            <Textarea rows={2} />
          </FormField>
        </Stack>
      </CardBody>
    </Card>
  );
}
