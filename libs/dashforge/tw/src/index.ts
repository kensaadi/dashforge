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
export type { ButtonProps } from './components/Button/button.types.js';
export { buttonVariants } from './components/Button/button.variants.js';

export { TextField } from './components/TextField/TextField.js';
export type {
  TextFieldProps,
  TextFieldSlotProps,
} from './components/TextField/textField.types.js';
export { textFieldVariants } from './components/TextField/textField.variants.js';

export { Checkbox } from './components/Checkbox/Checkbox.js';
export type {
  CheckboxProps,
  CheckboxSlotProps,
} from './components/Checkbox/checkbox.types.js';
export { checkboxVariants } from './components/Checkbox/checkbox.variants.js';

export { Switch } from './components/Switch/Switch.js';
export type {
  SwitchProps,
  SwitchSlotProps,
} from './components/Switch/switch.types.js';
export { switchVariants } from './components/Switch/switch.variants.js';

// F4 tier-2: bridge-integrated multi-choice + multi-line input

export { RadioGroup } from './components/RadioGroup/RadioGroup.js';
export type {
  RadioGroupProps,
  RadioGroupOption,
  RadioGroupSlotProps,
} from './components/RadioGroup/radioGroup.types.js';
export { radioGroupVariants } from './components/RadioGroup/radioGroup.variants.js';

export { Textarea } from './components/Textarea/Textarea.js';
export type {
  TextareaProps,
  TextareaSlotProps,
} from './components/Textarea/textarea.types.js';
export { textareaVariants } from './components/Textarea/textarea.variants.js';

// F4-B tier-2 final: numeric input + segmented OTP

export { NumberField } from './components/NumberField/NumberField.js';
export type {
  NumberFieldProps,
  NumberFieldSlotProps,
} from './components/NumberField/numberField.types.js';
export { numberFieldVariants } from './components/NumberField/numberField.variants.js';

export { OTPField } from './components/OTPField/OTPField.js';
export type {
  OTPFieldProps,
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
} from './components/Autocomplete/autocomplete.types.js';
export { autocompleteVariants } from './components/Autocomplete/autocomplete.variants.js';

// F5-B tier-3: native HTML5 date / time / datetime picker, bridge-integrated.

export {
  DateTimePicker,
  isoToInputValue,
} from './components/DateTimePicker/DateTimePicker.js';
export type {
  DateTimePickerProps,
  DateTimePickerMode,
  DateTimePickerSlotProps,
} from './components/DateTimePicker/dateTimePicker.types.js';
export { dateTimePickerVariants } from './components/DateTimePicker/dateTimePicker.variants.js';

// Custom calendar suite — Calendar primitive + bridge-integrated DatePicker,
// both built on the shared headless `@dashforge/calendar-core` engine.

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
  SnackbarPosition,
  SnackbarSlotProps,
} from './components/Snackbar/snackbar.types.js';
export { snackbarVariants } from './components/Snackbar/snackbar.variants.js';

// F9 foundation: typography + layout primitives. These sit BENEATH
// every other component (Button's label, TextField's helper text, the
// surface of an AppShell card) and are what app-level code reaches for
// before it reaches for any specific UI atom.

export { Typography } from './components/Typography/Typography.js';
export type { TypographyProps } from './components/Typography/typography.types.js';
export { typographyVariants } from './components/Typography/typography.variants.js';

export { Box } from './components/Box/Box.js';
export type { BoxProps } from './components/Box/box.types.js';
export { boxVariants } from './components/Box/box.variants.js';

export { Stack } from './components/Stack/Stack.js';
export type { StackProps } from './components/Stack/stack.types.js';
export { stackVariants } from './components/Stack/stack.variants.js';

export { Grid } from './components/Grid/Grid.js';
export type {
  GridProps,
  GridContainerProps,
  GridItemProps,
  ColSpan,
  GridSpacingStep,
} from './components/Grid/grid.types.js';
export { gridVariants } from './components/Grid/grid.variants.js';

// F10 foundation completions: Container, Divider, AspectRatio, VisuallyHidden.
// The page-root chrome + visual separators + content-shape primitives +
// the a11y baseline. With these, the foundation layer matches what
// Chakra/Mantine/Joy ship for layout-level primitives.

export { Container } from './components/Container/Container.js';
export type { ContainerProps } from './components/Container/container.types.js';
export { containerVariants } from './components/Container/container.variants.js';

export { Divider } from './components/Divider/Divider.js';
export type { DividerProps } from './components/Divider/divider.types.js';
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
} from './components/Tooltip/tooltip.types.js';
export { tooltipVariants } from './components/Tooltip/tooltip.variants.js';

export { Popover } from './components/Popover/Popover.js';
export type {
  PopoverProps,
  PopoverSlotProps,
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
export const VERSION = '0.7.0-beta';
