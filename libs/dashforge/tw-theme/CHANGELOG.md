# Changelog — @dashforge/tw-theme

All notable changes to `@dashforge/tw-theme` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Status: scaffolding (`private: true`, not yet published to npm).** This
> package is part of the **`@dashforge/tw-*` Tailwind ecosystem**, built as
> a fully isolated stack sharing only the bridge layer
> (`@dashforge/forms` + `@dashforge/ui-core` + `@dashforge/rbac`) with the
> MUI side of Dashforge. Tokens, theme runtime, and components are
> duplicated intentionally — no shared "lowest common denominator" headless
> layer.

> For the cross-package release context, see the
> [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md).

## [Unreleased]

### Planned for F2

- Valtio-backed reactive theme store local to the tw ecosystem.
- Runtime CSS-vars injection (`--df-color-*`, `--df-radius-*`, etc.) for
  light/dark theme swap without page reload.
- Dark mode via `data-dash-theme="dark"` selector on `<html>`.

## [0.0.1] — 2026-05-15

### Added

- **Initial scaffolding (F1 of the *dashforge-tw* roadmap).**
  - `dashforgePreset()` — Tailwind preset factory that consumes
    `@dashforge/tw-tokens` and emits a partial `tailwindcss` config
    (extends `theme.colors`, `theme.spacing`, `theme.borderRadius`,
    `theme.fontSize`, `theme.fontFamily`, etc.).
  - `DashforgeTailwindProvider` — React shell component (placeholder
    wiring; full Valtio + CSS-vars injection lands in F2).
  - Rollup build (CJS + ESM + .d.ts). `types` path corrected from the
    Nx generator default (`./dist/index.esm.d.ts`) to `./dist/index.d.ts`
    to match the actual emitted declaration and align with the
    `ui-core` / `forms` / `theme-mui` convention.

- **`private: true`** in `package.json` — excluded from `nx.json`
  `release.projects` so the `0.0.x` scaffolding versioning is not swept
  by the published-set release cadence. Re-joins the fixed group at
  F2/F3 once the API stabilises.

- Smoke-tested in `~/projects/web/learn/dash` via `pnpm link` together
  with `@dashforge/tw-tokens` and `@dashforge/tw`. Browser build green.
