import type { CSSProperties } from "react";
import { Card, CardBody, CardHeader, Checkbox, Grid, Stack, Switch } from "../../../src";

export const title = "A token for one region";
export const lead =
  "A token is a custom property and cascades like one: set on a container, it holds for everything inside and nowhere else. The second card sets its own accent, with a light and a dark value.";

/* In an application this is one rule on the region's class:

     .billing {
       --u-color-accent: light-dark(#7a3e9d, #b98ad6);
     }                                                    */
const BILLING = { "--u-color-accent": "light-dark(#7a3e9d, #b98ad6)" } as CSSProperties;

function Settings({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardBody>
        <Stack gap={3}>
          <Switch label="Send a weekly summary" defaultChecked />
          <Checkbox label="Copy the account owner" defaultChecked />
        </Stack>
      </CardBody>
    </Card>
  );
}

export default function TokenForOneRegion() {
  return (
    <Grid columns={2} gap={4}>
      <Settings title="Notifications" />
      <div style={BILLING}>
        <Settings title="Billing" />
      </div>
    </Grid>
  );
}
