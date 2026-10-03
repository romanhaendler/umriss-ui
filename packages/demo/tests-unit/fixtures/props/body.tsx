/* Fixture for the props reader: components that take their props whole and
   unpack them in the body, as the charts do - and two private interfaces of
   the same name, one here and one in `bodyTwin.tsx`. Never rendered and never
   executed. */

/* Private, and named like the one in `bodyTwin.tsx`: each table takes its own. */
interface CommonProps {
  /** Which axis the mark binds to. */
  axisId?: string;
}

export interface FixtureMarkProps extends CommonProps {
  /** How wide the stroke is. */
  strokeWidth?: number;
  /** Space around the mark.
      @default 8 */
  padding?: number;
  /** Whether the zone lines are drawn. */
  zoneLines?: boolean;
  /** Space between two marks - the tag names the constant's value.
      @default 4 */
  gap?: number;
}

const DEFAULT_GAP = 4;

export function FixtureMark(props: FixtureMarkProps) {
  const { axisId = "x", strokeWidth = 1.5, padding = 8, zoneLines = true, gap = DEFAULT_GAP } = props;
  return { axisId, strokeWidth, padding, zoneLines, gap };
}

export interface FixtureBodyConflictProps {
  /** Space around the mark.
      @default 4 */
  padding?: number;
}

export function FixtureBodyConflict(props: FixtureBodyConflictProps) {
  const { padding = 8 } = props;
  return padding;
}
