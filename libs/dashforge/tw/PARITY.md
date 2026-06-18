# `@dashforge/tw` ↔ `@dashforge/ui` parity audit

> Per-component diff between the two Dashforge UI lines for the
> **10 bridge-integrated components**.
>
> **Motivation.** This audit ensures:
>
> 1. **Internal consistency** — a refactor on `@dashforge/ui` that
>    doesn't land on `@dashforge/tw` would otherwise be invisible.
> 2. **Bridge contract validation** — the same `@dashforge/forms`
>    schema works identically on both lines.
> 3. **Parallel starter-kit maintainability** — two parallel kits
>    (one MUI, one TW) require call-site-level parity to stay
>    in sync.

## Versions audited

| Lib | Version | Date |
|---|---|---|
| `@dashforge/tw` | `1.1.1` | 2026-06-18 |
| `@dashforge/ui` | `1.0.0` | 2026-05-23 |

> **Note (1.1.1 audit).** Sprint 4.4 (2026-06-18) added 9
> presentational primitives to `@dashforge/tw` — they fall in the
> **TW-lead** category and don't appear in the per-component parity
> table below (see "Components NOT covered by this audit" → TW-lead
> Presentational section). Sprint 4.4 also retrofitted the bridge
> contract (`access` + `visibleWhen`) onto `<Button>`, `<IconButton>`,
> and `<Box>` to bring TW catalog to **100 % bridge coverage** of
> interactive surfaces.

## Scoring legend

| Symbol | Meaning |
|---|---|
| ✓ | Parity verified — the two lines accept the same prop / behave the same way at the call-site level. |
| ⚠ | Intentional delta — different prop or slightly different behavior, motivated and documented in the per-component section below. |
| ✗ | Unintended drift — bug or oversight, files a follow-up issue. |

## Bridge contract — universal across all 10 components

Both libs share an identical bridge contract. The following props
behave **byte-identical** in both lines (verified by reading the
types files of all 10 components):

| Prop | Type | Semantics |
|---|---|---|
| `name` | `string` (required) | Field name registered with the `DashFormProvider` bridge. |
| `rules` | `unknown` | Validation rules forwarded to the bridge engine — opaque to the component. |
| `visibleWhen` | `(engine: Engine) => boolean` | Engine predicate. Component returns `null` when false. |
| `access` | `AccessRequirement` | RBAC requirement. Behaviors (`hide` / `disable` / `readonly`) identical in both libs. |
| `helperText` | `ReactNode` | Helper text slot below the control. Auto-replaced with bridge error message when (a) error is true and (b) the Form Closure v1 gate passes (`touched \|\| submitCount > 0`). |
| `error` | `boolean` | Explicit error semaphore override. Cuts ahead of the bridge's auto-error. |
| `label` | `ReactNode` | Visible label. |

The bridge integration semantics (Form Closure v1 error gating, prop
precedence, granular per-field subscriptions, StrictMode-safe
unregister on unmount) are implemented identically across both lines
via the shared `@dashforge/ui-core` + `@dashforge/forms` packages.

This is the **portability layer**: any consumer who swaps
`@dashforge/ui` for `@dashforge/tw` (or vice versa) keeps their
form schemas, validation rules, and RBAC declarations unchanged.

## Per-component parity table

| # | Component | Signature | Behavior | Variant axis | Bridge | Overall |
|---|---|---|---|---|---|---|
| 1 | Button | ✓ | ✓ | ⚠ | ✓ | ⚠ |
| 2 | TextField | ✓ | ✓ | ⚠ | ✓ | ⚠ |
| 3 | Checkbox | ⚠ | ✓ | ✓ | ✓ | ⚠ |
| 4 | Switch | ⚠ | ✓ | ✓ | ✓ | ⚠ |
| 5 | RadioGroup | ⚠ | ✓ | ⚠ | ✓ | ⚠ |
| 6 | Textarea | ⚠ | ✓ | ⚠ | ✓ | ⚠ |
| 7 | NumberField | ✓ | ✓ | ⚠ | ✓ | ⚠ |
| 8 | OTPField | ✓ | ✓ | ⚠ | ✓ | ⚠ |
| 9 | Autocomplete | ⚠ | ⚠ | ⚠ | ✓ | ⚠ |
| 10 | DateTimePicker | ✓ | ✓ | ✓ | ✓ | ✓ |

**No `✗` rows** — no unintended drift was discovered. All deltas
are intentional and motivated below. The single `✓` overall
(DateTimePicker) is the only component where the two lines are
truly byte-identical at the prop level.

---

## 1. Button

### Signature

| Prop | `@dashforge/ui` (MUI) | `@dashforge/tw` |
|---|---|---|
| Inherits | `Omit<MuiButtonProps, 'disabled'>` | `Omit<ButtonHTMLAttributes, 'className' \| 'color'>` + `Pick<TVariants, 'variant' \| 'color' \| 'size' \| 'fullWidth' \| 'loading'>` |
| `access` | ✓ | ✓ |
| `disabled` | ✓ | ✓ |
| `asChild` | ✗ | ✓ (Radix Slot polymorphism) |
| `sx` | ✗ (MUI sx-object inherited via MuiButtonProps) | ✓ (utility-string) |
| `loading` | ✗ (consumer adds it manually) | ✓ (built-in variant axis) |

### Variant axis ⚠

| Axis | MUI | TW |
|---|---|---|
| `variant` | `contained` \| `outlined` \| `text` | `solid` \| `outline` \| `soft` \| `ghost` |
| `size` | `small` \| `medium` \| `large` | `sm` \| `md` \| `lg` |
| `color` | `primary` \| `secondary` \| `error` \| `info` \| `success` \| `warning` | same 6 intents |
| `fullWidth` | ✓ | ✓ |

**Intentional delta.** TW renames `contained → solid`, adds `soft`
+ `ghost` variants, renames sizes to short forms. The MUI naming is
a vestige of Material Design vocabulary; TW adopts the
shadcn/Radix/Mantine common-denominator naming because that's what
TW-native developers expect.

### Notes

- `loading` is a built-in TW variant (renders spinner + sets
  `aria-busy`). On MUI side it's a consumer-level pattern.
- TW's `asChild` (Radix Slot) is more powerful than MUI's
  `component`/`href` polymorphism — single API, no DOM doubling.

---

## 2. TextField

### Signature

| Prop | MUI | TW |
|---|---|---|
| Inherits | `Omit<MuiTextFieldProps, 'name' \| 'SelectProps' \| 'InputProps' \| 'InputLabelProps' \| 'FormHelperTextProps' \| 'inputProps'>` | `Omit<InputHTMLAttributes, 'size' \| 'className'>` + `Pick<TVariants, 'size' \| 'layout' \| 'fullWidth'>` |
| `layout` | ✓ (`floating` \| `stacked` \| `inline`) | ✓ (same enum) |
| `required` | ✓ (renders asterisk) | ✓ (same) |
| `slotProps.prefix/suffix` | ✗ (use `slotProps.input.startAdornment` / `endAdornment` — MUI v9 API) | ✓ (new in `0.3.0-beta` — inline adornments) |
| `sx` | MUI sx-object | TW utility-string |

### Variant axis ⚠

| Axis | MUI | TW |
|---|---|---|
| `variant` | `outlined` \| `filled` \| `standard` | not exposed (defaults to `outlined`-equivalent) |
| `size` | `small` \| `medium` | `sm` \| `md` \| `lg` |
| `layout` | `floating` \| `stacked` \| `inline` | same |

**Intentional delta.** TW intentionally drops MUI's
`variant="standard"` (underline-only field) — it's a Material Design
artifact that doesn't fit a typical Tailwind design system. TW also
drops MUI's `variant="filled"` for now (no design system demand).

### Notes

- TW exposes `slotProps.prefix` / `slotProps.suffix` (added in
  `0.3.0-beta`) for inline adornments. MUI achieves the same via
  `slotProps.input.startAdornment` / `endAdornment` — different shape,
  same outcome.
- MUI's deprecated `inputProps` / `InputProps` / `InputLabelProps` /
  `FormHelperTextProps` are explicitly Omit-ed from TW (cleanly,
  since TW never inherited them in the first place).

---

## 3. Checkbox

### Signature ⚠

| Prop | MUI | TW |
|---|---|---|
| Inherits | `Omit<MuiCheckboxProps, 'name'>` (inherits MUI's `onChange: (event, checked) => void`) | `Pick<TVariants, 'size'>` (no HTML attrs inherited) |
| `onChange` | ✓ MUI HTML signature: `(event, checked) => void` | ✗ (not exposed) |
| `onCheckedChange` | ✗ | ✓ Radix signature: `(checked: boolean) => void` |
| `checked` / `defaultChecked` | ✓ | ✓ |
| `slotProps.indicator` | ✗ | ✓ |

**Intentional delta.** Callback signature differs: MUI uses the HTML
`onChange(event, checked)`, TW uses Radix's `onCheckedChange(checked)`.
A consumer rewriting `<Checkbox onChange={…}>` → `<Checkbox onCheckedChange={…}>`
is the only call-site change. Documented in `customization.mdx`
(Sprint 3 P2).

### Variant axis ✓

Both libs expose `size` only (`small`/`medium`/`large` MUI ↔
`sm`/`md`/`lg` TW — same naming convention as Button).

### Notes

- TW's Indicator renders BOTH `<CheckIcon />` and `<DashIcon />` and
  toggles via Radix `data-state` (added in `0.3.0-beta`).
  Indeterminate state is handled CSS-only.
- Bridge contract identical: `useDashFieldMeta(name)` granular
  subscription, Form Closure v1 gating.

---

## 4. Switch

### Signature ⚠

Same delta as Checkbox: TW exposes `onCheckedChange(checked)` (Radix),
MUI exposes `onChange(event, checked)` (HTML). All other props
identical (name, label, rules, visibleWhen, helperText, error, access,
checked, defaultChecked, disabled).

### Variant axis ✓

Both libs: `size` only.

### Notes

- TW gates the thumb-slide animation on `prefers-reduced-motion`
  (added Sprint 2 0.3.0-beta).

---

## 5. RadioGroup

### Signature ⚠

| Prop | MUI | TW |
|---|---|---|
| Inherits | `Omit<MuiRadioGroupProps, 'name'>` | `RadioGroupVariants` (Pick-style) |
| `onChange` | ✓ MUI signature | ✗ |
| `onValueChange` | ✗ | ✓ Radix signature: `(value: string) => void` |
| `options` | ✓ (`RadioGroupOption[]` — identical shape) | ✓ |
| `RadioGroupOption.access` | ✓ option-level RBAC | ✓ option-level RBAC |

### Variant axis ⚠

| Axis | MUI | TW |
|---|---|---|
| `orientation` | inherited from MUI's `row` boolean | dedicated `orientation: 'horizontal' \| 'vertical'` |
| `size` | inherited (`small`/`medium`) | `sm` \| `md` \| `lg` |

**Intentional delta.** TW exposes `orientation` as a typed variant
axis (vs MUI's legacy `row={true}` boolean). MUI's `row` prop is a
Material legacy; TW's `orientation` is the Radix/Aria standard.

### Notes

- Option-level RBAC is implemented identically in both libs
  (`hide` keeps selected option visible-but-disabled to expose the
  user's previous choice).
- Group-level access has precedence over option-level access in
  both libs.

---

## 6. Textarea

### Signature ⚠

| Prop | MUI | TW |
|---|---|---|
| Inherits | `Omit<MuiTextFieldProps, 'name'>` (with internal `multiline={true}` hard-coded) | `Omit<TextareaHTMLAttributes, 'name' \| 'size' \| 'onChange' \| 'onBlur' \| 'value' \| 'defaultValue'>` + `TextareaVariants` |
| `rows` / `minRows` | ✓ (defaults `minRows={3}`) | ✓ (`rows` defaults to 3) |
| `resize` | ✗ (CSS native, no prop) | ✓ variant axis (`none` \| `vertical` \| `horizontal` \| `both`) |

### Variant axis ⚠

TW adds the `resize` variant axis as a typed prop. MUI relies on the
consumer adding inline `style={{ resize: 'vertical' }}` or CSS.

### Notes

- Form bridge contract identical.
- TW exposes own `onChange` / `onBlur` typed for `HTMLTextAreaElement`;
  MUI inherits from MUI's `TextFieldProps` typing for the
  multiline-disguised-as-input case.

---

## 7. NumberField

### Signature

| Prop | MUI | TW |
|---|---|---|
| Inherits | `Omit<MuiTextFieldProps, 'name' \| 'type' \| 'value' \| 'onChange'>` | `Omit<InputHTMLAttributes, 'name' \| 'type' \| 'size' \| ...>` + `NumberFieldVariants` |
| `value` | `number \| string \| null` | `number \| string \| null` (identical) |
| `min` / `max` / `step` | inherited HTML attrs | typed at top level |
| `showStepper` | ✗ | ✓ (TW-only: inline +/− buttons) |
| `slotProps.stepper` / `slotProps.stepperButton` | ✗ | ✓ |

### Variant axis ⚠

TW exposes the stepper as a typed feature (`showStepper={true}`).
MUI's NumberField is a plain `type="number"` input with no stepper UI.

### Behavior ✓

**Value contract is byte-identical** between the two lines:

- Bridge storage type: `number \| null` (NEVER `NaN`)
- UI display: `number → String(number)`, `null/undefined → ""`
- Empty string → `setValue(name, null)`
- Parseable number → `setValue(name, parsed)`
- Non-numeric input → no bridge write (UI keeps string for UX,
  bridge stays at last valid value)
- Parsing uses `Number(...)` + `Number.isFinite(...)`. No locale parsing.

This contract is explicitly documented in both lines' types files —
the audit confirms they match word-for-word.

---

## 8. OTPField

### Signature

| Prop | MUI | TW |
|---|---|---|
| `length` | ✓ (default 6) | ✓ (default 6) |
| `mode` | `numeric` \| `alphanumeric` \| `alpha` | `numeric` \| `alphanumeric` |
| `onComplete` | ✓ | ✓ |
| `onChange` | `(value: string) => void` | `(value: string) => void` (identical) |
| `autoFocus` | ✓ (default `true`) | not in types (defaults via native `<input autoFocus>`) |

### Variant axis ⚠

| Axis | MUI | TW |
|---|---|---|
| Slot rendering | custom React per-slot | custom React per-slot + Tailwind variant (`size`, `tone`) |

**Intentional delta.** TW drops MUI's `alpha`-only mode (no design
system demand; consumers needing pure-alpha can use `alphanumeric`
+ client-side filter). TW also exposes per-slot styling via typed
`slotProps.slot` / `slotProps.slotChar`.

### Behavior ✓

Both libs:
- Sanitize input per `mode` on every keystroke
- Sanitize paste content and fill slots sequentially
- Emit `onChange` with the joined sanitized value (≤ `length`)
- Fire `onComplete` when all slots filled

---

## 9. Autocomplete

### Signature ⚠

| Prop | MUI | TW |
|---|---|---|
| `multiple` (multi-select) | ✗ (MUI v9 inherits but Dashforge wrapper doesn't expose) | ✓ |
| `freeSolo` | ✗ (MUI inherits but wrapper hides it) | ✓ |
| `loadOptions` (async loader) | ✗ | ✓ |
| `loadDebounceMs` | ✗ | ✓ (default 250ms) |
| `optionsFromFieldData` | ✓ (MUI-only feature for runtime options from form runtime) | ✗ (TW doesn't have a runtime-data integration yet — F6+ work) |
| `getOptionValue` / `getOptionLabel` / `getOptionDisabled` | ✓ | ✓ |
| `getOptionKey` | ✗ | ✓ |
| `onChange` | `(value: TValue \| null) => void` | `onValueChange: (AutocompleteValue) => void` (AutocompleteValue = `string \| string[] \| null`) |

### Variant axis ⚠

| Axis | MUI | TW |
|---|---|---|
| Mode | single-select only | single + multi + free-solo |
| Async | not in wrapper (use MUI's directly if needed) | first-class `loadOptions` prop |

**Intentional delta — TW is feature-ahead.** TW's Autocomplete is
the most-extended bridge component:

- **Multi-select** (chips inside input, backspace to remove last)
- **Free-solo** (Enter commits typed text as value)
- **Async loadOptions** (debounced, replaces static `options` while
  the user types)

MUI's Dashforge wrapper trails behind because: (a) MUI's underlying
Autocomplete already supports these via inherited props, so wrapping
them feels redundant; (b) the MUI consumer can drop down to
`MuiAutocomplete` directly when they need these features. TW had to
implement them from scratch (built on React Aria's `useComboBox`),
so it was natural to expose them as first-class props.

**Reverse delta — MUI is ahead on**: `optionsFromFieldData` (runtime
field data integration for dynamic option lists fed by the form
engine). This is a F6+ feature on the TW roadmap.

### Behavior ⚠

The core bridge contract is parity:

- Storage policy: option pick → mapped `option.value`; clear → `null`
- Form Closure v1 error gating
- StrictMode-safe unregister on unmount

But the **storage type** differs:
- MUI: `TValue \| null` where TValue is `string | number`
- TW: `string \| string[] \| null` (`string[]` for multi-select)

This is a real call-site delta. A consumer migrating MUI → TW with
a NumberField-style numeric `TValue` would need to switch to string
storage + cast on submission.

---

## 10. DateTimePicker

### Signature ✓

All props parity:

- `mode: 'date' \| 'time' \| 'datetime'` — identical
- `value: string \| null` — identical (ISO 8601-ish naive string)
- `min` / `max` / `step` — identical
- `name` / `rules` / `visibleWhen` / `access` — identical (bridge)
- `label` / `helperText` / `error` / `required` / `disabled` — identical

### Variant axis ✓

Layout: both libs allow `stacked` / `inline` and downgrade `floating`
to `stacked` with a dev warning (rationale: native input always
shows a placeholder mask that overlaps the floating label).

### Behavior ✓

Both libs:
- Use native `<input type="date|time|datetime-local">`
- Bridge contract identical
- ISO string contract identical (`datetime-local` is naive — no TZ;
  if you need TZ-aware persistence, both libs say to convert
  upstream)

**This is the cleanest parity case in the audit** — the only ✓✓✓
across all four columns. Likely because both lines deliberately
chose native HTML5 inputs over a custom calendar widget, leaving
very little surface to diverge on.

### Notes

- MUI exposes `@deprecated inputProps` / `InputLabelProps` shims for
  MUI v7 backward compatibility. TW never had these (no MUI lineage).

---

## Summary of intentional deltas

1. **Callback signatures**: TW prefers Radix-style `onCheckedChange` /
   `onValueChange` (single-arg). MUI inherits HTML `onChange(event, value)`.
   → **Documented in `customization.mdx` decision tree.**
2. **Variant taxonomy**: TW uses shadcn/Radix common-denominator
   vocabulary (`solid`/`outline`/`soft`/`ghost`, `sm`/`md`/`lg`).
   MUI uses Material Design vocabulary (`contained`/`outlined`/`text`,
   `small`/`medium`/`large`). 1:1 mappable.
3. **`sx` shape**: TW = utility string, MUI = sx-object. Same name,
   different semantics — by design (see `customization.mdx` §1).
4. **TW-only props**: `slotProps`, `asChild` (Button), `loading`
   (Button), `slotProps.prefix/suffix` (TextField), `showStepper`
   (NumberField), `multiple` / `freeSolo` / `loadOptions`
   (Autocomplete), `resize` variant (Textarea).
5. **MUI-only props**: `optionsFromFieldData` (Autocomplete runtime
   data integration).

## Components NOT covered by this audit

The MUI line has these additional components that have no TW
counterpart yet (NOT in scope for this audit — they're not part of
the bridge-integrated tier):

- `Select` (MUI-only) — TW uses Autocomplete for select-like UX
- `Animate` (MUI-only utility)

The TW line has these additional components with no MUI counterpart
(Sprint 1-2 Foundation work, not in scope here):

- `Typography`, `Box`, `Stack`, `Grid`, `Container`, `Divider`,
  `AspectRatio`, `VisuallyHidden` (8 Foundation primitives)

### TW-lead Presentational primitives (Sprint 4.4, `@dashforge/tw@1.1.1`)

Sprint 4.4 added **9 component families** in the same TW-lead
category as the Foundation primitives above. They ship on the TW
side only because the MUI flavor consumes `@mui/material/<Component>`
directly — wrapping them in `@dashforge/ui` would add zero
Dashforge value (`@mui/material` already provides them with a
solid look-and-feel). The gap is **intentional**, not drift:

| TW component | MUI flavor counterpart |
|---|---|
| `Alert` + `AlertTitle` | `@mui/material/Alert` + `AlertTitle` (vanilla) |
| `IconButton` | `@mui/material/IconButton` (vanilla) |
| `Chip` | `@mui/material/Chip` (vanilla) |
| `Card` + `CardContent` + `CardActionArea` | `@mui/material/Card` + `CardContent` + `CardActionArea` (vanilla) |
| `Avatar` + `AvatarGroup` | `@mui/material/Avatar` + `AvatarGroup` (vanilla) |
| `Spinner` (= `CircularProgress`) | `@mui/material/CircularProgress` (vanilla) |
| `Badge` | `@mui/material/Badge` (vanilla) |
| `Menu` + `MenuTrigger` + `MenuContent` + `MenuItem` + `MenuLabel` + `MenuSeparator` + `MenuSkeleton` | `@mui/material/Menu` + `MenuItem` (vanilla) |

**15 new public exports total** (9 root components + 6 Menu
sub-components). All token-driven via `dashforgePreset()`, no
hardcoded hex, no `dark:` on neutral palette.

Bridge-integrated subset (`access` + `visibleWhen` props):
`Alert`, `IconButton`, `Chip`, `Card` (via Box), `Avatar`, `Badge`,
`MenuItem`. Pure presentational (no bridge): `Spinner`, `AvatarGroup`,
`Menu`/`MenuTrigger`/`MenuContent`/`MenuLabel`/`MenuSeparator`.

The `<Snackbar>` provider (already TW-only, shipped earlier) was
also refactored onto the new `_shared/severity/` foundation in this
sprint — same severity color matrix + SVG icons as `<Alert>`.

Tier-4 components (Dialog, Tabs, Tooltip, Popover, Accordion) ship in
Sprint 3 P3 — they will be MUI-side counterparts of MUI's own
`Dialog`, `Tabs`, `Tooltip`, `Popover`, `Accordion`. Future PARITY.md
revisions will include them.

## Follow-up items

No `✗` rows surfaced, so no critical follow-ups. The intentional
deltas are documented above. The following nice-to-haves were
identified but are explicitly deferred:

| Item | Notes | Sprint |
|---|---|---|
| Optional `onChange` (HTML-style) on Checkbox / Switch / RadioGroup | For MUI-migrating consumers who want byte-identical call-sites. Could be added as an additional optional callback alongside `onCheckedChange`. | Not planned. Intentional choice; documented in customization.mdx instead. |
| `optionsFromFieldData` on TW Autocomplete | Runtime field data integration. Requires F6 infrastructure (form runtime data hooks not yet ported to TW). | Sprint 6 (post-1.0 candidate). |
| MUI-side `loadOptions` / `freeSolo` / `multiple` exposure | MUI consumer can use `MuiAutocomplete` directly for these. Not adding to the wrapper unless concrete demand. | Not planned. |
| `variant="standard"` / `"filled"` on TW TextField | No design system demand. | Not planned. |

Maintenance pact: every release that touches a bridge-integrated
component on either line MUST re-run this audit. The cost is low
(~30 min for a single-component diff) and the consistency value is
high.
