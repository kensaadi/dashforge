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

## [1.0.0] — 2026-05-23

**Stable release.** First semver-stable version. The public API is now
governed by strict semver — any future breaking change requires a major
bump. Functionally identical to the previous beta tarball.

- Version: `1.0.0`
- Cross-package `@dashforge/*` peer-dependency ranges updated to `^1.0.0`.
- See the [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#100---2026-05-23) for the coordinated release context.
- See [`MIGRATION.md`](https://github.com/kensaadi/dashforge/blob/main/MIGRATION.md) for the upgrade guide from any `0.x-beta` to `1.0.0` (no code changes required).

## [0.2.0-beta] — 2026-05-20

**Sprint 6 — theme core hardening.** Adds the shadow/elevation token
axis. Released together with `@dashforge/tw-theme 0.2.0-beta` and
`@dashforge/tw 0.9.0-beta`.

### Added

- **`TWShadowTokens` interface** + **`TWTheme.shadow`** field — the
  box-shadow / elevation scale (`none` / `sm` / `DEFAULT` / `md` /
  `lg` / `xl` / `2xl`). `defaultTWThemeLight` + `defaultTWThemeDark`
  both expose it via the shared `sharedShadow` constant. Values
  match Tailwind's battle-tested `boxShadow` defaults verbatim — the
  point of theming shadow is to make it runtime-patchable
  (`patchTheme({ shadow: { md: '…' } })`) and part of the Dashforge
  identity, NOT to redesign the elevation language.
  - `<Box elevation={0..5}>` maps onto this scale
    (`0→none, 1→sm, 2→DEFAULT, 3→md, 4→lg, 5→xl`) — and is now
    theme-controlled with zero `<Box>` code change (the existing
    `shadow-*` utility classes resolve to CSS-var refs via the
    `dashforgePreset()` `boxShadow` extend).
  - Mode-agnostic for now (shared light + dark). Dark-mode-specific
    shadow tuning is folded into the deferred theme "design pass" —
    see `@dashforge/tw-theme/THEME-CORE-AUDIT.md`.

### Changed

- **`TWTheme`** now has a required `shadow` field. Consumers building
  a custom `TWTheme` object by hand must add it — the shipped
  `defaultTWTheme*` exports already include it, so consumers that
  spread/patch the defaults are unaffected.
- `meta.version` on the default themes bumped `0.0.1` → `1.0.0`
  (semver of the theme *definition*, distinct from the package
  version).

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
