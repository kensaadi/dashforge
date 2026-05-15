# Changelog — @dashforge/ui-core

All notable changes to `@dashforge/ui-core` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
with `-alpha` / `-beta` / `-rc` pre-release tags.

> For the cross-package release context, see the
> [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md).

## [0.2.2-beta] — 2026-05-15

- Version bump for lockstep peer alignment with the workspace `0.2.2-beta`
  maintenance release. This package has no source change.
- See the
  [top-level 0.2.2-beta notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#022-beta--2026-05-15)
  for cross-package context (`@dashforge/theme-mui` `MuiAlert` v9 fix +
  F1 scaffolding of the `@dashforge/tw-*` Tailwind ecosystem as private,
  unpublished packages — the bridge interface in this package is the
  same shared contract the new `@dashforge/tw` consumes).

## [0.2.1-beta] — 2026-05-14

- Version bump for lockstep peer alignment with the workspace `0.2.1-beta`
  bug-fix release (`@dashforge/forms` `DashForm` `resolver` passthrough fix).
  This package has no source change. See the
  [top-level 0.2.1-beta notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#021-beta--2026-05-14).

## [0.2.0-beta] — 2026-05-14

### Removed (breaking)

- **`DashFormBridge.errorVersion` / `touchedVersion` / `dirtyVersion` /
  `valuesVersion`**. These four `@deprecated` (since `0.1.6-alpha`)
  "version string" fields are gone from the bridge interface.
  Consumers should subscribe via `subscribeField(name, listener)` and
  read the per-field getters (`getValue` / `getError` / `isTouched` /
  `isDirty`) instead. See
  [`MIGRATION.md`](https://github.com/kensaadi/dashforge/blob/main/MIGRATION.md#019-alpha--020-beta)
  for the upgrade pattern.

### Changed (contract tightening)

- **`DashFormBridge` required-core surface**: `register`, `unregister`,
  `getValue`, `setValue`, `getError`, `isTouched`, `isDirty`,
  `submitCount`, `subscribeField` are no longer optional (`?:`) on the
  type. Implementations must provide them when the bridge is non-null;
  the standalone (no-provider) mode is preserved by `bridge === null`
  from `useContext(DashFormContext)`.
- **`DashFormBridge` optional runtime tier stays optional**:
  `getFieldRuntime`, `setFieldRuntime`, `subscribeFieldRuntime`, and
  `debug` remain `?:`. They are feature-gated by the implementation.

### Added — `@internal` markers

The following symbols remain exported from `src/index.ts` for
backwards compatibility but are now flagged `@internal` in JSDoc.
Tooling that respects the marker (TypeDoc, `api-extractor`) will hide
them; consumers should treat them as unstable.

- **Core**: `DependencyTracker`, `RuleEvaluator`, `DependencyGraph`,
  `DependencyTrackerConfig`, `RuleEvaluatorConfig`, `EvaluationStats`.
- **Store**: `createStore`, `resetStore`, `getEvaluationDepth`,
  `incrementEvaluationDepth`, `decrementEvaluationDepth`,
  `resetEvaluationDepth`, plus the `Store`, `StoreConfig`,
  `StoreMetadata` types.
- **Integrations**: `createMockRHFResult` (test-only helper).

### Documentation

- README enhanced with a "Documentation" section linking the package
  CHANGELOG, the top-level CHANGELOG, `MIGRATION.md`, and the roadmap.

### Backwards compatibility

- See the
  [top-level 0.2.0-beta notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#020-beta--2026-05-14)
  and [`MIGRATION.md`](https://github.com/kensaadi/dashforge/blob/main/MIGRATION.md#019-alpha--020-beta).
- For application code using `@dashforge/ui` components in a
  `DashFormProvider`, nothing breaks. The only consumers that need
  action are custom bridge implementations.

## [0.1.9-alpha] — 2026-05-13

- Version bump only. No source change to the bridge or engine.
- See the
  [top-level 0.1.9-alpha notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#019-alpha--2026-05-13)
  for the cross-package release context. The `bridge.unregister?(name)`
  API introduced in `0.1.6-alpha` now has dedicated unit-test coverage
  in `@dashforge/forms` (5 new cases covering API exposure, mount,
  direct unregister, real-unmount-via-microtask, and the mount → unmount
  → remount cycle) — no `DashFormBridge` shape change.

## [0.1.8-alpha] — 2026-05-13

- Packaging: the published tarball now includes `CHANGELOG.md`.
- Version bump for peer alignment with the rest of the workspace.

## [0.1.7-alpha] — 2026-05-11

- Version bump for peer alignment with the workspace's MUI v9 migration.
  No `DashFormBridge` interface or `Engine` changes.

## [0.1.6-alpha] — 2026-05-10

### Added

- **`DashFormBridge.subscribeField?(name, listener)`** — per-field subscription
  primitive. Used by `useDashFieldMeta` (in `@dashforge/forms`) so UI components
  only re-render when their own field's state changes.
- **`DashFormBridge.unregister?(name)`** — releases engine + RHF state for a
  field on unmount. Both methods are optional for backwards compatibility.

## [0.1.5-alpha] and earlier

See git history at <https://github.com/kensaadi/dashforge/commits/main/libs/dashforge/ui-core>.
