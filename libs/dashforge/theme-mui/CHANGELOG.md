# Changelog — @dashforge/theme-mui

All notable changes to `@dashforge/theme-mui` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
with `-alpha` / `-beta` / `-rc` pre-release tags.

> For the cross-package release context, see the
> [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md).

## [2.0.0] — 2026-09-28

**Every `@dashforge/*` package moves to `2.0.0` together.** Until now each
library carried its own number and there was no single version to name.
The lockstep is not a preference: internal dependencies are declared with
`workspace:*`, which pnpm rewrites at pack time to the EXACT sibling
version, so publishing a subset would pin a 2.0.0 package to whichever 1.x
its siblings happened to be at, and a consumer resolving two copies of the
engine is a duplicate-React-context failure.

**What this means for you:** upgrade all `@dashforge/*` packages in the
same step. A mixed 1.x / 2.0.0 install will not resolve.

No functional change. This package's public surface is identical to
`1.0.0`; the major is the workspace-wide alignment described below.

### Fixed

- **A clean checkout could not be built, and a package built from one
  shipped without its types.** `tsBuildInfoFile` sat at the project root
  instead of inside `dist`, so deleting `dist` left the incremental cache
  behind. `tsc --build` then read a valid cache describing declarations
  that no longer existed, declared the project up to date and emitted
  nothing, and any dependent failed with `TS6305`. It survived this long
  only because nothing had ever wiped `dist`: every run reused the
  previous one's output. Verified by deleting every `dist`,
  `.tsbuildinfo` and `out-tsc` in the workspace and building from there.

### Changed

- **Declaration output is deterministic.** `@nx/rollup` hard-codes
  `declaration: true` and `rootDir: projectRoot`, so the bundler emitted a
  second full copy of every declaration under `dist/src` plus a one-line
  `dist/index.d.ts` re-export wrapper, while `tsc` emitted the real flat
  tree. Whichever target ran last decided what the package published.
  `typecheck` now always runs after `build`, emits the declarations and
  drops the copy it makes redundant.

- Build artefacts (`*.d.ts.map`, `*.tsbuildinfo`) are excluded from the
  published tarball.

## [1.0.0] — 2026-05-23

**Stable release.** First semver-stable version. The public API is now
governed by strict semver — any future breaking change requires a major
bump. Functionally identical to the previous beta tarball.

- Version: `1.0.0`
- Cross-package `@dashforge/*` peer-dependency ranges updated to `^1.0.0`.
- See the [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#100---2026-05-23) for the coordinated release context.
- See [`MIGRATION.md`](https://github.com/kensaadi/dashforge/blob/main/MIGRATION.md) for the upgrade guide from any `0.x-beta` to `1.0.0` (no code changes required).

## [0.2.3-beta] — 2026-05-16

- Lockstep version bump aligning the `fixed`-relationship release group
  with the patch released for `@dashforge/forms`, `@dashforge/ui-core`,
  and `@dashforge/rbac` (post-build `.d.ts` flattener + minor lint
  cleanup). **This package has no source change.**
- For context on the parallel `@dashforge/tw 0.1.0-beta` first public
  beta of the Tailwind ecosystem, see the
  [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md).

## [0.2.2-beta] — 2026-05-15

### Fixed

- **`MuiAlert` per-severity overrides migrated to the MUI v6+ `variants`
  array.** The previous `styleOverrides` used compound slots
  (`standardSuccess`, `standardWarning`, `standardError`, `standardInfo`,
  `filledSuccess`, `filledWarning`, `filledError`, `filledInfo`). These
  keys were valid under MUI v5 but **removed from `MuiAlert`'s
  `styleOverrides` type in MUI v9**. Effect: the keys silently failed at
  runtime (no per-severity background / text color applied) and produced
  a `TS2353` typecheck error on `src/overrides/MuiAlert.ts:38`.

  The fix replaces the eight compound entries with a `variants` array
  matched on `{ severity, variant }` props — the MUI v6+ idiomatic
  pattern. Runtime visual effect for
  `<Alert severity="success|warning|error|info" variant="standard|filled">`
  restored; TS2353 cleared. Public API of `getMuiAlertOverrides()`
  unchanged, emitted `.d.ts` byte-identical with the previous release.

### Changed

- **README example** now imports the real `DashforgeThemeProvider`
  export (was a hypothetical name in the docs snippet, never matched a
  published symbol).

- See the
  [top-level 0.2.2-beta notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#022-beta--2026-05-15)
  for cross-package context (also includes the F1 scaffolding of the
  `@dashforge/tw-*` Tailwind ecosystem as private, unpublished packages).

## [0.2.1-beta] — 2026-05-14

- Version bump for lockstep peer alignment with the workspace `0.2.1-beta`
  bug-fix release (`@dashforge/forms` `DashForm` `resolver` passthrough fix).
  This package has no source change. See the
  [top-level 0.2.1-beta notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#021-beta--2026-05-14).

## [0.2.0-beta] — 2026-05-14

- Version bump for peer alignment with the workspace `0.2.0-beta` release.
- README peer-dependency line corrected: now states `@mui/material@^9.0.0`
  (the MUI v9 migration happened in `0.1.7-alpha`; the README copy had
  not been updated).
- See the
  [top-level 0.2.0-beta notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#020-beta--2026-05-14)
  for the cross-package release context. No source change to this package.

## [0.1.9-alpha] — 2026-05-13

- Version bump only. No source change.
- See the
  [top-level 0.1.9-alpha notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#019-alpha--2026-05-13)
  for the cross-package release context (test coverage + docs polish;
  zero functional changes).

## [0.1.8-alpha] — 2026-05-13

- Packaging: the published tarball now includes `CHANGELOG.md`.
- Version bump for peer alignment with the rest of the workspace.

## [0.1.7-alpha] — 2026-05-11

- **Peer dependency bumped**: `@mui/material` from `^7.0.0` to `^9.0.0`.
- Verified that all `styleOverrides` (MuiFormHelperText, MuiTextField, etc.)
  still function correctly under MUI v9's slot architecture — no override
  signature changes were needed.

## [0.1.6-alpha] — 2026-05-10

- Version bump for peer alignment. No public API changes.

## [0.1.5-alpha] and earlier

See git history at <https://github.com/kensaadi/dashforge/commits/main/libs/dashforge/theme-mui>.
