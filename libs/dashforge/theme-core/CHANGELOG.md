# Changelog — @dashforge/theme-core

All notable changes to `@dashforge/theme-core` are documented in this file.

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

- Lockstep version bump aligning the `fixed`-relationship release group
  with the patch released for `@dashforge/forms`, `@dashforge/ui-core`,
  and `@dashforge/rbac` (post-build `.d.ts` flattener + minor lint
  cleanup). **This package has no source change.**
- For context on the parallel `@dashforge/tw 0.1.0-beta` first public
  beta of the Tailwind ecosystem, see the
  [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md).

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
  This package has no source change.

## [0.1.9-alpha] — 2026-05-13

- Version bump only. No source change.
- See the
  [top-level 0.1.9-alpha notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#019-alpha--2026-05-13)
  for the cross-package release context (test coverage + docs polish;
  zero functional changes).

## [0.1.8-alpha] — 2026-05-13

- Packaging: the published tarball now includes `CHANGELOG.md` so consumers
  can read release history directly from `node_modules/@dashforge/theme-core/`.
- Version bump for peer alignment with the rest of the workspace.

## [0.1.7-alpha] — 2026-05-11

- Version bump for peer alignment with the workspace's MUI v9 migration.
  No public API changes.

## [0.1.6-alpha] — 2026-05-10

- Version bump for peer alignment. No public API changes.

## [0.1.5-alpha] and earlier

See git history at <https://github.com/kensaadi/dashforge/commits/main/libs/dashforge/theme-core>.
