# Changelog — @dashforge/ui

All notable changes to `@dashforge/ui` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
with `-alpha` / `-beta` / `-rc` pre-release tags.

> For the cross-package release context, see the
> [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md).

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
