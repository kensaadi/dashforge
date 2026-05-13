# Changelog

All notable changes to @dashforge/forms will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.9-alpha] — 2026-05-13

### Added

- **5 new unit tests for `bridge.unregister`** (CR fix #3 verification).
  `src/core/DashFormProvider.unregister.test.tsx` covers the full
  lifecycle: bridge surface exposes `unregister(name)`, mount registers
  an engine node, direct `unregister(name)` removes both the engine
  node and the RHF value, real-unmount fires the deferred-microtask
  cleanup exactly once, and mount → unmount → remount of the same
  field name leaves no stale engine state. Locks in the cleanup pattern
  used by every UI form component (`TextField`, `Textarea`, `Checkbox`,
  `Switch`, `Select`, `Autocomplete`, `RadioGroup`, `NumberField`,
  `DateTimePicker`, `OTPField`) — the `mountedRef + queueMicrotask`
  guard introduced in `0.1.6-alpha`.

### Changed

- **JSDoc "decision tree" on `useDashFieldMeta`, `useDashFieldNode`,
  `useDashRegister`.** Each of the three field-scoped hooks now carries
  the same comparative table in its JSDoc, plus `@see` cross-references
  to the other two. The intent is to collapse the choice from "search
  docs" to "hover the symbol" — **Meta** for subscribing to per-field
  RHF state (`value`/`error`/`touched`/`dirty`/`submitCount`/
  `allowAutoError`), **Node** for reading Engine node state
  (`visibility`/`disabled`/`value`) for conditional rendering, **Register**
  for wiring a custom input that doesn't go through the Dashforge UI
  wrappers. Pure documentation, no runtime change, no API surface
  change.
- **Test cleanup — Option A (non-null assertion).** The 5 call sites of
  `bridge.register(name)` and the 1 call site of `bridge.isTouched(name)`
  in `DashFormProvider.resolver.test.tsx` now use the non-null assertion
  operator (`!`) on the optional bridge method, since `bridge` itself is
  already guarded by an `if (!bridge) throw` upstream. Drops 11 typecheck
  errors from the spec compile without touching production code or
  bridge types.

### Test totals

- `@dashforge/forms`: **133 / 133** passing (was 128 / 128; +5 from the
  new `bridge.unregister` suite).

### Backwards compatibility

No public API change. No behavioral change. Consumers on `^0.1.8-alpha`
can upgrade to `0.1.9-alpha` with no code change.

## [0.1.6-alpha] — 2026-05-10

### Added

- **`useDashFieldMeta(name)` hook**: canonical per-field subscription. Returns
  `{ value, error, touched, dirty, submitCount, allowAutoError }` and triggers
  a re-render only when the named field's state changes. Backed by
  `useSyncExternalStore` with a primitive-equality cache, so the snapshot
  reference is stable across no-op reads (no tear-loop).

### Changed

- **`DashFormProvider` bridge identity is now stable** across keystrokes. The
  `useMemo` that builds the bridge no longer depends on `valuesVersion` /
  `errorVersion` / `touchedVersion` / `dirtyVersion` / `submitCount` strings —
  reactivity is delegated to per-field listeners (`bridge.subscribeField`)
  instead. Result: `useContext(DashFormContext)` consumers no longer re-render
  on every keystroke.
- Internally maintains stable refs to `errors`, `touchedFields`, `dirtyFields`
  and `submitCount`, plus a `Map<fieldName, Set<listener>>` registry that the
  RHF subscription diffs against to fire only the fields whose state actually
  changed.

### Fixed

- **Bridge cleanup no longer destroys form values on first keystroke.**
  Components calling `bridge.unregister(name)` from a `useEffect` cleanup were
  previously seeing the cleanup fire on every render because the bridge
  identity changed every keystroke. With the stable bridge, plus the
  defer-via-`queueMicrotask` pattern in the UI components, cleanup runs only
  on real unmount.

## [0.1.5-alpha] - 2026-04-04

### Added

- **Resolver Pass-Through**: Added `resolver` prop to `DashFormProvider` to enable schema-based validation via React Hook Form's resolver contract
  - Supports validation libraries like Zod, Yup, Joi, etc. (via `@hookform/resolvers`)
  - Pure pass-through pattern - no validation libraries bundled
  - 100% backward compatible - existing field-level validation continues to work
  - When resolver provided, it becomes the primary validation source per React Hook Form behavior
  - See README.md for usage examples

- **Dynamic Field Arrays (V1)**: Added `useDashFieldArray` hook for managing dynamic lists of form fields
  - Thin adapter over React Hook Form's `useFieldArray` with Dashforge-style API
  - Pre-computed field names (no manual template strings needed)
  - Stable IDs for React keys across operations
  - Type-safe operations: `append`, `remove`, `move`, `insert`, `replace`
  - Dashforge-owned types (`DashFieldArrayItem`, `UseDashFieldArrayReturn`) designed for future optimization without breaking changes
  - **DX improvement only** - does NOT claim performance benefits over raw RHF in V1
  - No modifications to Bridge, Engine, Runtime, or Reactions systems
  - See README.md for usage examples

## [0.1.4-alpha] - 2024-xx-xx

_Initial alpha release - earlier changes not documented_
