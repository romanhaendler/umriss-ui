/* Fixture for the props reader: the twin of `body.tsx`'s private
   `CommonProps`, same name, other members. Never rendered and never executed. */

interface CommonProps {
  /** Where the limit stands. */
  value: number;
}

export interface FixtureLimitProps extends CommonProps {
  /** How grave crossing it is. */
  severity?: "warning" | "alarm";
}
