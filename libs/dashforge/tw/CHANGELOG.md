# Changelog — @dashforge/tw

All notable changes to `@dashforge/tw` are documented in this file.

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

### Planned for F3 (sprint 22-24/05/2026)

- **Tier-1 form components**: `Button`, `TextField`, `Checkbox`, `Switch`.
  Variant API via `tailwind-variants` (TV) with `slots` for fine-grained
  override (`className` for root + `styles={{ slot1, slot2 }}` per-slot).
  Primitives: Radix UI for general A11y, with React Aria Components
  reserved for the 5 components needing WCAG AAA
  (DateField / DatePicker / Calendar / NumberField / ComboBox — these
  arrive in later phases).
- Bridge integration via `@dashforge/forms` `DashFormContext` — same
  contract as `@dashforge/ui`, validation / RBAC / `visibleWhen` logic
  reused 1:1.

## [0.0.1] — 2026-05-15

### Added

- **Initial scaffolding (F1 of the *dashforge-tw* roadmap).** Empty
  components surface; package exports the cross-cutting utilities the
  later component code will rely on:
  - `cn()` — `clsx` + `tailwind-merge` wrapper for safe class
    concatenation with last-wins conflict resolution.
  - `tv` — re-export of `tailwind-variants` so consumers (and the
    forthcoming F3 components) have a single canonical import path.
- Rollup build (CJS + ESM + .d.ts). `types` path corrected from the Nx
  generator default (`./dist/index.esm.d.ts`) to `./dist/index.d.ts`.
- `tailwind-merge` added as a regular dependency (peer-required by
  `tailwind-variants`; consumers shouldn't have to know that detail).

- **`private: true`** in `package.json` — excluded from `nx.json`
  `release.projects` so the `0.0.x` scaffolding versioning is not swept
  by the published-set release cadence. Re-joins the fixed group at
  F2/F3 once the API stabilises and the first components ship.

- Smoke-tested in `~/projects/web/learn/dash` via `pnpm link` together
  with `@dashforge/tw-tokens` and `@dashforge/tw-theme`. Browser build
  green.
