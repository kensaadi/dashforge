# Changelog — @dashforge/ui-core

All notable changes to `@dashforge/ui-core` are documented in this file.

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
