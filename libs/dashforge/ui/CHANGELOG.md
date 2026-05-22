# Changelog — @dashforge/ui

All notable changes to `@dashforge/ui` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
with `-alpha` / `-beta` / `-rc` pre-release tags.

> For the cross-package release context, see the
> [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md).

## [0.3.0-beta] — 2026-05-21

**Sprint 7 — Calendar suite (part 2).** Completes the custom date-picker
suite: `TimePicker`, `DateRangePicker`, and a rebuilt `DateTimePicker` —
all on the shared headless `@dashforge/calendar-core` engine.

### Added

- **`<TimePicker>`** — a form-bound time-of-day field: an editable input
  paired with a dropdown of time options. Free-typed input is normalized
  via `parseTimeString` on blur / Enter. Stores a canonical 24-hour
  `"HH:mm"` string (`hour12` is display-only). Bridge + RBAC +
  `FieldLayoutShell`.
- **`<DateRangePicker>`** — a form-bound start/end date field: a read-only
  input paired with a dual-month range calendar popup, built on the new
  `useDateRange` engine. Stores a `{ start, end }` pair of ISO dates.

### Changed

- **BREAKING — `<DateTimePicker>` replaced.** The legacy native-input
  `DateTimePicker` (HTML `datetime-local` / `date` / `time`) is replaced by
  a custom component — a `Calendar` popup paired with a time list, on
  `@dashforge/calendar-core`. New storage contract: a naive ISO datetime
  `"YYYY-MM-DDTHH:mm"` (no seconds, no timezone). The `mode` prop is
  removed — use `DatePicker` for date-only, `TimePicker` for time-only;
  `min` / `max` / `step` / `onValueChange` become `minDate` / `maxDate` /
  `stepMinutes` / `onChange`. The `DateTimePickerMode` type export is
  removed. No deprecation cycle — the library has no consumers yet.

### Dependencies

- Requires **`@dashforge/calendar-core` `0.2.0-beta`** — the `useDateRange`
  engine.

## [0.2.4-beta] — 2026-05-20

**Sprint 7 — Calendar suite (part 1).** Adds the first two components of
the custom date-picker suite, built on the new shared headless engine
`@dashforge/calendar-core`.

### Added

- **`<Calendar>`** — a standalone, inline month-grid date primitive.
  Renders the `useCalendar` view-model from `@dashforge/calendar-core`
  with MUI primitives + the Dashforge theme; full WCAG grid pattern with
  roving tab-index keyboard navigation. Controlled / uncontrolled
  selection, `minDate` / `maxDate`, explicit + predicate disabled dates,
  configurable week-start day, `Intl`-localized labels.
- **`<DatePicker>`** — a bridge-integrated single-date form field: a
  read-only input paired with a `<Calendar>` popup (MUI `Popper`).
  Integrates with the form bridge, RBAC, and `FieldLayoutShell`. Stores a
  plain ISO `YYYY-MM-DD` date (no time, no timezone — removing the DST
  round-trip hazards of the legacy native `DateTimePicker`, which stays
  available).

### Fixed

- **`Select` / `Autocomplete`** — resolved pre-existing implicit-`any`
  errors (`TS7006`) on the `sourceOptions.map` callback parameter. The
  `optionsFromFieldData ? … : …` ternary produced a union of array types
  that degraded the callback parameter to an implicit `any`; an explicit
  `sourceOptions` type annotation fixes it. Type-only change — no runtime
  behaviour change.

### Dependencies

- New dependency: **`@dashforge/calendar-core`** — the shared headless
  calendar engine.

## [0.2.3-beta] — 2026-05-16

- Lockstep version bump aligning the `fixed`-relationship release group
  with the patch released for `@dashforge/forms`, `@dashforge/ui-core`,
  and `@dashforge/rbac` (post-build `.d.ts` flattener + minor lint
  cleanup). **No runtime source change.**

### Tooling — known debt scoped

- `src/components/Autocomplete/Autocomplete.tsx` has several hooks
  called after `if (!isVisible) return null` early-returns — a real
  Rules-of-Hooks violation surfaced once `eslint-plugin-react-hooks`
  was wired into the workspace. The component is StrictMode-safe in
  practice because the `visibleWhen` decision is stable per mount,
  but the lint error needs to be cleared by lifting ~200 LoC of
  hooks above the early-return guards. **Tracked as a dedicated
  follow-up — for now the rule is `off` ONLY for that one file via
  `eslint.config.mjs`. The rest of the package is strictly checked.**

### Context

- For the parallel `@dashforge/tw 0.1.0-beta` first public beta of
  the Tailwind ecosystem, see the
  [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md).

## [0.2.2-beta] — 2026-05-15

- Version bump for lockstep peer alignment with the workspace `0.2.2-beta`
  maintenance release. This package has no source change.
- See the
  [top-level 0.2.2-beta notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#022-beta--2026-05-15)
  for cross-package context (`@dashforge/theme-mui` `MuiAlert` v9 fix +
  F1 scaffolding of the `@dashforge/tw-*` Tailwind ecosystem as private,
  unpublished packages — the MUI side of the form components in this
  package is unaffected).

## [0.2.1-beta] — 2026-05-14

- Version bump for lockstep peer alignment with the workspace `0.2.1-beta`
  bug-fix release (`@dashforge/forms` `DashForm` `resolver` passthrough fix).
  This package has no source change. See the
  [top-level 0.2.1-beta notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#021-beta--2026-05-14).

## [0.2.0-beta] — 2026-05-14

### Changed

- **All 10 form components migrated to the simplified bridge access
  pattern.** Under the `0.2.0-beta` freeze, `register` / `unregister` /
  `getValue` / `setValue` / `getError` / `isTouched` / `isDirty` /
  `subscribeField` are no longer optional on `DashFormBridge`. The
  defensive `bridge.method?.(...)` double-chain has been simplified to
  `bridge.method(...)` in:
  - `TextField`, `Textarea`, `Select`, `Autocomplete`, `RadioGroup`,
    `Checkbox`, `Switch`, `NumberField`, `DateTimePicker`, `OTPField`.
  - Helper modules `textField.select.ts` and `textField.validation.ts`.

  Semantics are unchanged (`bridge` itself is still nullable, so the
  outer `if (!bridge)` / `bridge?.` guard remains; only the second
  optional chain is dropped).

- **`createMockBridge`** (in `test-utils/mockBridge.ts`) updated to the
  new contract: implements the now-required `subscribeField` (broadcast
  style — every listener fires on any state mutation), drops the four
  removed version-string getters, and updates its JSDoc to describe the
  new reactivity model.

- **`renderWithRuntime`** test wrapper docstring updated to describe
  reactivity via `subscribeField` listeners instead of the legacy
  version getters.

- **`Select.test.tsx`** and **`Select.characterization.test.tsx`** mock
  bridges updated: removed the four deprecated assertions, added
  `unregister` / `isDirty` / `subscribeField` to satisfy the required
  surface. `Select.test.tsx`'s wrapper now uses a per-effect notifier
  that wakes subscribed listeners on every relevant RHF state change.

### Documentation

- **README rewritten** to reflect the current API surface:
  - Peer-dep line corrected to `@mui/material@^9.0.0` (was a stale
    `^7.0.0`).
  - Peer-dep versions of `@dashforge/*` updated to `^0.2.0-beta`.
  - Usage example uses the actual exported names (`TextField`,
    `Select`, `Checkbox` — not the fabricated `DashTextField` /
    `DashSelect` / `DashButton` from the old boilerplate).
  - "What you get" section enumerates the real catalog of form inputs
    + layout + feedback primitives + RBAC integration.
  - "Documentation" section linking the package CHANGELOG, top-level
    CHANGELOG, `MIGRATION.md`, and the roadmap.

### Test totals

- `@dashforge/ui`: **484 / 485** passing, 1 skipped (unchanged from
  `0.1.9-alpha`).

### Backwards compatibility

For application code consuming `@dashforge/ui` form components inside a
`DashFormProvider`, no migration is required — component public APIs
are unchanged. Custom test fixtures that rely on a mocked bridge
should be updated to match the new contract; see
[`MIGRATION.md`](https://github.com/kensaadi/dashforge/blob/main/MIGRATION.md#019-alpha--020-beta).

## [0.1.9-alpha] — 2026-05-13

### Added

- **3 new unit tests for `DateTimePicker` `lastValidIsoRef` fallback.**
  `src/components/DateTimePicker/DateTimePicker.unit.test.tsx` now
  documents the time-mode editing behavior: (1) the picker preserves
  the last valid ISO when the bridge briefly returns an empty string
  mid-edit (the `||` vs `??` fallback path), (2) the ref stays at the
  last NON-EMPTY ISO across multiple edit cycles, (3) with no previous
  valid ISO the fallback degrades gracefully to "today" without
  crashing. Pure behavioral lockdown of existing code — no source
  change to `DateTimePicker.tsx`.

### Test totals

- `@dashforge/ui`: **484 / 485** passing, 1 skipped (was 481 / 482;
  +3 from the new `lastValidIsoRef` cases).

### Backwards compatibility

No public API change. No behavioral change. No prop signature change
on `DateTimePicker` or any other component. Consumers on `^0.1.8-alpha`
can upgrade to `0.1.9-alpha` with no code change.

## [0.1.8-alpha] — 2026-05-13

### Changed

- **Stale dev warning corrected.** The dev-only `console.warn` emitted by
  `Autocomplete` and `Select` when a stored value can't be resolved against
  the loaded options used to say `"The form value remains unchanged (no
  automatic reset)"`. That hasn't been true since `0.1.6-alpha` — the
  components actually auto-reset the value to `null`. The message now
  accurately reflects the runtime behavior and mentions the version that
  introduced auto-reset.

### Internal

- Packaging: the published tarball now includes `CHANGELOG.md`.

## [0.1.7-alpha] — 2026-05-11

### Changed

- **MUI v9 slotProps migration.** Peer dependency `@mui/material` bumped from
  `^7.0.0` to `^9.0.0`. All 9 form components migrated from the deprecated
  `InputProps` / `inputProps` / `InputLabelProps` / `inputRef` props to the
  v9 `slotProps` API:

  | Old prop          | New location                       |
  | ----------------- | ---------------------------------- |
  | `inputRef`        | `slotProps.htmlInput.ref` (TextField family) or `slotProps.input.ref` (SwitchBase family) |
  | `InputProps`      | `slotProps.input`                  |
  | `inputProps`      | `slotProps.htmlInput`              |
  | `InputLabelProps` | `slotProps.inputLabel`             |

  Touched: `TextField`, `Textarea`, `Select` (via `textField.select.ts`),
  `Autocomplete` (`params.InputProps` → `params.slotProps.input` inside
  `renderInput`), `Checkbox`, `Switch`, `DateTimePicker`. `NumberField` and
  `RadioGroup` did not use the deprecated props internally.

- Non-form components also adapted to v9:
  - `LeftNav`: `PaperProps` → `slotProps.paper`; `ModalProps` → `slotProps.root`.
    Without this, the `role="navigation"` and `data-dash-open` attributes were
    silently dropped under v9.
  - `Snackbar`: `TransitionComponent` → `slots.transition`. Slide `direction`
    prop now flows through `slotProps.transition`.

### Fixed

- Eliminated the four persistent React deprecation warnings that fired on
  every render of every form component under MUI v9 (`InputProps`,
  `inputProps`, `InputLabelProps`, `inputRef`).
- `LeftNav` accessibility: the `role="navigation"` landmark is back.

### Internal

- 19 existing tests in `Snackbar`, `ConfirmDialog` and `LeftNav` updated to
  assert against the new MUI v9 atomic class names (compound classes like
  `MuiAlert-filledSuccess` split into `MuiAlert-filled` + `MuiAlert-colorSuccess`).

## [0.1.6-alpha] — 2026-05-10

### Added

- **Per-field subscriptions** via the new `useDashFieldMeta(name)` hook from
  `@dashforge/forms`. All form components migrate from the legacy
  `void bridge?.errorVersion;`-style global subscribe to per-field subscribe.
  Editing field `B` no longer re-renders field `A`.
- **Auto-reset for unresolved Select / Autocomplete values.** When loaded
  options no longer contain the current value (e.g. a parent field changed
  and a reaction reloaded options for a different scope), the form value is
  now auto-cleared to `null` so the user can pick a valid option.
- **`DateTimePicker.layout` prop** — `'stacked'` (default) or `'inline'`.
  `'floating'` is silently downgraded to `'stacked'` with a dev warning,
  since native date/time inputs always render a placeholder mask that
  overlaps the floating label.

### Fixed

- `useAccessState` hooks-rules violation under React 19 StrictMode (used to
  wrap `useRbac()` in try/catch).
- Memory leak on dynamic field unmount: bridge-bound components now defer
  `bridge.unregister(name)` to `queueMicrotask` so cleanup only fires on
  real unmount, not on every bridge identity change.
- `DateTimePicker` time-mode losing the date component during typing.

## [0.1.5-alpha] and earlier

See git history at <https://github.com/kensaadi/dashforge/commits/main/libs/dashforge/ui>.
