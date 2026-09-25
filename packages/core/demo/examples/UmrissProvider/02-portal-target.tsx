import { useRef } from "react";
import { Button, Card, CardBody, CardHeader, Menu, MenuItem, Text, UmrissProvider } from "../../../src";

export const title = "Open overlays inside a full-screen panel";
export const lead = "A full-screen element hides everything outside it, overlays included; point `portalTarget` at the element so menus and tooltips open inside it.";

export default function PortalTarget() {
  const panel = useRef<HTMLDivElement>(null);

  return (
    <div ref={panel} style={{ background: "var(--u-color-bg)" }}>
      {/* A function, because the element exists only after the first render. */}
      <UmrissProvider portalTarget={() => panel.current}>
        <Card>
          <CardHeader
            eyebrow="Sprint 14"
            title="Web team board"
            actions={
              <>
                <Button size="sm" onClick={() => void panel.current?.requestFullscreen?.()}>
                  Full screen
                </Button>
                <Menu trigger={<Button size="sm">Move card</Button>}>
                  <MenuItem onSelect={() => {}}>To review</MenuItem>
                  <MenuItem onSelect={() => {}}>To done</MenuItem>
                  <MenuItem onSelect={() => {}}>Back to the backlog</MenuItem>
                </Menu>
              </>
            }
          />
          <CardBody>
            <Text size="sm" tone="secondary">
              Checkout flow redesign · Chloe Durand · 5 points
            </Text>
          </CardBody>
        </Card>
      </UmrissProvider>
    </div>
  );
}
