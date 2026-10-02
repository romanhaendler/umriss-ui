# 09 — The slider's readout far from its track

Status: needs-info
Type: decision

Left open at the acceptance of control-sizes (05, 2 Oct 2026); older than it.

The slider's value readout keeps `min-width: 6ch`, so a two-digit value stands
with four characters of room before it, far from the track - most visible in a
toolbar, where the slider is its natural width (16 characters). The readout
cannot move the slider's width any more (it is contained), so its room could
follow the longest value the slider can show (`max` formatted) instead of a
fixed six.

The question for the user: take it on now, and which way?
