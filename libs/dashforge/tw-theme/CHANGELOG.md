# Changelog — @dashforge/tw-theme

All notable changes to `@dashforge/tw-theme` are documented in this file.

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

- **`DashforgeTailwindProvider`** stable entry point: mount once near
  the app root, exposes the reactive theme runtime via context.
- Production-tested with the F3 → F7 component surface (16 components
  in `@dashforge/tw`): every component reads CSS variables the
  provider injects, so light/dark toggle reflows instantly with no
  per-component re-mount.
- **`flat-dts.cjs`** post-build wrapper (mirrors the same workaround
  added to `@dashforge/forms` / `@dashforge/ui-core` / `@dashforge/rbac`)
  for the TS bundler `export *` regression under project references.

## [Unreleased]

### Added — F2 (reactive runtime, 2026-05-15)

- **Valtio-backed reactive theme store** local to the tw ecosystem.
  Isolated from `@dashforge/theme-core` (MUI side) — separate proxy,
  separate localStorage key (`dashforge:tw-theme:mode`), separate
  cross-tab event scope.
- **`useDashTWTheme()` reactive hook** returns `DeepReadonly<TWTheme>`.
  Type signature does NOT leak `Snapshot<T>` from `valtio` — consumer
  never needs to know Valtio is the runtime backbone.
- **Imperative actions**: `setTheme(theme)`, `setMode('light'|'dark')`,
  `toggleMode()`, `replaceTheme(theme)` (alias of setTheme),
  `patchTheme(deepPartial)` for runtime brand overrides without
  rebuilding Tailwind.
- **`<DashforgeTailwindProvider>` rewritten** to:
  - Subscribe to the store via `useDashTWTheme`
  - Inject the resolved CSS variables on `document.documentElement`
    (`--df-tw-color-*`, `--df-tw-spacing-*`, etc.) via
    `setProperty` on every theme mutation
  - Mirror `theme.meta.mode` to a `data-dash-tw-theme` attribute on
    `<html>` so Tailwind's
    `darkMode: ['selector', '[data-dash-tw-theme="dark"]']` resolves
  - Apply optional one-shot `initialTheme` / `initialMode` overrides
    on mount (StrictMode-safe via a ref guard)
- **`dashforgePreset()` rewritten** to emit **CSS variable references**
  with `<alpha-value>` support, not literal hex values. Pattern:
  `rgb(var(--df-tw-color-primary-500) / <alpha-value>)` → keeps
  modifier syntax (`bg-primary-500/50`) working while letting the
  runtime swap the theme without rebuilding Tailwind. Spacing, radius,
  and fontSize tokens point at the corresponding `var(--df-tw-…)`
  refs too.
- **`twThemeCssVars(theme)`** pure-function CSS-var map builder
  (exported for advanced consumers — e.g. theme-aware SSR helpers
  that need to inject vars by hand).
- **`hexToRgbTriplet(hex)`** pure helper that converts `'#3b82f6'` /
  `'3b82f6'` to the `'59 130 246'` triplet required by Tailwind's
  alpha-value format. Throws on shorthand or invalid hex (surface the
  defect at first paint, not deep inside Tailwind's class resolver).
- **`serverSideStyleTag(theme)` SSR helper** renders a complete
  inline `<style id="dashforge-tw-init">:root[data-dash-tw-theme="<mode>"]{…}</style>`
  block ready to drop into the document `<head>`. Prevents FOUC on
  first paint of SSR apps (Next.js, Remix, Astro).
- **Priority cascade for initial mode**: `localStorage` →
  `matchMedia('(prefers-color-scheme: dark)')` → `'light'`. Hardened
  against Safari private-mode storage exceptions and missing
  `matchMedia` (graceful degradation).
- **Cross-tab sync** via the `storage` window event. Mode changes in
  one tab propagate to all others without explicit wiring on the
  consumer side.

### Changed

- **Dependencies**: added `valtio ^2.3.0` as a regular `dependencies`
  entry (NOT a peer). Consumers never need to install or import
  Valtio — the type leak is also eliminated, see
  `useDashTWTheme.d.ts` final signature.
- **`@vitejs/plugin-react`** wired in `vite.config.ts` +
  `vitest.config.mts` so the Provider spec can mount React via
  `@testing-library/react`.
- **`DashforgeTailwindProviderProps`**: `theme` + `mode` (F1
  placeholder names) renamed to `initialTheme` + `initialMode` to
  reflect that they are one-shot overrides on mount, not reactive
  bindings. Reactive control lives in the store actions.

### Tests

- 65 new unit tests across 6 new spec files:
  - `store/tw-theme.store.spec.ts` — 14 tests (cascade, persistence,
    cross-tab, isolation from MUI key)
  - `store/tw-theme.actions.spec.ts` — 7 tests (deep merge, sibling
    preservation, null safety, replaceTheme equivalence)
  - `hooks/useDashTWTheme.spec.ts` — 4 tests (snapshot, re-render
    triggers, immutability)
  - `runtime/cssVars.spec.ts` — 16 tests (hex→RGB triplet, full
    color/spacing/radius/fontSize keyspace, light↔dark snapshot)
  - `runtime/serverSideStyleTag.spec.ts` — 7 tests (output shape,
    selector scope, light vs dark)
  - `provider/DashforgeTailwindProvider.spec.tsx` — 10 tests (mount,
    DOM injection, reactive swap, initialTheme/initialMode
    precedence, StrictMode safety)
- `adapter/dashforgePreset.spec.ts` extended from 2 → 9 tests to
  cover CSS-var refs, alpha-value format, key parity.

### Verified

- Smoke test in `~/projects/web/learn/dash` (`/test-tw` route):
  Vite bundle green, 0 console errors / warnings, full toggle &
  patch flow exercised in browser. `data-dash-tw-theme` flips, CSS
  vars re-inject, `neutral-50` correctly inverts on mode swap
  (`250 250 250` ↔ `10 10 10`), brand colors stay constant.
- Cross-package isolation confirmed at runtime: TW and MUI providers
  write to **separate** localStorage keys (`dashforge:tw-theme:mode`
  vs `dashforge:theme:mode`) and never collide.
- Full monorepo regression: 0 changes in the 7 published packages'
  test suites; `@dashforge/ui` MUI still at 484 + 1 skipped, byte-
  unchanged.

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
