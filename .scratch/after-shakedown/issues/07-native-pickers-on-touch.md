# Native pickers on touch, and the DatePicker's year jump and typed entry

Type:       grilling
Status:     open
Blocked by: 06

## Question

Which pickers hand over to the native control on touch, and what does the library's own DatePicker gain
for everyone else?

`.scratch/shakedown/mobile-native.md` proposes, touch only, desktop unchanged: DatePicker to `type="date"`,
DateTimePicker and DateTimeRangePicker to `datetime-local`; DateRangePicker "needs a design"; every other
component keeps its own UI. Each handover loses formats, wording, presets, Today/Clear, seconds, Now/Apply,
and turns the value into a string that must become a local-midnight `Date`.

- Hand over (which ones, triggered by the touch signal "A touch size for the controls" chose), or keep the
  library's pickers and fix them on touch instead.
- DateRangePicker: two native dates, or a year jump in the library.
- The year/month jump and typed entry in the DatePicker, wished by five personas, the keyboard persona among
  them (`core.md` E, `accessibility.md`) - needed on desktop whatever happens on touch.
- The two touch breaks that are not a handover: NumberInput without a minus key on iOS (`mobile-native.md`
  2), the time fields dropping digits in WebKit (3), MultiSelect's autofocus (8).
