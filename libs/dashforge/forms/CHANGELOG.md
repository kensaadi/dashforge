# Changelog

All notable changes to @dashforge/forms will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.3-beta] — 2026-05-16

Workspace patch — surfaced together with the public beta of the
`@dashforge/tw-*` ecosystem (`@dashforge/tw 0.1.0-beta`).

### Added

- **`scripts/flat-dts.cjs`** + Rollup `writeBundle` plugin — post-build
  rewrites `dist/index.d.ts` from `export * from "./src/index"` to an
  explicit re-export of every symbol. Works around a TS bundler-resolution
  bug where `export *` in a dist wrapper drops a subset of re-exports
  (most visibly `useDashFieldMeta`) when downstream packages compile
  with `references` set. `@dashforge/tw`'s typecheck depends on this.

### Fixed

- **`DashForm.tsx`**: replaced the inline `onSubmit || (() => {})`
  noop with a named `noopSubmit` constant — clears
  `@typescript-eslint/no-empty-function` once the upgraded ESLint
  config takes effect, and makes the intent visible to readers.
- **`useDashFieldMeta.ts`**, **`useFieldRuntime.ts`**: extracted the
  inline `return () => {}` no-op unsubscribes into module-level
  `noopUnsubscribe` constants. **Bonus perf:** the subscribe callback
  now returns the same reference across renders, which keeps
  `useSyncExternalStore`'s identity check happy and avoids a small
  re-subscription churn in standalone (no-provider) mode.

### Quality

- ESLint workspace config now scopes `eslint-plugin-react-hooks` to
  `@dashforge/tw` (the only package that explicitly opted in) and
  relaxes 3 noisy-in-tests rules
  (`no-empty-function` / `no-non-null-assertion` / `no-explicit-any`)
  for `**/*.{test,spec}.*` + `**/__tests__/**`. Production code
  remains strictly checked.
- Workspace-wide `lint`, `typecheck`, `test`, `build` all green
  across the seven `fixed`-relationship packages.

## [0.2.2-beta] — 2026-05-15

- Version bump for lockstep peer alignment with the workspace `0.2.2-beta`
  maintenance release. This package has no source change.
- See the
  [top-level 0.2.2-beta notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#022-beta--2026-05-15)
  for cross-package context (`@dashforge/theme-mui` `MuiAlert` v9 fix +
  F1 scaffolding of the `@dashforge/tw-*` Tailwind ecosystem as private,
  unpublished packages — the new `@dashforge/tw` consumes the same
  `DashFormProvider` from this package).

## [0.2.1-beta] — 2026-05-14

### Fixed

- **`DashForm` dropped the `resolver` prop.** The `DashForm` convenience
  wrapper destructured `engine` / `defaultValues` / `debug` / `mode` /
  `reactions` and spread the rest onto the `<form>` element — but
  `resolver` was not in that list, so it landed on the raw `<form>` DOM
  node instead of reaching React Hook Form. `<DashForm resolver={...}>`
  (schema-based validation via Zod / Yup / etc.) silently validated
  nothing. The fix destructures `resolver` and forwards it to
  `DashFormProvider`. `DashFormProvider` itself was never affected.

- **`DashFormProvider` skipped `useForm()` during SSR.** The provider
  wrapped `useForm()` in an `isClient ? useForm() : { ...stub }` ternary
  to dodge a *"Cannot read properties of null (reading 'useRef')"* crash
  during server-side rendering. This violated the Rules of Hooks (a hook
  behind a condition) and — worse — the SSR stub exposed `control: {}`,
  which broke `useFieldArray` / `useDashFieldArray` under SSG with
  *"control._getFieldArray is not a function"*. `useForm()` is now called
  unconditionally (it is SSR-safe by design); `useDashFieldArray` works
  correctly under SSR / SSG. The original `useRef` crash is a
  dual-React-instance symptom — dedupe `react` / `react-dom` in the
  consumer's bundler instead.

### Added

- **`src/components/DashForm.test.tsx`** — 4 regression tests: no
  `resolver` attribute leaks onto `<form>`, submit invokes the resolver,
  resolver errors block `onSubmit`, children render inside the form.

### Test totals

- `@dashforge/forms`: **137 / 137** passing (+4 from the new `DashForm`
  regression suite).

### Upgrade notes

- If `<DashForm resolver={...}>` appeared to do nothing on `0.2.0-beta`,
  this release fixes it — upgrade with no code change.
- If you render Dashforge forms with SSR / SSG, `useForm()` now runs
  during the server pass as it should. Ensure your bundler dedupes
  `react` / `react-dom` to a single instance.

## [0.2.0-beta] — 2026-05-14

### Removed (breaking)

- `DashFormProvider` no longer emits the four deprecated bridge fields
  `errorVersion`, `touchedVersion`, `dirtyVersion`, `valuesVersion`. The
  corresponding interface members are also gone from `DashFormBridge` in
  `@dashforge/ui-core`. Consumers should subscribe via
  `subscribeField(name, listener)` + the per-field getters. See
  [`MIGRATION.md`](https://github.com/kensaadi/dashforge/blob/main/MIGRATION.md#019-alpha--020-beta)
  for the upgrade pattern.

### Changed

- **`DashFormProvider`** cleaned up: the now-unused version-string
  derivation (`JSON.stringify(errors)` etc.) and the matching refs +
  bridge getters have been removed (~30 lines of dead code). The
  per-field `subscribeField` notification path (introduced in
  `0.1.6-alpha`) is the single source of truth for re-renders. The
  `useEffect` deps for the `diffAndNotify` notifier now depend on the
  RHF state objects directly (`errors` / `touchedFields` /
  `dirtyFields`) instead of the version strings — equivalent behavior,
  shorter chain.
- **`useDashFieldMeta`** call sites simplified to take advantage of the
  freeze: `bridge.getValue?.(name)` → `bridge.getValue(name)`, etc.
  Semantics unchanged.

### Added — `@internal` markers

The following symbols remain exported from `src/index.ts` for
backwards compatibility but are now flagged `@internal`:

- `FormEngineAdapter` and its two types `IFormEngineAdapter` /
  `FormEngineAdapterOptions`. Implementation detail used by
  `DashFormProvider`; not part of the stable public surface.
- `createRuntimeStore` and `DEFAULT_FIELD_RUNTIME` plus the
  `RuntimeStore` type. The store is created and owned by
  `DashFormProvider`; UI consumers use `useFieldRuntime`.
- `createReactionRegistry` and the `ReactionRegistry` type. Consumers
  author reactions via the `ReactionDefinition` type and pass them to
  `DashFormProvider`; the registry itself is internal orchestration.

### Test additions / refactor

- `DashFormProvider.unregister.test.tsx` continues to pass (covers the
  CR fix #3 unregister deferred-microtask cleanup).
- `useFieldRuntime.test.tsx` gains a small `createTestBridge(overrides)`
  helper that fills the now-required core methods with no-op stubs, so
  each test only has to declare the runtime-API methods it actually
  exercises.
- `reactionIntegration.test.tsx` continues to pass with the explicit
  `ReactionWhenContext` / `ReactionRunContext` annotations introduced
  in `0.1.9-alpha`.

### Test totals

- `@dashforge/forms`: **133 / 133** passing (unchanged from `0.1.9-alpha`).

### Backwards compatibility

For application code using `@dashforge/ui` components inside a
`DashFormProvider`, nothing breaks. The only consumers that need
migration work are custom bridge implementations and custom test
fixtures. See
[`MIGRATION.md`](https://github.com/kensaadi/dashforge/blob/main/MIGRATION.md#019-alpha--020-beta).

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
