/**
 * @dashforge/tw
 *
 * Tailwind-rendered UI components for the Dashforge ecosystem.
 *
 * Architectural contract (plan v2 — 2026-05-15):
 *  - **Props-driven**: each Tailwind utility that matters for the public
 *    API becomes a typed prop. `sx` + `slotProps` are escape hatches.
 *  - **Tokens as source of truth**: components reference colors /
 *    spacing / radius / fontSize through `@dashforge/tw-tokens` via the
 *    `dashforgePreset()` from `@dashforge/tw-theme`.
 *  - **Shared bridge with MUI side**: both ecosystems consume
 *    `@dashforge/forms` + `@dashforge/ui-core` + `@dashforge/rbac`.
 *    No styling code is shared.
 *  - **Variant API**: `tailwind-variants` (TV) with `slots` +
 *    `compoundVariants`.
 *
 * F3 surface (tier-1, this release):
 *  - `<Button>` (action, RBAC only, `asChild` polymorphism)
 *  - `<TextField>` (bridge-integrated, 7 slots)
 *  - `<Checkbox>` (bridge-integrated, Radix Checkbox primitive)
 *  - `<Switch>` (bridge-integrated, Radix Switch primitive)
 *
 * @module @dashforge/tw
 */

// ───── Components ─────
export { Button } from './components/Button/Button.js';
export type {
  ButtonProps,
  ButtonVariantProps,
} from './components/Button/button.types.js';
export { buttonVariants } from './components/Button/button.variants.js';

export { TextField } from './components/TextField/TextField.js';
export type {
  TextFieldProps,
  TextFieldVariantProps,
  TextFieldSlotProps,
} from './components/TextField/textField.types.js';
export { textFieldVariants } from './components/TextField/textField.variants.js';

export { Checkbox } from './components/Checkbox/Checkbox.js';
export type {
  CheckboxProps,
  CheckboxSlotProps,
  CheckboxVariantProps,
} from './components/Checkbox/checkbox.types.js';
export { checkboxVariants } from './components/Checkbox/checkbox.variants.js';

export { Switch } from './components/Switch/Switch.js';
export type {
  SwitchProps,
  SwitchSlotProps,
  SwitchVariantProps,
} from './components/Switch/switch.types.js';
export { switchVariants } from './components/Switch/switch.variants.js';

// F4 tier-2: bridge-integrated multi-choice + multi-line input

export { RadioGroup } from './components/RadioGroup/RadioGroup.js';
export type {
  RadioGroupProps,
  RadioGroupOption,
  RadioGroupSlotProps,
  RadioGroupVariantProps,
} from './components/RadioGroup/radioGroup.types.js';
export { radioGroupVariants } from './components/RadioGroup/radioGroup.variants.js';

export { Textarea } from './components/Textarea/Textarea.js';
export type {
  TextareaProps,
  TextareaVariantProps,
  TextareaSlotProps,
} from './components/Textarea/textarea.types.js';
export { textareaVariants } from './components/Textarea/textarea.variants.js';

// F4-B tier-2 final: numeric input + segmented OTP

export { NumberField } from './components/NumberField/NumberField.js';
export type {
  NumberFieldProps,
  NumberFieldVariantProps,
  NumberFieldSlotProps,
} from './components/NumberField/numberField.types.js';
export { numberFieldVariants } from './components/NumberField/numberField.variants.js';

export { OTPField } from './components/OTPField/OTPField.js';
export type {
  OTPFieldProps,
  OTPFieldVariantProps,
  OTPFieldSlotProps,
  OTPFieldMode,
} from './components/OTPField/otpField.types.js';
export { otpFieldVariants } from './components/OTPField/otpField.variants.js';

// F5-A tier-3: AAA-grade single-select combobox via React Aria

export { Autocomplete } from './components/Autocomplete/Autocomplete.js';
export type {
  AutocompleteProps,
  AutocompleteOption,
  AutocompleteSlotProps,
  AutocompleteValue,
  AutocompleteVariantProps,
} from './components/Autocomplete/autocomplete.types.js';
export { autocompleteVariants } from './components/Autocomplete/autocomplete.variants.js';

// Custom calendar suite — Calendar primitive + bridge-integrated DatePicker /
// TimePicker / DateTimePicker / DateRangePicker, all built on the shared
// headless `@dashforge/calendar-core` engine.

export { Calendar } from './components/Calendar/Calendar.js';
export type {
  CalendarProps,
  CalendarSlotProps,
} from './components/Calendar/calendar.types.js';
export {
  calendarVariants,
  calendarDayVariants,
} from './components/Calendar/calendar.variants.js';

export { DatePicker } from './components/DatePicker/DatePicker.js';
export type {
  DatePickerProps,
  DatePickerSlotProps,
} from './components/DatePicker/datePicker.types.js';
export { datePickerVariants } from './components/DatePicker/datePicker.variants.js';

export { TimePicker } from './components/TimePicker/TimePicker.js';
export type {
  TimePickerProps,
  TimePickerSlotProps,
} from './components/TimePicker/timePicker.types.js';
export { timePickerVariants } from './components/TimePicker/timePicker.variants.js';

export { DateTimePicker } from './components/DateTimePicker/DateTimePicker.js';
export type {
  DateTimePickerProps,
  DateTimePickerSlotProps,
} from './components/DateTimePicker/dateTimePicker.types.js';
export { dateTimePickerVariants } from './components/DateTimePicker/dateTimePicker.variants.js';

export { DateRangePicker } from './components/DateRangePicker/DateRangePicker.js';
export type {
  DateRangePickerProps,
  DateRangePickerSlotProps,
} from './components/DateRangePicker/dateRangePicker.types.js';
export {
  dateRangePickerVariants,
  dateRangeDayVariants,
} from './components/DateRangePicker/dateRangePicker.variants.js';

// F6 layout: router-agnostic navigation primitives.

export { Breadcrumbs } from './components/Breadcrumbs/Breadcrumbs.js';
export type {
  BreadcrumbsProps,
  BreadcrumbItem,
  BreadcrumbsSlotProps,
  BreadcrumbLinkComponent,
} from './components/Breadcrumbs/breadcrumbs.types.js';
export { breadcrumbsVariants } from './components/Breadcrumbs/breadcrumbs.variants.js';

export { LeftNav } from './components/LeftNav/LeftNav.js';
export type {
  LeftNavProps,
  LeftNavNode,
  LeftNavItem,
  LeftNavGroup,
  LeftNavSlotProps,
  LeftNavLinkComponent,
} from './components/LeftNav/leftNav.types.js';
export { leftNavVariants } from './components/LeftNav/leftNav.variants.js';

export { TopBar } from './components/TopBar/TopBar.js';
export type {
  TopBarProps,
  TopBarSlotProps,
} from './components/TopBar/topBar.types.js';
export { topBarVariants } from './components/TopBar/topBar.variants.js';

export { AppShell } from './components/AppShell/AppShell.js';
export type {
  AppShellProps,
  AppShellSlotProps,
} from './components/AppShell/appShell.types.js';
export { appShellVariants } from './components/AppShell/appShell.variants.js';

// F7 providers: imperative dialogs + transient notifications.

export {
  ConfirmDialogProvider,
  useConfirm,
} from './components/ConfirmDialog/ConfirmDialog.js';
export type {
  ConfirmDialogProviderProps,
  ConfirmDialogSlotProps,
  ConfirmDialogVariantProps,
  ConfirmFn,
  ConfirmOptions,
  ConfirmSeverity,
} from './components/ConfirmDialog/confirmDialog.types.js';
export { confirmDialogVariants } from './components/ConfirmDialog/confirmDialog.variants.js';

export {
  SnackbarProvider,
  useSnackbar,
} from './components/Snackbar/Snackbar.js';
export type {
  SnackbarProviderProps,
  SnackbarApi,
  SnackbarOptions,
  SnackbarRecord,
  SnackbarSeverity,
  SnackbarVariant,
  SnackbarPosition,
  SnackbarSlotProps,
  SnackbarVariantProps,
} from './components/Snackbar/snackbar.types.js';
export { snackbarVariants } from './components/Snackbar/snackbar.variants.js';

// Alert — inline persistent status surface (companion to Snackbar's
// transient toast). Full MUI Alert API parity (`severity`, `variant`,
// `icon`, `onClose`, `action`, `role`, `<AlertTitle>` sub-component);
// `severity="danger"` (not MUI `"error"`) for token-palette alignment.
// Shares the 3×4 color matrix in `_shared/severity/` with the
// refactored Snackbar (Sprint 4.4).
export { Alert, AlertTitle } from './components/Alert/Alert.js';
export type {
  AlertProps,
  AlertTitleProps,
  AlertSlotProps,
  AlertDefaultVariantProps,
} from './components/Alert/alert.types.js';
export { alertVariants } from './components/Alert/alert.variants.js';

// IconButton — square, icon-only variant of <Button>. Reuses
// `buttonVariants` 1:1 (variant × color × size × loading); adds square
// geometry (w-N + px-0 + aspect-square) and a TS-enforced `aria-label`.
// access RBAC integration mirrors <Button>; no `visibleWhen` /
// `slotProps` by design (icon-only buttons are single-DOM-element
// action triggers, not content surfaces).
export { IconButton } from './components/IconButton/IconButton.js';
export type {
  IconButtonProps,
  IconButtonVariantProps,
} from './components/IconButton/iconButton.types.js';
export {
  ICON_BUTTON_BASE,
  ICON_BUTTON_SIZE_OVERRIDES,
} from './components/IconButton/iconButton.variants.js';

// Menu family — compound action menu built on
// `@radix-ui/react-dropdown-menu` (purpose-built menu primitive
// with full WAI-ARIA menu pattern + keyboard nav + type-ahead +
// lazy portal mount). Atlaskit-inspired: item-level memo, lazy
// portal mount, MenuSkeleton for fetch-while-open patterns.
//   • <Menu>           — root provider (open state, closeOnItemClick)
//   • <MenuTrigger>    — asChild trigger wrapper
//   • <MenuContent>    — floating panel (portal, lazy mount)
//   • <MenuItem>       — clickable row (memoized, access + visibleWhen)
//   • <MenuLabel>      — non-interactive section heading
//   • <MenuSeparator>  — divider
//   • <MenuSkeleton>   — Atlaskit-style loading placeholder
// Sub-menus + controlled selection mode are out of scope for v1.
export {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuSkeleton,
} from './components/Menu/Menu.js';
export type {
  MenuProps,
  MenuTriggerProps,
  MenuContentProps,
  MenuItemProps,
  MenuLabelProps,
  MenuSeparatorProps,
  MenuSkeletonProps,
  MenuPlacement,
  MenuItemColor,
} from './components/Menu/menu.types.js';
export { menuVariants } from './components/Menu/menu.variants.js';

// Badge — anchored indicator (count / dot / short text overlay).
// Wrapper-only mode: <Badge>{anchor}</Badge>. For standalone inline
// pills (status labels, removable tags), use <Chip> — Badge and Chip
// are complementary. content + max overflow ("99+"), showZero gate,
// dot mode, invisible toggle. placement 4 corners + overlap
// rectangular/circular for round anchors (Avatar). withRing default
// for visual separation. access + visibleWhen — gate the badge
// (anchor always renders).
export { Badge } from './components/Badge/Badge.js';
export type {
  BadgeProps,
  BadgeVariantProps,
  BadgeColor,
  BadgePlacement,
  BadgeOverlap,
  BadgeSlotProps,
} from './components/Badge/badge.types.js';
export { badgeVariants } from './components/Badge/badge.variants.js';
export type { BadgeVariants } from './components/Badge/badge.variants.js';

// Spinner — rotating-arc loading indicator. SVG + animate-spin
// (pure CSS, GPU-accelerated, motion-reduce-safe). Color via
// currentColor by default (inherits parent text color — works inside
// any container), or explicit 7-intent color. Optional `withTrack`
// renders a ghost ring behind the arc (Stripe / Vercel / Linear
// premium look). `delay` prop suppresses the spinner for the first
// N ms (Atlassian-style anti-flash for sub-N-ms operations).
// visibleWhen bridge integration; no access (display only). Refactor:
// Button + IconButton internal loading state now reuse this Spinner
// (single source of truth).
export { Spinner } from './components/Spinner/Spinner.js';
export type {
  SpinnerProps,
  SpinnerSize,
  SpinnerColor,
  SpinnerThickness,
  SpinnerVariantProps,
} from './components/Spinner/spinner.types.js';
export {
  spinnerVariants,
  SPINNER_STROKE_WIDTH,
  SPINNER_TRACK_OPACITY,
  SPINNER_COLORS,
} from './components/Spinner/spinner.variants.js';

// Avatar — image / initials / icon visual identity.
//   • <Avatar>       — single avatar, src + auto-initials from name
//                      (Mantine-style), shape + radius (Box token
//                      scale), size enum xs/sm/md/lg/xl, color × tone
//                      (TS-safe palette access), fallbackIcon escape.
//   • <AvatarGroup>  — thin horizontal wrapper with negative-margin
//                      overlap, max + overflow indicator, optional
//                      ring halo. Size propagates to children.
// No access / visibleWhen — Avatar is display-only by category.
// Wrap in <Box> if visibility gating is needed.
export { Avatar, AvatarGroup } from './components/Avatar/Avatar.js';
export type {
  AvatarProps,
  AvatarVariantProps,
  AvatarGroupProps,
  AvatarSize,
  AvatarShape,
  AvatarColor,
  AvatarTone,
} from './components/Avatar/avatar.types.js';
export {
  avatarVariants,
  AVATAR_SOFT_FALLBACK,
  AVATAR_TONE_FALLBACK,
} from './components/Avatar/avatar.variants.js';

// Card family — opinionated surface preset over <Box>.
//   • <Card>           — thin Box alias with card-shaped defaults
//                        (variant=outlined, rounded=lg, elevation=1,
//                        no padding). Inherits access + visibleWhen
//                        from Box (Sprint 4.4 surface alignment).
//   • <CardContent>    — padded inner section (semantic alias for
//                        Box with default p=4).
//   • <CardActionArea> — clickable wrapper with focus ring + hover +
//                        asChild polymorphism (router Link patterns).
//                        Carries access + visibleWhen + selected
//                        (for option-card / filter-card toggle).
export { Card, CardContent, CardActionArea } from './components/Card/Card.js';
export type {
  CardProps,
  CardContentProps,
  CardActionAreaProps,
} from './components/Card/card.types.js';

// Chip — status / filter / tag pill. Promoted from the internal
// `Table/cells/RenderChip` (Sprint 4.4): the 3 × 7 (variant × color)
// matrix is now the single source of truth, consumed by both the
// public <Chip> and (via thin wrapper) the legacy RenderChip.
// Variant axis: `soft | solid | outline` (Dashforge chip vocabulary —
// distinct from Button's and Alert's by design, see CHANGELOG).
// access RBAC integration; selected for filter-pill patterns;
// onDelete for removable tags.
export { Chip } from './components/Chip/Chip.js';
export type {
  ChipProps,
  ChipVariantProps,
} from './components/Chip/chip.types.js';
export { chipVariants } from './components/Chip/chip.variants.js';
export type { ChipVariants } from './components/Chip/chip.variants.js';

// F9 foundation: typography + layout primitives. These sit BENEATH
// every other component (Button's label, TextField's helper text, the
// surface of an AppShell card) and are what app-level code reaches for
// before it reaches for any specific UI atom.

export { Typography } from './components/Typography/Typography.js';
export type {
  TypographyProps,
  TypographyVariantProps,
} from './components/Typography/typography.types.js';
export { typographyVariants } from './components/Typography/typography.variants.js';

export { Box } from './components/Box/Box.js';
export type {
  BoxProps,
  BoxVariantProps,
} from './components/Box/box.types.js';
export { boxVariants } from './components/Box/box.variants.js';

export { Stack } from './components/Stack/Stack.js';
export type {
  StackProps,
  StackVariantProps,
} from './components/Stack/stack.types.js';
export { stackVariants } from './components/Stack/stack.variants.js';

export { Grid } from './components/Grid/Grid.js';
export type {
  GridProps,
  GridContainerProps,
  GridItemProps,
  GridVariantProps,
  ColSpan,
  GridSpacingStep,
} from './components/Grid/grid.types.js';
export { gridVariants } from './components/Grid/grid.variants.js';

// F10 foundation completions: Container, Divider, AspectRatio, VisuallyHidden.
// The page-root chrome + visual separators + content-shape primitives +
// the a11y baseline. With these, the foundation layer matches what
// Chakra/Mantine/Joy ship for layout-level primitives.

export { Container } from './components/Container/Container.js';
export type {
  ContainerProps,
  ContainerVariantProps,
} from './components/Container/container.types.js';
export { containerVariants } from './components/Container/container.variants.js';

export { Divider } from './components/Divider/Divider.js';
export type {
  DividerProps,
  DividerVariantProps,
} from './components/Divider/divider.types.js';
export {
  dividerVariants,
  dividerLineVariants,
} from './components/Divider/divider.variants.js';

export { AspectRatio } from './components/AspectRatio/AspectRatio.js';
export type { AspectRatioProps } from './components/AspectRatio/aspectRatio.types.js';

export { VisuallyHidden } from './components/VisuallyHidden/VisuallyHidden.js';
export type { VisuallyHiddenProps } from './components/VisuallyHidden/visuallyHidden.types.js';

// F11 tier-4: overlay + disclosure primitives.

export { Dialog } from './components/Dialog/Dialog.js';
export type {
  DialogProps,
  DialogSlotProps,
  DialogVariantProps,
} from './components/Dialog/dialog.types.js';
export { dialogVariants } from './components/Dialog/dialog.variants.js';

export { Tabs } from './components/Tabs/Tabs.js';
export type {
  TabsProps,
  TabsSlotProps,
  TabItem,
} from './components/Tabs/tabs.types.js';
export { tabsVariants } from './components/Tabs/tabs.variants.js';

export { Tooltip } from './components/Tooltip/Tooltip.js';
export type {
  TooltipProps,
  TooltipSlotProps,
  TooltipVariantProps,
} from './components/Tooltip/tooltip.types.js';
export { tooltipVariants } from './components/Tooltip/tooltip.variants.js';

export { Popover } from './components/Popover/Popover.js';
export type {
  PopoverProps,
  PopoverSlotProps,
  PopoverVariantProps,
} from './components/Popover/popover.types.js';
export { popoverVariants } from './components/Popover/popover.variants.js';

export { Accordion } from './components/Accordion/Accordion.js';
export type {
  AccordionProps,
  AccordionSlotProps,
  AccordionItem,
} from './components/Accordion/accordion.types.js';
export { accordionVariants } from './components/Accordion/accordion.variants.js';

// F12 utilities: loading placeholder + pagination control.

export { Skeleton } from './components/Skeleton/Skeleton.js';
export type {
  SkeletonProps,
  SkeletonSlotProps,
  SkeletonVariantProps,
} from './components/Skeleton/skeleton.types.js';
export { skeletonVariants } from './components/Skeleton/skeleton.variants.js';

export { Pagination } from './components/Pagination/Pagination.js';
export type {
  PaginationProps,
  PaginationSlotProps,
  PaginationLabels,
} from './components/Pagination/pagination.types.js';
export { paginationVariants } from './components/Pagination/pagination.variants.js';

// F13 tier-5: market-grounded Table (Stripe-style visuals, Pencil&Paper
// UX research, W3C WAI a11y). DataGrid (with virtualization) ships in
// Sprint 4.2.

export { Table } from './components/Table/Table.js';
export type {
  TableProps,
  TableColumn,
  TableColumnInferredType,
  TableCellContext,
  TableSortDirection,
  TableSortItem,
  TableSortModel,
  TableFilterItem,
  TableFilterModel,
  TableFilterOperator,
  TableFilterType,
  TableRowSelectionMode,
  TableExpandableConfig,
  TableLabels,
  TableSlotProps,
  NestedKeyOf,
} from './components/Table/table.types.js';
export { tableVariants } from './components/Table/table.variants.js';
// Cell renderer library
export {
  RenderText,
  RenderTwoLine,
  RenderChip,
  RenderButton,
  RowActionsMenu,
} from './components/Table/cells/index.js';
export type {
  RenderTextProps,
  RenderTwoLineProps,
  RenderChipProps,
  RenderButtonProps,
  RowActionsMenuProps,
  TableRowAction,
} from './components/Table/cells/index.js';
// Helpers (exported for power users building custom Table-like
// components on top of the same primitives).
export { getNestedValue } from './components/_shared/data/getNestedValue.js';

// F14 tier-5: virtualized data grid for large data sets. Companion to
// `<Table>` — same column model, sort/search/filter/selection logic
// (shared via `_shared/data/` helpers) but uses homemade
// virtualization (`IntersectionObserver` + scroll-event +
// `requestAnimationFrame` — zero new runtime deps).

export { DataGrid } from './components/DataGrid/DataGrid.js';
export type {
  DataGridProps,
  DataGridSlotProps,
  DataGridSelectAllScope,
  DataGridServerSideFlags,
  DataGridPaginationConfig,
} from './components/DataGrid/dataGrid.types.js';
export { dataGridVariants } from './components/DataGrid/dataGrid.variants.js';

// ───── Hooks ─────
export { useAccessState } from './hooks/useAccessState.js';

// ───── Utilities ─────
export { cn } from './utils/cn.js';

// Re-export tailwind-variants for consumers building app-level variants
// against the same canonical version used by the library.
export { tv } from 'tailwind-variants';
export type { VariantProps } from 'tailwind-variants';

/**
 * Package version (synced with `package.json` at publish time).
 */
export const VERSION = '1.1.1';
