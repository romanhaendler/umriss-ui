import { Card, CardBody, Grid, Stack, Text } from "../../../src";

export const title = "Grid: fixed columns or growing along";

/* Two modes of operation, and `minItemWidth` beats `columns`. A fixed number of
   columns is a statement about the layout; a minimum width is one about the
   content - as many columns as are readable at this width. For data-dense forms
   the second is almost always what is meant.

   `Stack` and `Grid` stand on one page because they are one idea: layout out of
   tokens instead of out of numbers. Separately, each page would only make sense
   beside the other. */
function Field({ children }: { children: string }) {
  return (
    <Card>
      <CardBody>
        <Text size="sm">{children}</Text>
      </CardBody>
    </Card>
  );
}

export default function GridExample() {
  return (
    <Stack gap={4}>
      <Text size="xs" tone="muted">
        columns={3}
      </Text>
      <Grid columns={3} gap={3}>
        <Field>One</Field>
        <Field>Two</Field>
        <Field>Three</Field>
      </Grid>
      <Text size="xs" tone="muted">
        minItemWidth=&quot;220px&quot; - the number of columns follows the width
      </Text>
      <Grid minItemWidth="220px" gap={3}>
        <Field>Utilisation</Field>
        <Field>Scrap</Field>
        <Field>Unit count</Field>
        <Field>Downtime</Field>
      </Grid>
    </Stack>
  );
}
