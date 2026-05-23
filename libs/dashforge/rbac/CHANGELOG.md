# Changelog — @dashforge/rbac

All notable changes to `@dashforge/rbac` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
with `-alpha` / `-beta` / `-rc` pre-release tags.

> For the cross-package release context, see the
> [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md).

## [1.0.0] — 2026-05-23

**Stable release.** First semver-stable version. The public API is now
governed by strict semver — any future breaking change requires a major
bump. Functionally identical to the previous beta tarball.

- Version: `1.0.0`
- Cross-package `@dashforge/*` peer-dependency ranges updated to `^1.0.0`.
- See the [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#100---2026-05-23) for the coordinated release context.
- See [`MIGRATION.md`](https://github.com/kensaadi/dashforge/blob/main/MIGRATION.md) for the upgrade guide from any `0.x-beta` to `1.0.0` (no code changes required).

## [0.2.3-beta] — 2026-05-16

Workspace patch — shipped alongside `@dashforge/tw 0.1.0-beta`.

### Added

- **`scripts/flat-dts.cjs`** + Rollup `writeBundle` plugin — same
  post-build `.d.ts` flattener added across the three "wrapped"
  bridge packages (`forms`, `ui-core`, `rbac`). Fixes a TS bundler
  resolution bug where `export *` in the dist wrapper silently drops
  re-exports under `references`. Keeps `useAccessState` (the
  primary downstream consumer in `@dashforge/tw`) visible to the
  typecheck.

### Fixed

- **`core/errors.ts`**: dropped the trivially-inferable `code: string =`
  type annotation on the `RbacError` constructor parameter
  (`@typescript-eslint/no-inferrable-types`).

### Quality

- Workspace lint + typecheck + test + build all green across the
  seven `fixed`-relationship packages.

## [0.2.2-beta] — 2026-05-15

- Version bump for lockstep peer alignment with the workspace `0.2.2-beta`
  maintenance release. This package has no source change.
- See the
  [top-level 0.2.2-beta notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#022-beta--2026-05-15)
  for cross-package context (`@dashforge/theme-mui` `MuiAlert` v9 fix +
  F1 scaffolding of the `@dashforge/tw-*` Tailwind ecosystem as private,
  unpublished packages).

## [0.2.1-beta] — 2026-05-14

- Version bump for lockstep peer alignment with the workspace `0.2.1-beta`
  bug-fix release (`@dashforge/forms` `DashForm` `resolver` passthrough fix).
  This package has no source change. See the
  [top-level 0.2.1-beta notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#021-beta--2026-05-14).

## [0.2.0-beta] — 2026-05-14

- Version bump for peer alignment with the workspace `0.2.0-beta` release.
- See the
  [top-level 0.2.0-beta notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#020-beta--2026-05-14).
  This package has no source change. `useRbacOptional()` and the rest of
  the public API continue to pass 264 / 264 tests.

## [0.1.9-alpha] — 2026-05-13

- Version bump only. No source change.
- See the
  [top-level 0.1.9-alpha notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#019-alpha--2026-05-13)
  for the cross-package release context (test coverage + docs polish;
  zero functional changes). `useRbacOptional()` (added in `0.1.6-alpha`)
  continues to be covered by the existing `@dashforge/rbac` test suite
  (264 / 264 passing).

## [0.1.8-alpha] — 2026-05-13

- Packaging: the published tarball now includes `CHANGELOG.md`.
- Version bump for peer alignment with the rest of the workspace.

## [0.1.7-alpha] — 2026-05-11

- Version bump for peer alignment with the workspace's MUI v9 migration.
  No public API changes.

## [0.1.6-alpha] — 2026-05-10

### Added

- **`useRbacOptional()`** — non-throwing variant of `useRbac()` that returns
  `null` when no `RbacProvider` is present in the tree. Designed to be called
  unconditionally from access-aware hooks (e.g. `useAccessState` in
  `@dashforge/ui`) without violating React's rules of hooks.

## [0.1.5-alpha] and earlier

See git history at <https://github.com/kensaadi/dashforge/commits/main/libs/dashforge/rbac>.
