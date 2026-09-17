/* Which role a message carries - in one place.

   The table stood in `Alert`, and the toast had an answer of its own: a
   `status` region for every tone. An error thereby meant two different things
   to a screen reader on two surfaces (library-audit 03). Both now read this.

   Only the two urgent tones interrupt. `alert` reads out immediately and cuts
   off whatever is being read - which is impolite for a success message and
   right for an error.

   Internal. */

/** The five tones of a message. `Toast` uses four of them. */
type Ton = "neutral" | "accent" | "success" | "warning" | "danger";

export const roleFromTone: Readonly<Record<Ton, { role: "alert" | "status"; live?: "polite" }>> = {
  neutral: { role: "status", live: "polite" },
  accent: { role: "status", live: "polite" },
  success: { role: "status", live: "polite" },
  warning: { role: "alert" },
  danger: { role: "alert" },
};
