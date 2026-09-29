import { useState } from "react";
import { ButtonGroup, IconButton, Menu, MenuItem, MenuSeparator, MinusGlyph, PlusGlyph, Stack, Text } from "../../../src";

export const title = "Build a toolbar";
export const lead = "Plain buttons for the bar, a group for the pair that belongs together, a menu for the rest – every square the same size, every name a tooltip.";

const ZOOM = [50, 75, 100, 150, 200];

function Refresh() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true">
      <path d="M8.3 5.8A3.4 3.4 0 1 1 7.6 2.7M7.9 1.2v1.8H6.1" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Export() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true">
      <path d="M5 1.5v5M2.8 4.3 5 6.5l2.2-2.2M1.8 8.5h6.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Toolbar() {
  const [zoom, setZoom] = useState(2);

  return (
    <Stack direction="row" gap={3} align="center" justify="space-between" wrap style={{ maxWidth: 620 }}>
      <Text size="sm" weight="semibold">
        Tours, Tuesday 17 March
      </Text>
      <Stack direction="row" gap={2} align="center">
        <ButtonGroup aria-label="Zoom the tour plan">
          <IconButton size="sm" variant="secondary" aria-label="Zoom out" disabled={zoom === 0} onClick={() => setZoom(zoom - 1)}>
            <MinusGlyph />
          </IconButton>
          <IconButton size="sm" variant="secondary" aria-label="Zoom in" disabled={zoom === ZOOM.length - 1} onClick={() => setZoom(zoom + 1)}>
            <PlusGlyph />
          </IconButton>
        </ButtonGroup>
        <Text as="span" size="xs" mono tone="muted" style={{ width: "4ch" }}>
          {ZOOM[zoom]}%
        </Text>
        <IconButton size="sm" aria-label="Refresh the tours">
          <Refresh />
        </IconButton>
        <IconButton size="sm" aria-label="Export the tour list">
          <Export />
        </IconButton>
        <Menu
          align="end"
          trigger={
            <IconButton size="sm" aria-label="More actions for the tours">
              ⋯
            </IconButton>
          }
        >
          <MenuItem>Print the delivery notes</MenuItem>
          <MenuItem>Copy the link</MenuItem>
          <MenuSeparator />
          <MenuItem tone="danger">Cancel every open tour</MenuItem>
        </Menu>
      </Stack>
    </Stack>
  );
}
