# Changelog — @dashforge/rbac

All notable changes to `@dashforge/rbac` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
with `-alpha` / `-beta` / `-rc` pre-release tags.

> For the cross-package release context, see the
> [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md).

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
