import { useState } from "react";
import { Button, Menu, MenuItem } from "../../../src";

export const title = "Choose one entry, or switch one on";
export const lead = "Give an entry `role` set to `menuitemradio` for one of a group of which one is chosen, or `menuitemcheckbox` for one that is on or off, and say which is with `aria-checked`.";

const sizes = ["Small", "Medium", "Large"];

export default function AChoice() {
  const [size, setSize] = useState("Medium");
  const [grid, setGrid] = useState(true);

  return (
    <Menu trigger={<Button size="sm">View</Button>}>
      {sizes.map((one) => (
        <MenuItem key={one} role="menuitemradio" aria-checked={one === size} onSelect={() => setSize(one)}>
          <span aria-hidden="true">{one === size ? "✓ " : ""}</span>
          {one}
        </MenuItem>
      ))}
      <MenuItem role="menuitemcheckbox" aria-checked={grid} onSelect={() => setGrid(!grid)}>
        <span aria-hidden="true">{grid ? "✓ " : ""}</span>Show the grid
      </MenuItem>
    </Menu>
  );
}
