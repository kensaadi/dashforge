# Changelog — @dashforge/tw-tokens

All notable changes to `@dashforge/tw-tokens` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> This package is part of the **`@dashforge/tw-*` Tailwind ecosystem**,
> built as a fully isolated stack sharing only the bridge layer
> (`@dashforge/forms` + `@dashforge/ui-core` + `@dashforge/rbac`) with
> the MUI side of Dashforge.

> For the cross-package release context, see the
> [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md).

## [0.1.0-beta] — 2026-05-16

First public beta, aligned with `@dashforge/tw 0.1.0-beta`.

### Added

- **Stable token surface**: `default*ThemeLight` / `default*ThemeDark`
  named exports, plus the `dashforgePreset()` Tailwind preset consumed
  by `@dashforge/tw`'s `tailwind.config`.
- **Neutral scale inversion**: dark mode swaps `neutral-50 ↔ neutral-950`,
  `neutral-100 ↔ neutral-900`, etc., so the same `bg-neutral-50` class
  used by every component renders the appropriate elevation in both
  modes (no per-component dark variants in the source).
- Brand role colors (`primary` / `secondary` / `success` / `warning` /
  `danger` / `info`) intentionally NOT inverted — brand identity is
  mode-stable across the catalog.

## [Unreleased]

### Added

- **`TWThemeMeta` interface** (in `types.ts`) — carries identity + active
  mode (`name`, `version`, `mode: 'light' | 'dark'`). Defined parallel
  to the MUI side's `DashforgeThemeMeta` but **without** importing from
  MUI tokens — full isolation per architecture plan v2.
- **`defaultTWThemeLight` + `defaultTWThemeDark`** named defaults
  shipped from `defaults.ts`. The dark variant inverts only the
  `neutral` scale along the tonal axis (50 ↔ 950, 100 ↔ 900, …);
  brand roles (primary/secondary/success/warning/danger/info) and
  non-color tokens (spacing/radius/fontSize) are shared between modes.
  This is the simplest defensible default that lets `setMode('dark')`
  in `@dashforge/tw-theme` demonstrate the full "two themes swap"
  semantics end-to-end without committing to brand-tone shifts that
  belong to design.
- **`TWTheme.meta`** field is now required on the root theme object —
  carries the active mode for runtime swap detection.

### Changed

- **`defaultTWTheme`** is now a back-compat alias for
  `defaultTWThemeLight`. F1 callers continue to compile unchanged.

## [0.0.1] — 2026-05-15

### Added

- **Initial scaffolding (F1 of the *dashforge-tw* roadmap).** Tailwind-shaped
  design tokens: 50-950 color scales (primary, secondary, success, warning,
  danger, info, neutral surfaces), spacing scale, radius tiers
  (`sm` / `md` / `lg` / `pill`), fontSize tiers (`xs` / `sm` / `md` / `lg` / `xl`),
  and font-family base. TS-only build (no Rollup — types + plain JS object
  exports are sufficient for a tokens package consumed by the preset).

- **`private: true`** in `package.json` — excluded from `nx.json`
  `release.projects` so the `0.0.x` scaffolding versioning is not swept
  by the published-set release cadence. Re-joins the fixed group at
  F2/F3 once the API stabilises.

- Smoke-tested in `~/projects/web/learn/dash` via `pnpm link` together
  with `@dashforge/tw-theme` and `@dashforge/tw`. Browser build green.
