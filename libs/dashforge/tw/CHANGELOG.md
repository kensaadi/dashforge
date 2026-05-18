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

## [0.3.0-beta] — 2026-05-18

**Sprint 2 release.** Bundle of 9 fixes across 7 components + 1 new
public API (TextField inline adornments). Two WCAG enhancements
close known a11y gaps from the 0.2.1 A11Y audit. End-to-end
consumer validation in the `dash` app (`/test-{foundation,tw,layout,
providers}`) caught 1 functional bug + 1 cosmetic gap on Autocomplete
that were both invisible to unit tests + docs lab.

**Minor bump because of TextField `slotProps.prefix/suffix`** — new
public API on the existing `slotProps` surface, strictly additive
(empty configs add zero layout cost; existing TextField usages keep
working byte-identical). All other changes are patches that would
have shipped as `0.2.2-beta` in isolation.

### Added

- **TextField inline adornments via `slotProps.prefix` + `slotProps.suffix`** —
  closes a long-standing doc/lib drift where the
  `text-field.mdx` already documented this API but the lib didn't
  expose it. New shape:
  ```tsx
  <TextField
    name="price"
    type="number"
    slotProps={{
      prefix: { children: '$' },
      suffix: { children: 'USD' },
    }}
  />
  ```
  Both slots accept `{ children?: ReactNode; className?: string }`.
  Rendered inside the inputWrapper with `aria-hidden="true"` +
  `pointer-events-none` (purely visual decoration — input remains
  the labeled control, click on adornment doesn't steal focus).
  21/21 TextField tests still pass.

- **AppShell mobile drawer focus trap** (WCAG 2.4.3 Focus Order).
  Hand-rolled (no `focus-trap-react` dep). On drawer open: captures
  `document.activeElement`, moves focus to first focusable inside
  drawer, intercepts `Tab` / `Shift+Tab` to wrap focus within the
  drawer subtree. On close: restores focus to the captured element
  (typically the hamburger toggle). Plus `role="dialog"` +
  `aria-modal="true"` on the drawer `<aside>` while open so screen
  readers announce it as a modal overlay. Verified end-to-end in
  dash: all 5 check points (closed ARIA, open ARIA, focus in,
  tab-wrap, Esc-close) pass.

- **`prefers-reduced-motion` gates** on six substantial motions
  (WCAG 2.3.3 Animation from Interactions): Switch thumb slide,
  AppShell drawer slide-in + backdrop fade, Snackbar item enter,
  Autocomplete chevron flip, LeftNav rail-mode width transition.
  Uses Tailwind's `motion-reduce:` variant — the animated end-state
  still applies, only the smooth tween is suppressed for users who
  request reduced motion. Color fades (`transition-colors` on hover
  states) are NOT gated — out of WCAG 2.3.3 scope (vestibular
  concern is translate/rotate/major-state-change, not micro fades).

- **Checkbox indeterminate dash glyph**. Previously the Indicator
  rendered `<CheckIcon />` for BOTH the `checked` and `indeterminate`
  Radix states. Now renders `<DashIcon />` (horizontal stroke) for
  indeterminate and `<CheckIcon />` for fully checked. Toggle via
  Tailwind `group-data-[state=…]:hidden` selectors on the Indicator
  — pure CSS, zero React state, Radix `data-state` remains the
  single source of truth. Closes a cosmetic regression introduced
  in 0.2.1-beta when we dropped `forceMount` to fix the indicator
  mount bug.

### Fixed

- **Autocomplete `loadOptions` mode — selection now commits** the
  clicked option's label to the input. Previously, in async-loaded
  mode, clicking an option closed the popover but the input kept
  showing the user's search query instead of the selected label.
  Root cause: `commitSelection` searched only the static `options`
  prop (empty `[]` when `loadOptions` is configured) for the label
  lookup, not the effective pool (`asyncOptions` when the fetch
  resolved). The fix uses
  `loadOptions && asyncOptions !== null ? asyncOptions : options`
  and adds those refs to the `useCallback` deps. 38/40 Autocomplete
  tests pass (2 perf-timing flakes unrelated, both >100ms over
  threshold on loaded machine).

- **Autocomplete chip remove (×), clear (×), and dropdown caret (▾)
  icons replaced with inline SVG** (`CloseIcon` + `ChevronDownIcon`,
  mirroring CheckIcon's pattern). Previously rendered as Unicode
  glyphs that came out as chunky font characters inconsistent with
  the rest of the design system. Bonus: chevron flips 180° on
  popover open via `[&[aria-expanded=true]>svg]:rotate-180` (CSS-
  only, no React state). Zero icon-library dep added.

- **LeftNav `itemLink` + Breadcrumbs `link` slots no longer
  underline by default**. Tailwind's preflight removes the browser-
  default anchor underline globally, but environments that disable
  preflight (e.g. apps coexisting with MUI in the same page tree —
  this is exactly how our docs lab is set up) get the underline
  back. Explicit `no-underline hover:no-underline` on both slots
  makes the appearance consistent regardless of preflight state.
  Same root cause fix covers TopBar too — TopBar typically renders
  Breadcrumbs in its center slot, so fixing the Breadcrumbs link
  fixes TopBar transitively.

### Internal

- **`libs/dashforge/tw/CONSUMER-VALIDATION.md`** — Sprint 2 P1
  deliverable. Per-component status table for the dash-consumer
  end-to-end validation pass (24 components, 7-point check each).
  Records the pattern lesson that motivated the Autocomplete
  async fix: the bug was invisible to both unit tests (using
  static `options`) and the docs lab (static demo) — only a real
  consumer with `loadOptions` configured exposed it.

### Compatibility

| Compatibility axis | Pre-`0.3.0` | Post-`0.3.0` |
|---|---|---|
| Public API surface | unchanged | **+ TextField `slotProps.prefix` / `slotProps.suffix`** (additive — opt-in via slotProps, zero impact on existing usages) |
| Peer deps | `react ^18 \|\| ^19`, `tw-theme workspace`, `tw-tokens workspace` | unchanged |
| Bridge deps | `forms` / `rbac` / `ui-core` `workspace:*` | unchanged |
| Behavior changes that consumers might observe | — | Autocomplete chip remove + clear + caret render as crisp SVG instead of Unicode glyphs (cosmetic); LeftNav + Breadcrumbs links no longer underline in preflight-off environments; Switch / drawer / snackbar / chevron animations respect `prefers-reduced-motion: reduce`; Checkbox indeterminate now shows a dash glyph instead of check |

### Migration

No code changes required. Drop-in upgrade from `0.2.1-beta`:

```bash
pnpm up @dashforge/tw@^0.3.0-beta
```

To adopt the new TextField adornments, no migration — opt in by
adding `slotProps={{ prefix: { children: '$' } }}` to any existing
TextField usage. The two slots are independent (you can use one
without the other).

## [0.2.1-beta] — 2026-05-17

**Hardening release.** Four targeted fixes — three in form-control
runtime behaviour, one in the Button accessibility contract — surfaced
while building live-preview demos for the docs site. No public API
change on any component; strictly additive on the `<Button>` props
contract (a new `aria-busy` attribute is emitted automatically when
`loading` is true). Drop-in upgrade from `0.2.0-beta`.

Theme of the three form-control fixes: the **same root cause** —
"controlled-without-an-owner" — under three different surface
appearances. In standalone uncontrolled mode (no `DashFormProvider`,
no `value` / `checked` prop, only `defaultValue` / `defaultChecked`),
each component was sitting in a controlled mode without anyone able
to update the controlled prop on the user's keystrokes / clicks, so
React would snap the input right back. The fixes vary by component
implementation (Radix-backed → discriminated spread of `value` vs
`defaultValue`; Radix indicator → drop `forceMount` + React
conditional; native `<input>` → local `useState` for the uncontrolled
case) but the pattern is identical. A11Y.md (new doc, separate
commit) documents the broader pattern audit.

### Fixed

- **Checkbox** — the indicator's check glyph never appeared when the
  user clicked a Checkbox that was rendered standalone-uncontrolled
  (no `DashFormProvider`, no `checked` prop). The control turned blue
  via `data-[state=checked]:bg-primary-500` but the React-conditional
  `<CheckIcon />` was gated on a stale `resolvedChecked` snapshot.
  Dropped `forceMount` + the conditional; the Radix `Indicator` now
  owns the mount decision, tracking Radix's internal `data-state`
  directly. Mounts in all three modes (controlled, uncontrolled,
  bridge). 14/14 tests pass.
- **RadioGroup** — clicking a different radio in standalone-uncontrolled
  mode had no visible effect (the selection snapped back to
  `defaultValue`). `<RadixRadioGroup.Root>` was passed `value={…}`
  always, putting Radix in controlled mode against a never-updated
  snapshot. Discriminated spread now picks `value` only in form mode
  or when the consumer explicitly passes `value`; standalone-with-only-
  `defaultValue` uses `defaultValue` so Radix manages its own state.
  11/11 tests pass.
- **NumberField** — typing into the input or clicking the +/− stepper
  had no visible effect in standalone-uncontrolled mode, for the same
  reason (controlled `<input value={…}>` with no setter). Added a
  local `useState<string>` seeded from `defaultValue` (mirrors the
  OTPField pattern); `handleChange` + `stepBy` now both update it.
  8/8 tests pass.
- **Button** — sets `aria-busy={true}` while `loading`, so assistive
  tech distinguishes "wait for the action to finish" from plain
  "disabled" (which previously was the only signal — same DOM
  attribute regardless of whether the disable came from `loading`,
  `disabled={true}`, or RBAC). 19/19 tests pass.

### Internal

- A11Y.md added at package root — per-component status table mapped
  to WCAG 2.1 AA / WAI-ARIA APG. Documents that 23 of 24 components
  were already conformant pre-release (only Button needed the
  `aria-busy` enhancement above). Known non-blocking limitations
  filed: AppShell mobile drawer focus trap, `prefers-reduced-motion`
  pass, color-contrast CI suite, lighthouse/axe automated scan.

### Compatibility

| Compatibility axis | Pre-`0.2.1` | Post-`0.2.1` |
|---|---|---|
| Public API surface  | unchanged | unchanged + `aria-busy` auto-emitted on `<Button loading>` |
| Peer deps           | `react ^18 \|\| ^19`, `tw-theme workspace`, `tw-tokens workspace` | unchanged |
| Bridge deps         | `forms` / `rbac` / `ui-core` `workspace:*` | unchanged |

## [0.2.0-beta] — 2026-05-17

**Foundation release.** Eight layout / structural primitives added on top of
the F3–F7 component catalogue (16 components → 24), plus a coverage
hardening pass bringing the package from **460 → 592 unit tests** across
**32 files**. End-to-end validated in the `dash` consumer app: mount
**12.1 ms** / re-render **7–8.6 ms** for a page with 50+ primitive
instances.

**No public API change** on any of the 16 previously-shipped components
— strictly additive minor bump. Consumers upgrading from `0.1.0-beta`
can adopt the new primitives incrementally; existing code keeps working
unchanged.

### Added — Foundation primitives (F9)

The `Box ≠ flex`, `Stack = flex 1D`, `Grid = flex 2D` rule is the spine of
this layer: each primitive has a single, non-overlapping responsibility so
"which one do I use?" has one answer per scenario. The rule is enforced at
the TypeScript prop type level — `<Box direction="row">` is a compile error.

- **`Typography`** — semantic typed text. Twelve variants (`h1`–`h6`,
  `subtitle1/2`, `body1/2`, `caption`, `overline`) × nine intent colors ×
  five weight overrides + alignment + truncate / noWrap / gutterBottom.
  Default HTML tag inferred from variant (h1→`<h1>`, body1→`<p>`, …),
  overridable via `as` or `asChild` (Radix Slot). Reads color from a
  parent `<Box>` via `color="inherit"`.
  Source: `src/components/Typography/{Typography.tsx, typography.types.ts, typography.variants.ts}`.

- **`Box`** — surface primitive consolidating MUI's Box + Paper + Card +
  Joy Surface into one. Five variants (`plain` · `outlined` · `elevated` ·
  `soft` · `solid`) × seven intent colors = **21 compound visuals**
  emitted by the TV recipe + six elevation levels (`0`–`5`) + token-scale
  spacing (`p`/`px`/`py`/`m`/`mx`/`my`) + rounded scale +
  `fullWidth`/`fullHeight`. Strictly no flex / no grid by design — wrap
  in Stack/Grid for layout.
  Source: `src/components/Box/box.variants.ts` (compound matrix lives here).

- **`Stack`** — the **only** flex container in `@dashforge/tw`.
  `direction` + `align` + `justify` + token-scale `gap` + `wrap`, plus a
  runtime `divider` prop that inserts N-1 separators between children
  (`React.Children.toArray` semantics: Fragments count as one child —
  documented in `Stack.tsx` header + asserted in the test suite).
  Source: `src/components/Stack/{Stack.tsx, stack.types.ts, stack.variants.ts}`.

- **`Grid`** — CSS Grid container + item, polymorphic in role. MUI v2 API
  surface (`<Grid container>` + `<Grid xs={6}>`) backed by **real CSS
  Grid** (`display: grid` + `col-span-*`), not flexbox like MUI v2's own
  internals. Discriminated-union TypeScript: `<Grid container xs={6}>`
  fails compilation. 70-entry responsive `col-span` mapping (xs/sm/md/lg/xl
  × `1..12/auto/full`) in the TV recipe.
  Source: `src/components/Grid/{Grid.tsx, grid.types.ts, grid.variants.ts}`.

### Added — Foundation completions (F10)

Closes the foundation surface to match what Chakra/Mantine/Joy ship at
the layout-primitive level.

- **`Container`** — centered max-width page wrapper with the canonical
  responsive padding ramp (`px-4 sm:px-6 lg:px-8`). Six sizes
  (`sm` / `md` / `lg` / `xl` / `2xl` / `fluid`) mapped to Tailwind's
  `max-w-screen-*` aliases + `centerContent` opt-in for marketing /
  sign-in layouts.
  Source: `src/components/Container/{Container.tsx, container.types.ts, container.variants.ts}`.

- **`Divider`** — visual separator with two rendering modes selected by
  `children` presence. Line-only renders `<hr>` with `role="separator"` +
  `aria-orientation`; labeled mode renders the "OR" separator pattern as
  two flex segments around the label, with a 32 px stub on the squashed
  side for `align="start"` / `"end"`. orientation × variant
  (solid/dashed/dotted) × color (7 intents) × align (3) axes.
  Source: `src/components/Divider/{Divider.tsx, divider.types.ts, divider.variants.ts}`.

- **`AspectRatio`** — content-shape primitive using the **native CSS
  `aspect-ratio` property** (supported since 2021, ~98% browser coverage).
  Number or CSS-string ratio. Pairs with `sx="rounded-xl overflow-hidden"`
  for the canonical clipped media pattern (documented as the #1 gotcha
  in `AspectRatio.tsx` header and the public MDX docs).
  Source: `src/components/AspectRatio/{AspectRatio.tsx, aspectRatio.types.ts}`.

- **`VisuallyHidden`** — the a11y primitive. Uses Tailwind's `sr-only`
  utility (WebAIM clip technique). Hides children from sighted users
  while keeping them in the accessibility tree — icon button labels,
  status announcers (`aria-live="polite"`), skip links. Default tag is
  `<span>` for the 99% case (inline label inside a button or link).
  Source: `src/components/VisuallyHidden/{VisuallyHidden.tsx, visuallyHidden.types.ts}`.

### Internal

- **+132 edge case unit tests** added (`460 → 592` total across `32`
  files). Reorganised here under `Internal` rather than `Added` because
  the tests are not part of the public API surface.

  - **Box (+33)** — every one of the 21 compound surface variants
    (outlined / soft / solid × 7 intents) asserted explicitly with the
    light + dark pair; plain / elevated color-agnostic invariants;
    spacing axis coexistence (`p` + `px` + `py` × tailwind-merge
    precedence); `elevation` × `variant` interaction; rounded edge
    values. File: `src/components/Box/Box.test.tsx`.

  - **Grid (+38)** — every responsive breakpoint × representative span
    enumeration (5 × 5 = 25), full cascade test (`xs={12} sm={6} md={4}
    lg={3} xl={2}`), every `autoFlow` value, every `cols` value,
    `spacingX` / `spacingY` independence, empty container + orphan item
    handling, deep nesting (Grid inside Grid item). File:
    `src/components/Grid/Grid.test.tsx`.

  - **Stack (+29)** — array divider, conditional / null children, mixed
    text + element children, nested Stack with divider, divider key
    stability across re-renders, every gap step (11 token values),
    every `align`/`justify` value (11), empty Stack with and without
    divider. File: `src/components/Stack/Stack.test.tsx`.

  - **Typography / Container / Divider / AspectRatio / VisuallyHidden
    (+32)** — multi-axis combinations (`variant` + `color` + `weight` +
    `align` + `truncate` + `gutterBottom`), full variant catalogues
    iterated with `it.each`, extreme ratio values (21/9, 9/16, 0.5, 3),
    nested fluid/capped Container pattern, `aria-live="polite"`
    announcer pattern.

- **End-to-end consumer validation.** New page
  `~/projects/web/learn/dash/src/pages/TestFoundation.tsx` (linked into
  the `dash` consumer app via a `file:` package override) mounts all
  eight primitives inside `<DashforgeTailwindProvider>` wrapped in a
  React `<Profiler>` with `onRender` logger. Measured: **mount 12.1 ms,
  update 7–8.6 ms** for a page with 50+ primitive instances — within the
  60 fps frame budget. No `React.memo` applied — the primitives are
  pure (no `useState`, no `useEffect`, only className resolution), so
  React's reconciler trivially handles the re-render.

### Architecture

- **`Box ≠ flex`, `Stack = flex 1D`, `Grid = flex 2D`** — single
  responsibility per primitive, enforced at the TypeScript prop type
  level. `Box` exposes no `display` / `flex*` / `grid*` props at all —
  trying to pass them fails compilation. The rule rules out the MUI
  failure mode where every `<Box display="flex" gap={2}>` quietly becomes
  the de facto flex container of the codebase, drowning the
  surface-vs-layout distinction. When you read `<Stack>` in a JSX tree
  you know it's flex without reading any further.

### Compatibility

- **Peer deps unchanged**: `@dashforge/tw-theme@^0.1.0-beta` and
  `@dashforge/tw-tokens@^0.1.0-beta` (neither package was modified in
  this cycle). Bridge layer (`@dashforge/forms`, `@dashforge/ui-core`,
  `@dashforge/rbac`) likewise unchanged at the workspace `0.2.3-beta`
  version.

- **No breaking changes**: the public API of the 16 previously-shipped
  components is byte-identical. Diff `0.1.0-beta..0.2.0-beta` against
  `src/index.ts` shows only additive exports (the new Foundation
  primitives + their `*Variants` recipes + their `*Props` types).

- **Bundle size impact** (gzipped, when fully exercised):
  `dist/index.esm.js` grew from 255 KB to 272 KB (+17 KB / +6.7%) for
  the eight new primitives. Tree-shaking unaffected — consumers only
  pay for what they import.

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
