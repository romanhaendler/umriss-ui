# Coverage diff: @umriss-ui/core 0.51.0 against MUI, Mantine, Radix Primitives

From core's API.md (the exports) and knowledge of the three libraries' component lists (not fetched).
Verdict per gap: **wished** (a screen of P9's reached for it or an everyday app will), **not needed**
(no everyday screen needs it; a recipe or the platform does), **never** (ADR-0032/0060/0064 or a design
stance). Table = `@umriss-ui/table` covers it.

## Covered by core (no gap)

Accordion, Alert, Badge, Breadcrumb, Button, ButtonGroup, SplitButton, IconButton, Card, Checkbox, Combobox
(also async), CommandPalette (Mantine Spotlight), ConfirmDialog, ContextMenu, DatePicker/Range/DateTime,
Divider, Drawer, EmptyState, FileInput (drop zone), FormField, Grid, Stack, Heading/Text, Input, Link,
Menu, Modal, MultiSelect (Mantine MultiSelect), NumberInput, Popover, ProgressBar, RadioGroup,
SegmentedControl, Select, Skeleton, Slider (single), Spinner, Splitter, Stepper, Switch, Tabs, Tag/TagGroup
(Mantine Pill/Chip, partly), Textarea, Toast, Tooltip, TreeView, VisuallyHidden, Meter, Stat, Sparkline.

## Gaps

| Component (where) | MUI | Mantine | Radix | Verdict | Note from P9's screens |
|---|---|---|---|---|---|
| Password input with reveal | - | PasswordInput | - | **wished** | login: 12 lines (docs now carry the recipe: Input + IconButton) |
| Input adornments (left/right section) | InputAdornment | leftSection/rightSection | - | **wished** | search, password, unit; NumberInput has prefix/suffix, Input has none |
| Icon set (eye, search, user, bell, upload) | @mui/icons | (tabler) | Radix Icons | **wished** | core ships 11 glyphs it uses itself; every screen drew inline SVG |
| Pagination (in core) | Pagination | Pagination | - | **wished** | search: 14 lines + Prev/Next; exists in table only, not usable on a list |
| Avatar / AvatarGroup | Avatar | Avatar | Avatar | **wished** | profile, shell, user list: initials circle, 8 lines |
| AppShell / Header / Navbar / NavLink | AppBar, Drawer variants | AppShell, NavLink | NavigationMenu | **wished** | shell: header + Drawer + palette by hand, 30 lines; no active-item style |
| Bottom navigation / mobile tab bar | BottomNavigation | - | - | not needed | Tabs at the bottom works with CSS |
| List / ListItem / row with actions | List, ListItem | List, NavLink | - | **wished** | notifications: row + Badge + Menu, 20 lines |
| Notification centre / inbox | - | Notification | - | not needed | Toast + a list covers it |
| Stepper with clickable steps, content panels | Stepper (StepButton) | Stepper | - | **wished** | wizard: Stepper is display only; no `onStepClick`, no focus move to the step |
| FileInput per-file progress/status | - | Dropzone (+ lib) | - | **wished** | upload: own ProgressBar rows 12 lines |
| Image / ImageGallery | - | Image | AspectRatio | not needed | `<img>` |
| Table (core only) | Table, DataGrid | Table | - | Table | package covers it, 200 users in 25 lines |
| DataGrid full (range select, paste) | DataGrid Pro | - | - | never | ADR-0032 / table matrix |
| Autocomplete (free text + suggestions) | Autocomplete | Autocomplete | - | not needed | Combobox is select-only; free text needs a recipe |
| TagsInput (type and Enter makes a tag) | Autocomplete multiple freeSolo | TagsInput | - | **wished** | profile skills: Tag + Input glued by hand |
| ColorPicker / ColorInput | - | ColorPicker | - | not needed | `<input type=color>` |
| Rating | Rating | Rating | - | not needed | |
| Pin input / OTP | - | PinInput | OneTimePasswordField | **wished** | login 2FA, very common |
| Time picker (time only) | TimePicker | TimeInput | - | **wished** | only DateTimePicker; no time-only field |
| Month / Year picker | DateCalendar views | MonthPicker, YearPicker | - | not needed | the calendar's selects jump |
| Calendar (inline, always visible) | DateCalendar | Calendar | - | not needed | |
| Typed date entry | DateField | DateInput | - | **wished** | DatePicker is a button; no typing a date (still open) |
| Range slider (two thumbs) | Slider range | RangeSlider | Slider | **wished** | filters (price) |
| Toggle / ToggleButton group | ToggleButton | - | Toggle, ToggleGroup | not needed | SegmentedControl, IconButton aria-pressed |
| Toolbar (action bar) | - | - | Toolbar | not needed | ButtonGroup |
| Radio card / Chip.Group | - | Chip, Radio.Card | - | not needed | |
| Transfer list | TransferList (lab) | TransferList | - | not needed | |
| Timeline | Timeline (lab) | Timeline | - | not needed | |
| Tour / spotlight onboarding | - | - | - | not needed | |
| Snackbar variants / Notifications system | Snackbar | Notifications | Toast | covered | Toast |
| Hover card | - | HoverCard | HoverCard | not needed | Popover/Tooltip |
| Scroll area | - | ScrollArea | ScrollArea | not needed | native scrollbars |
| Collapsible (one section) | Collapse | Collapse | Collapsible | not needed | Accordion/Card collapsible |
| Overlay / Backdrop / LoadingOverlay | Backdrop | LoadingOverlay | - | not needed | Spinner + absolute box |
| Pagination "load more" / infinite scroll | - | - | - | not needed | table matrix, decided |
| Carousel | - | Carousel | - | never | ADR-0032 |
| Rich text editor | - | RichTextEditor | - | never | ADR-0032 |
| Form state / validation (useForm) | - | @mantine/form | Form | never | ADR-0060; Instead holds (20 lines), but error summary + focus are not shipped |
| Responsive hooks (useMediaQuery, breakpoints) | useMediaQuery | use-media-query | - | **wished** | shell at 375: toolbars collapse by hand; none in core |
| Hooks: useDisclosure, useClipboard, useDebouncedValue | - | @mantine/hooks | - | **wished** | search: debounce 6 lines, copy button 8 lines |
| Theme object / dark mode manager | ThemeProvider | MantineProvider, useMantineColorScheme | Themes | **wished** | dark = `color-scheme` by hand; library holds no theme (documented) |
| Layout: Container, Flex, Center, AspectRatio, Paper | Container, Box | Container, Center, Flex, Paper | AspectRatio | not needed | Stack/Grid + CSS |
| Typography: Title, Blockquote, Code, Kbd, Mark | Typography | Code, Kbd, Mark | Text | **wished** | Kbd for the palette hint (⌘K) |
| Floating action button | Fab | - | - | not needed | |
| Speed dial | SpeedDial | - | - | not needed | |
| Chip (filter pill, selectable) | Chip | Chip | - | **wished** | filter bars on lists |
| Loading button with progress text | LoadingButton | Button loading | - | covered | exists, but focus is lost (finding) |
| Breadcrumb collapse | Breadcrumbs | Breadcrumbs | - | covered | folds into a menu |
| Menu bar / NavigationMenu | MenuList | NavLink | Menubar, NavigationMenu | not needed | |
| Alert dialog (confirm) | Dialog | Modal | AlertDialog | covered | ConfirmDialog |
| Visually hidden / portal / focus scope / direction | Portal | Portal | VisuallyHidden, Portal, FocusScope, DirectionProvider | partly | VisuallyHidden, portal target; RTL never (ADR-0032) |
| Label / Separator / Progress / Slot primitives | - | - | Label, Separator, Progress, Slot | covered / not needed | headless Slot/asChild is not offered; styled-only by design |
| Headless (unstyled) parts | - | - | all | never | ADR-0045 |

## Ranked wishes (what stands between core and "a complete app kit")

1. Input end/start adornments plus PasswordInput (login, search, units, clear/copy) - cheap, every app.
2. Avatar, and a List / ListItem row (notifications, user menus, comments).
3. AppShell pieces: header, collapsing navbar (Drawer at 375), NavLink with active state, plus `useMediaQuery`.
4. Pagination in core (table already has one; a list or search page cannot reuse it).
5. Icon set: the glyphs core draws are not exported as a usable set (eye, search, bell, user, upload, trash).
6. Clickable, content-bearing Stepper (focus to the new step, `onStepClick`).
7. Time-only picker, typed date entry, range Slider, PinInput, TagsInput, Chip.
8. FileInput per-file state (progress, error, retry).
9. Form helpers that ADR-0060 leaves out but the Instead needs: an error summary with focus links, Checkbox `invalid`.
