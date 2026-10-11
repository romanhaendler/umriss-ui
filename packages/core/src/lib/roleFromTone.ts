/* Which role a message carries - in one place.

   Alert and the toast read this one answer, so an error means the same thing
   to a screen reader on both surfaces.

   Only the two urgent tones interrupt. `alert` reads out immediately and cuts
   off whatever is being read - which is impolite for a success message and
   right for an error.

   Internal. */

/** The tones of a message. `Toast` has no `accent` and a `loading` of its own:
    a toast still at work, which reports politely. */
type Tone = "neutral" | "accent" | "success" | "warning" | "danger" | "loading";

export const roleFromTone: Readonly<Record<Tone, { role: "alert" | "status"; live?: "polite" }>> = {
  neutral: { role: "status", live: "polite" },
  accent: { role: "status", live: "polite" },
  success: { role: "status", live: "polite" },
  warning: { role: "alert" },
  danger: { role: "alert" },
  loading: { role: "status", live: "polite" },
};
