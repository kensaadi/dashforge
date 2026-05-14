# Changelog — @dashforge/theme-mui

All notable changes to `@dashforge/theme-mui` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
with `-alpha` / `-beta` / `-rc` pre-release tags.

> For the cross-package release context, see the
> [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md).

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
