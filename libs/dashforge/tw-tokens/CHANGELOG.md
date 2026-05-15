# Changelog — @dashforge/tw-tokens

All notable changes to `@dashforge/tw-tokens` are documented in this file.

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
