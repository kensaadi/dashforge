# Changelog — @dashforge/tw

All notable changes to `@dashforge/tw` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> This package is part of the **`@dashforge/tw-*` Tailwind ecosystem**, built
> as a fully isolated stack sharing only the bridge layer
> (`@dashforge/forms` + `@dashforge/ui-core` + `@dashforge/rbac`) with the
> MUI side of Dashforge. Tokens, theme runtime, and components are
> duplicated intentionally — no shared "lowest common denominator" headless
> layer.

## [0.2.0-beta] — 2026-05-17

**Foundation release.** Eight layout / structural primitives added on top of
the F3–F7 component catalogue, plus extensive edge-case test hardening across
the whole package.

This is a strictly additive minor bump — no breaking changes to the existing
16 components. Consumers upgrading from `0.1.0-beta` can adopt the new
primitives incrementally; existing code keeps working unchanged.

### Added — Foundation primitives (F9)

The `Box ≠ flex`, `Stack = flex 1D`, `Grid = flex 2D` rule is the spine of
this layer: each primitive has a single, non-overlapping responsibility so
"which one do I use?" has one answer per scenario.

- **`Typography`** — semantic typed text. Twelve variants (h1–h6,
  subtitle1/2, body1/2, caption, overline) × nine intent colors × five
  weight overrides + alignment + truncate / noWrap / gutterBottom. Default
  HTML tag inferred from variant (h1→`<h1>`, body1→`<p>`, …), overridable
  via `as` or `asChild` (Radix Slot). Reads color from a parent `<Box>` via
  `color="inherit"`.
- **`Box`** — surface primitive consolidating MUI's Box + Paper + Card +
  Surface into one. Five variants (`plain` · `outlined` · `elevated` ·
  `soft` · `solid`) × seven intent colors = 21 compound visuals + six
  elevation levels (0–5) + token-scale spacing (`p`/`px`/`py`/`m`/`mx`/`my`)
  + rounded scale + `fullWidth`/`fullHeight`. Strictly no flex / no grid by
  design — wrap in Stack/Grid for layout.
- **`Stack`** — the **only** flex container in `@dashforge/tw`. Direction +
  align + justify + token-scale gap + wrap, plus a runtime `divider` prop
  that inserts N-1 separators between children (Children.toArray semantics
  documented; Fragments count as one child).
- **`Grid`** — CSS Grid container + item, polymorphic in role. MUI v2 API
  surface (`<Grid container>` + `<Grid xs={6}>`) backed by real CSS Grid
  (`display: grid` + `col-span-*`), not flexbox. Discriminated-union
  TypeScript — `<Grid container xs={6}>` is a compile error. 70-entry
  responsive col-span mapping (xs/sm/md/lg/xl × 1..12/auto/full).

### Added — Foundation completions (F10)

Closes the foundation surface to match what Chakra/Mantine/Joy ship at the
layout-primitive level.

- **`Container`** — centered max-width page wrapper with the canonical
  responsive padding ramp (`px-4 sm:px-6 lg:px-8`). Six sizes
  (sm/md/lg/xl/2xl/fluid) mapped to Tailwind's screen breakpoints +
  `centerContent` opt-in for marketing/sign-in layouts.
- **`Divider`** — visual separator with two rendering modes. Line-only
  renders `<hr>` with `role="separator"` + `aria-orientation`; labeled
  mode (with children) renders the "OR" separator pattern as two flex
  segments around the label. orientation / variant (solid/dashed/dotted)
  / color (7 intents) / align (start/center/end) axes.
- **`AspectRatio`** — content-shape primitive using the native CSS
  `aspect-ratio` property (supported since 2021, ~98% browser coverage).
  Number or CSS-string ratio. Pairs with `sx="rounded-xl overflow-hidden"`
  for the canonical clipped media pattern (documented as the #1 gotcha).
- **`VisuallyHidden`** — the a11y primitive. Uses Tailwind's `sr-only`
  (WebAIM clip technique). Hides children from sighted users while keeping
  them in the accessibility tree — icon button labels, status announcers,
  skip links. Default tag is `<span>` for the 99% case (inline label).

### Added — Test coverage hardening (F11-bis)

- **+132 new edge case tests** across the eight Foundation primitives,
  bringing total package coverage from **460 → 592 tests** (32 files).
- **Box (+33)**: all 21 compound variants (outlined / soft / solid × 7
  intents) asserted explicitly with light + dark pairs; plain / elevated
  color-agnostic invariants; spacing axis coexistence; elevation × variant
  interaction; rounded edge values.
- **Grid (+38)**: every responsive breakpoint × representative span (5 ×
  5 = 25), full cascade test (xs→xl), every `autoFlow` value, every `cols`
  value, `spacingX`/`spacingY` independence, empty container + orphan item
  handling, deep nesting.
- **Stack (+29)**: array divider, conditional / null children, mixed
  text + element children, nested Stack with divider key stability, every
  gap step (11 token values), every align/justify value (11), empty Stack
  with and without divider.
- **Typography, Container, Divider, AspectRatio, VisuallyHidden (+32)**:
  multi-axis combinations, full variant catalogues, extreme ratio values,
  nested fluid/capped Container pattern, aria-live announcement pattern.

### Validated

End-to-end smoke test in the `dash` consumer app (linked via `file:`
override): all eight primitives mount + render correctly in light and dark
modes; React Profiler shows **mount 12.1 ms / re-render 7–8.6 ms** for a
page with 50+ primitive instances — well within the 60 fps frame budget.
No `React.memo` needed because the primitives are pure (no internal state,
no `useEffect`, only className resolution).

### Architecture note

The `Box ≠ flex` / `Stack = flex` / `Grid = 2D` separation is intentional
and enforced at the type level: passing flex/grid props to `Box` is a
compile error. This rules out the "Box is universal, every `<div>` ends up
as a `<Box display="flex">`" failure mode that drowns the surface-vs-layout
distinction in MUI codebases.

### Compatibility

- **Peer deps unchanged**: `@dashforge/tw-theme@^0.1.0-beta` and
  `@dashforge/tw-tokens@^0.1.0-beta` (neither was modified).
- **Bridge layer unchanged**: still pinned to `@dashforge/forms` +
  `@dashforge/ui-core` + `@dashforge/rbac` at the workspace version.
- **No breaking changes**: existing 16 components' APIs are byte-identical.

---

## [0.1.0-beta] — 2026-05-16

First public beta. Sixteen components shipped across forms, layout, and
providers — every component is bridge-integrated, RBAC-aware,
StrictMode-safe, and covered by unit + perf + re-render budget tests.

### Added — Form components (10)

- **`Button`** (F3) — variant + size + color matrix, polymorphic
  `asChild` slot, RBAC `access` prop, loading/disabled states.
- **`TextField`** (F3) — bridge-integrated single-line input with
  7-slot taxonomy, stacked/inline layouts, error gating via Form
  Closure v1.
- **`Checkbox`** (F3) — Radix Checkbox primitive, bridge wiring,
  RBAC + visibility.
- **`Switch`** (F3) — Radix Switch primitive, same contract as Checkbox.
- **`RadioGroup`** (F4) — Radix RadioGroup with row/stacked layouts.
- **`Textarea`** (F4) — multi-line variant of TextField, vertical
  resize support.
- **`NumberField`** (F4) — locale-aware number input, optional
  stepper buttons, min/max/step constraints.
- **`OTPField`** (F4) — segmented one-time-code input (numeric /
  alphanumeric), sanitized paste.
- **`Autocomplete`** (F5-A → F5-A-bis) — single + multi-select
  combobox; generic option shape via `getOptionValue` /
  `getOptionLabel`; free-solo (Enter / blur commits typed text);
  async runtime via `loadOptions(query)` with debounce + loading
  row + race-safe fetch generation. **Custom pure-React
  implementation** (no react-aria-components) for deterministic
  state ownership — the F5-A clear-button regression was the
  motivating lesson.
- **`DateTimePicker`** (F5-B) — native HTML5 inputs (`date` /
  `time` / `datetime-local`), `min` / `max` / `step` forwarded,
  ISO 8601 ⇔ native input value conversion, `color-scheme: light
  dark` for OS-icon legibility in dark mode.

### Added — Layout components (4)

- **`Breadcrumbs`** (F6) — router-agnostic crumb trail with
  middle-collapse (`maxItems`, `itemsBeforeCollapse`,
  `itemsAfterCollapse`), polymorphic `linkComponent`,
  `aria-current="page"` on the active crumb.
- **`LeftNav`** (F6) — sidebar with flat items + collapsible
  groups; rail mode (`collapsed` + `sr-only` labels + tooltips);
  per-row RBAC; controlled / uncontrolled group expansion;
  brand + footer slots.
- **`TopBar`** (F6) — sticky `<header>` with `start` / `center` /
  `end` slots; renders as `<header>` (banner landmark) or `<div>`
  via `asDiv`.
- **`AppShell`** (F6) — top-level orchestrator wiring `header` +
  `nav` (desktop inline + mobile drawer) + `main` + `footer`;
  body scroll-lock + Escape close + backdrop click; responsive
  switch at the `md` breakpoint.

### Added — Providers (2)

- **`ConfirmDialogProvider`** + **`useConfirm()`** (F7) —
  imperative `Promise<boolean>` confirmation modal on the native
  `<dialog>` element + `showModal()` (AAA-grade a11y + focus
  trap + Escape free from the browser); FIFO request queue;
  4 severities; `disableBackdropClose` / `disableEscapeClose`
  per-invocation.
- **`SnackbarProvider`** + **`useSnackbar()`** (F7) — transient
  toast notifications, 6 corner positions, `maxVisible` cap with
  FIFO promotion, de-dup by `id` (re-enqueueing replaces in
  place + resets timer), action buttons, persistent mode
  (`autoHideMs: 0`), `aria-live="polite"` region for AT.

### Added — Tooling

- **`flat-dts.cjs`** post-build script (also added to `@dashforge/forms`,
  `@dashforge/ui-core`, `@dashforge/rbac`) — rewrites the Rollup-emitted
  `dist/index.d.ts` `export * from "./src/index"` wrapper with explicit
  re-exports. Works around a TypeScript bundler-resolution bug where
  `export *` in a dist wrapper drops re-exports under project references.
- **`eslint-plugin-react-hooks`** scoped to this package — exposes real
  `rules-of-hooks` and `exhaustive-deps` violations that were previously
  hidden.

### Quality

- **317 tests passing** (≈90 unit, the rest perf + re-render budgets).
- Strict re-render guardrails: typing into a field never re-renders an
  unrelated sibling; `confirm()` and `useSnackbar()` return identities
  are stable across provider re-renders.
- Perf budgets pinned for mount cost (e.g. `<LeftNav>` 300-row mount
  under 250 ms, `<Autocomplete>` 1000-option mount under 500 ms).
- Lint + typecheck + build all green workspace-wide.

### Architecture notes

- **`peerDependencies`**: `react ^18 || ^19`, plus
  `@dashforge/tw-tokens` and `@dashforge/tw-theme` (CSS variable provider
  + Tailwind preset must be wired by the consumer).
- **`dependencies`**: `@dashforge/forms`, `@dashforge/rbac`,
  `@dashforge/ui-core`, `@radix-ui/react-{checkbox,radio-group,slot,switch}`,
  `clsx`, `tailwind-merge`, `tailwind-variants`. No `react-aria-components`
  (the Autocomplete rewrite dropped the dep).

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
- Smoke-tested in `~/projects/web/learn/dash` via `pnpm link` together
  with `@dashforge/tw-tokens` and `@dashforge/tw-theme`. Browser build
  green.
