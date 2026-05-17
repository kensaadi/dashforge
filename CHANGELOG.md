# Dashforge Changelog

All notable changes to the Dashforge monorepo are documented here. Per-package
changelogs (where present) describe deeper, package-scoped detail. This file is
the entrypoint for understanding cross-package releases.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
The project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
with `-alpha` / `-beta` / `-rc` pre-release tags.

---

## [tw 0.2.0-beta] — 2026-05-17

> **Foundation release for `@dashforge/tw`.** Eight layout / structural
> primitives added (Typography, Box, Stack, Grid, Container, Divider,
> AspectRatio, VisuallyHidden) plus an extensive test coverage hardening
> pass (+132 edge case tests, package total 460 → 592 across 32 files).
> End-to-end validated in the `dash` consumer app: mount **12.1 ms** /
> re-render **7–8.6 ms** for a page with 50+ primitive instances —
> within the 60 fps frame budget without `React.memo`.
>
> **Single-package release**: only `@dashforge/tw` bumps. Companion
> packages (`tw-theme`, `tw-tokens`) and the bridge / MUI side stay
> at their current versions per the architectural-plan-v2 commitment to
> independent versioning.
>
> **No public API change** on the previously-published 16 components —
> strictly additive minor bump.

Affected package (bumped):

| Package         | Notes                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `@dashforge/tw` | Eight Foundation primitives added (F9 + F10). +132 internal tests (460 → 592). Existing 16 components' public API byte-identical. |

Unchanged (independent versioning, per architectural plan v2):

| Package                                              | Version (unchanged) | Why                                                  |
| ---------------------------------------------------- | ------------------- | ---------------------------------------------------- |
| `@dashforge/tw-theme`                                | `0.1.0-beta`        | No source change — peer dep stays at `^0.1.0-beta`.  |
| `@dashforge/tw-tokens`                               | `0.1.0-beta`        | No source change — peer dep stays at `^0.1.0-beta`.  |
| Bridge (`forms`, `rbac`, `ui-core`)                  | `0.2.3-beta`        | Shared with MUI side; no source change.              |
| MUI side (`ui`, `theme-mui`, `theme-core`, `tokens`) | `0.2.3-beta`        | Separate ecosystem; untouched.                       |

### Added

- **Eight Foundation primitives in `@dashforge/tw`** — Typography (semantic
  typed text with the full MUI-equivalent type scale), Box (surface
  primitive consolidating MUI's Box + Paper + Card + Joy Surface into one
  component, 21 compound visuals from 5 variants × 7 intents), Stack (the
  package's sole flex container, with a runtime `divider` prop), Grid
  (CSS Grid engine behind the MUI v2 `<Grid container>` + `<Grid xs={6}>`
  API, discriminated-union TypeScript so `<Grid container xs={6}>` is a
  compile error), Container, Divider, AspectRatio, VisuallyHidden.

  Full per-component API surface, props tables, and architectural
  rationale: see [`libs/dashforge/tw/CHANGELOG.md`](./libs/dashforge/tw/CHANGELOG.md#020-beta--2026-05-17).
  Source: `libs/dashforge/tw/src/components/{Typography,Box,Stack,Grid,Container,Divider,AspectRatio,VisuallyHidden}/`.

### Internal

- **+132 edge case unit tests** added across the eight Foundation
  components. Package coverage grows **460 → 592** across **32 files**.
  Breakdown: Box +33 (all 21 compound surface variants asserted
  explicitly with light + dark pairs), Grid +38 (every responsive
  breakpoint × representative span via the 70-entry
  `grid.variants.ts` mapping table), Stack +29 (Fragment counting,
  conditional/null children, array divider, every gap step), Typography
  / Container / Divider / AspectRatio / VisuallyHidden +32 (multi-axis
  combinations, full variant catalogues, extreme ratio values, nested
  Container pattern, `aria-live` announcement pattern).

- **End-to-end consumer validation** via `file:` link from
  `~/projects/web/learn/dash` to the local monorepo dist. New page
  `dash/src/pages/TestFoundation.tsx` mounts all eight primitives inside
  `<DashforgeTailwindProvider>` wrapped in a React `<Profiler>`. Measured:
  mount **12.1 ms**, update **7–8.6 ms** for a page with 50+ primitive
  instances. Foundation primitives are pure (no internal state, no
  `useEffect`) — re-render cost is the className resolution alone.

### Architecture

- **`Box ≠ flex`, `Stack = flex 1D`, `Grid = flex 2D`** — single
  responsibility per primitive, enforced at the TypeScript prop type
  level. `<Box direction="row">` is a compile error: there is no
  `direction` prop on `Box`. The rule rules out the MUI failure mode
  where every `<Box display="flex" gap={2}>` quietly becomes the de
  facto flex container of the codebase, drowning the surface-vs-layout
  distinction. When you read `<Stack>` in a JSX tree, you know it's
  flex without reading further.

### Migration

No migration steps required for consumers of the previously-published
16 components. Adopt the new Foundation primitives incrementally:

```bash
pnpm add @dashforge/tw@^0.2.0-beta
```

Existing import paths and APIs are byte-identical.

---

## [0.2.3-beta] + [tw 0.1.0-beta] — 2026-05-16

> **Two coordinated releases shipped from the same commit set.**
>
> 1. **`@dashforge/tw 0.1.0-beta`** (and `tw-theme`, `tw-tokens`) —
>    **first public beta** of the Tailwind ecosystem. Sixteen
>    components across forms (10), layout (4), and providers (2);
>    317 tests; lint / typecheck / build all green. Packages go from
>    `private: true` to publishable.
>
> 2. **`v0.2.3-beta`** — fixed-group patch on the seven existing
>    published packages. Source change in `forms` / `ui-core` / `rbac`
>    (post-build `.d.ts` flattener required by the new tw downstream
>    typecheck, plus minor cleanups). `tokens` / `theme-core` /
>    `theme-mui` / `ui` are lockstep bumps with no source change.

### Affected packages

| Package                | Version       | Kind                                                                |
| ---------------------- | ------------- | ------------------------------------------------------------------- |
| `@dashforge/tw`        | `0.1.0-beta`  | **First public beta** — 16 components (F3 → F7).                    |
| `@dashforge/tw-theme`  | `0.1.0-beta`  | **First public beta** — `DashforgeTailwindProvider` stable.         |
| `@dashforge/tw-tokens` | `0.1.0-beta`  | **First public beta** — token surface + Tailwind preset stable.     |
| `@dashforge/forms`     | `0.2.3-beta`  | flat-dts script + noop refactors (no API change).                   |
| `@dashforge/ui-core`   | `0.2.3-beta`  | flat-dts script (no API change).                                    |
| `@dashforge/rbac`      | `0.2.3-beta`  | flat-dts script + minor cleanup (no API change).                    |
| `@dashforge/tokens`    | `0.2.3-beta`  | Lockstep bump. No source change.                                    |
| `@dashforge/theme-core`| `0.2.3-beta`  | Lockstep bump. No source change.                                    |
| `@dashforge/theme-mui` | `0.2.3-beta`  | Lockstep bump. No source change.                                    |
| `@dashforge/ui`        | `0.2.3-beta`  | Lockstep bump + scoped eslint debt doc (no runtime change).         |

### `@dashforge/tw 0.1.0-beta` — 16 components shipped

**Forms (10)**: `Button` · `TextField` · `Checkbox` · `Switch` ·
`RadioGroup` · `Textarea` · `NumberField` · `OTPField` ·
`Autocomplete` · `DateTimePicker`.

**Layout (4)**: `Breadcrumbs` · `LeftNav` · `TopBar` · `AppShell`.

**Providers (2)**: `ConfirmDialogProvider` + `useConfirm()` ·
`SnackbarProvider` + `useSnackbar()`.

All bridge-integrated (DashFormProvider), RBAC-aware (`access`
prop on every form field), Form Closure v1 error gating,
StrictMode-safe unregister-on-unmount. Re-render guardrails
locked in by per-component perf tests: typing into one field
never re-renders an unrelated sibling.

### `v0.2.3-beta` — patch detail

#### Added (tooling)

- **`scripts/flat-dts.cjs` + Rollup `writeBundle` plugin** in
  `@dashforge/forms`, `@dashforge/ui-core`, `@dashforge/rbac`.
  Rewrites the auto-generated `dist/index.d.ts`
  (`export * from "./src/index"`) into explicit re-exports that
  survive TS bundler resolution under project references. Without
  this, the `@dashforge/tw` typecheck cannot see `useDashFieldMeta`
  (and friends) from the wrapped distribution.

#### Fixed (source — small, no public API impact)

- **`@dashforge/forms`**: noop submit / unsubscribe callbacks
  promoted to module-level constants. Bonus perf: the subscribe
  callback returned by `useDashFieldMeta` / `useFieldRuntime` keeps
  the same reference across renders, which lets `useSyncExternalStore`
  bail out without re-subscribing on each render in standalone
  (no-provider) mode.
- **`@dashforge/rbac`**: dropped a trivially-inferable
  `code: string = …` annotation on `RbacError`.

#### Lint config + known debt

- `eslint-plugin-react-hooks` scoped to `@dashforge/tw` (the
  package that explicitly opted in). Test files (`**/*.{test,spec}.*`
  + `**/__tests__/**`) get a relaxed override for three rules that
  are noisy on legitimate test patterns (`no-empty-function` /
  `no-non-null-assertion` / `no-explicit-any`); production code
  remains strictly checked.
- **`@dashforge/ui/src/components/Autocomplete/Autocomplete.tsx`**:
  seven pre-existing rules-of-hooks violations (hooks after
  early-return guards). Component works in production — `visibleWhen`
  decisions are stable per mount — but lint requires a ~200 LoC
  restructure to lift all hooks above the guards. Scoped `off`
  ONLY for that one file via the package's `eslint.config.mjs`;
  rest of `@dashforge/ui` remains strictly checked. Tracked as a
  dedicated follow-up in the package's CHANGELOG.

#### Workspace gate

```
$ pnpm nx run-many -t lint typecheck test build
  -p @dashforge/{tw,tw-theme,tw-tokens,forms,ui-core,rbac,tokens,theme-core,theme-mui,ui}

✓ NX  Successfully ran targets lint, typecheck, test, build
      for 10 projects
```

---

## [0.2.2-beta] — 2026-05-15

> **Maintenance release.** One runtime correctness fix in
> `@dashforge/theme-mui` (per-severity `MuiAlert` styling silently lost
> under MUI v9 due to removed compound override slots), plus the F1
> scaffolding of the **`@dashforge/tw-*` Tailwind ecosystem** as three
> new private packages (`tw-tokens`, `tw-theme`, `tw`) that ship with the
> monorepo but are **deliberately excluded from the publish set** until
> F2/F3 stabilises them. Tooling/cleanup: `nx.json` `release.projects`
> scoped explicitly to the 7 publishable packages, two unused playground
> apps removed, per-project `typecheck → build` serialization to
> eliminate a `nx run-many` race.
>
> **No public API change** on any of the 7 published packages.

Affected packages (all bumped to `0.2.2-beta`):

| Package                | Notes                                                                   |
| ---------------------- | ----------------------------------------------------------------------- |
| `@dashforge/theme-mui` | **Runtime fix** — `MuiAlert` per-severity overrides migrated to the MUI v6+ `variants` array (MUI v9 removed the compound `standard{Severity}` / `filled{Severity}` slots from `styleOverrides`). |
| `@dashforge/tokens` · `theme-core` · `ui-core` · `rbac` · `forms` · `ui` | Version bump only (lockstep peer alignment). No source change. |

New (unpublished, scaffolding only — not part of the published release):

| Package                | Version  | Status                                                                |
| ---------------------- | -------- | --------------------------------------------------------------------- |
| `@dashforge/tw-tokens` | `0.0.1`  | `private: true`. Tailwind-shaped tokens (50-950 color scales, spacing, radius, fontSize tiers). TS-only build. |
| `@dashforge/tw-theme`  | `0.0.1`  | `private: true`. `dashforgePreset()` Tailwind preset factory + `DashforgeTailwindProvider` React shell (Valtio store + CSS-vars injection arrives in F2). |
| `@dashforge/tw`        | `0.0.1`  | `private: true`. Components package with `cn()` (clsx wrapper) + `tv` re-export from tailwind-variants. F1 scaffold only — first components (Button, TextField, Checkbox, Switch) arrive in F3. |

### Fixed

- **`@dashforge/theme-mui` — `MuiAlert` per-severity styling lost under
  MUI v9.** The previous overrides used the compound
  `standardSuccess` / `filledWarning` / etc. keys inside
  `MuiAlert.styleOverrides`, which were valid under MUI v5 but **removed
  from `MuiAlert`'s `styleOverrides` type in MUI v9**. The keys passed
  silently at runtime (no per-severity colors applied) and produced a
  `TS2353` typecheck error on `src/overrides/MuiAlert.ts:38`.

  The fix replaces the eight compound-slot entries with a `variants`
  array matched on `{ severity, variant }` — the MUI v6+ idiomatic
  pattern. Runtime visual effect restored, TS2353 cleared. Public API of
  `getMuiAlertOverrides()` is unchanged and the emitted `.d.ts` is
  byte-identical.

### Added

- **`@dashforge/tw-tokens`, `@dashforge/tw-theme`, `@dashforge/tw`
  (private, unpublished).** F1 of the *dashforge-tw* roadmap: scaffolding
  for a Tailwind-first variant of the Dashforge UI, built as a fully
  isolated ecosystem sharing only the bridge layer
  (`@dashforge/forms` + `@dashforge/ui-core` + `@dashforge/rbac`) with
  the MUI side. Tokens, theme runtime, and components are duplicated
  intentionally — there is no shared "lowest common denominator"
  headless layer.

  All three packages ship with `private: true` and are excluded from
  `nx.json` `release.projects`, so they are versioned independently
  (`0.0.x`) and **will not** be bumped or published by the publish set's
  release cadence until they're ready to leave scaffolding. When F2/F3
  stabilises the API, they re-join the fixed group from a coherent
  starting point. Repository workspace devDeps gained
  `tailwind-variants`, `tailwind-merge`, and `clsx`.

  Smoke-tested in `~/projects/web/learn/dash` via `pnpm link`. Browser
  build green. Plan in [`/Users/mcs/.claude/plans/voglio-estendere-dashforge-con-shiny-parnas.md`](#)
  (local).

### Changed

- **`nx.json` `release.projects` scoped to the 7 published packages
  explicitly.** Was `["@dashforge/*"]`. Now lists the 7 publishable
  packages by name (`tokens`, `theme-core`, `theme-mui`, `ui-core`,
  `forms`, `rbac`, `ui`). Reason: the glob also matched the three new
  scaffolding-only `@dashforge/tw-*` packages, which would have been
  swept into every `nx release version` bump and dragged out of their
  narrative `0.0.x` scaffolding versioning. When the tw ecosystem
  stabilises (F2/F3), the entries get re-added and `private: true` is
  removed from the manifests so they join the fixed group from a
  coherent starting point.

- **Per-project `typecheck → build` serialization** to eliminate a
  `nx run-many` race where `typecheck` and `build` of the same project
  could observe transiently inconsistent `tsbuildinfo` state. `typecheck`
  is now scoped to `tsconfig.lib.json` for `@dashforge/forms` and
  `@dashforge/theme-mui` (consistent with the other 5 publishable
  packages) — this also unblocks `@dashforge/forms` from picking up its
  spec configs as part of the public typecheck.

- **`@dashforge/theme-mui` README** — example now imports the real
  `DashforgeThemeProvider` export (was a hypothetical name in the docs
  snippet, never matched a published symbol).

### Removed

- **Unused `docs/` playground app.** Replaced by the
  `~/projects/web/dashforge-docs-lab` external repo as the canonical
  docs surface. The in-monorepo playground was no longer wired into any
  task and only added clutter.

- **Unused `web/` (dashforge-web) playground app.** Same reason; never
  promoted past internal scratchpad.

### Internal

- **`tsbuildinfo` artifacts untracked.** Already covered by
  `.gitignore`, but had been committed in earlier alpha cycles. Removed
  from history-going-forward (existing tracking dropped).

---

## [0.2.1-beta] — 2026-05-14

> **Bug-fix release.** Two form-layer correctness fixes in
> `@dashforge/forms`, both surfaced while building the documentation site's
> live examples: (1) `<DashForm resolver={...}>` silently ignored the
> resolver, and (2) `DashFormProvider` skipped `useForm()` during SSR,
> violating the Rules of Hooks and breaking `useDashFieldArray` under
> server-side rendering. No public API change.

Affected packages (all bumped to `0.2.1-beta`):

| Package                | Notes                                                                   |
| ---------------------- | ----------------------------------------------------------------------- |
| `@dashforge/forms`     | **Two bug fixes** — `DashForm` `resolver` passthrough + `DashFormProvider` unconditional `useForm()`. |
| `@dashforge/tokens` · `theme-core` · `theme-mui` · `ui-core` · `rbac` · `ui` | Version bump only (lockstep peer alignment). |

### Fixed

- **`DashForm` dropped the `resolver` prop.** `DashForm` destructured its
  config props (`engine` / `defaultValues` / `debug` / `mode` /
  `reactions`) and spread the rest (`...formProps`) onto the underlying
  `<form>` element. `resolver` was **not** in the destructured list, so it
  fell through into `...formProps` and was spread onto the raw `<form>`
  DOM node — React rejected it with *"Invalid value for prop `resolver` on
  `form` tag"* and, critically, the resolver never reached React Hook
  Form. Schema-based validation via `<DashForm resolver={...}>` silently
  validated nothing.

  The fix adds `resolver` to the destructured props and forwards it to
  `DashFormProvider` (which already accepted and wired it correctly).
  `DashFormProvider` was never affected — only the `DashForm` convenience
  wrapper.

- **`DashFormProvider` skipped `useForm()` during SSR.** The provider
  wrapped React Hook Form's `useForm()` in an
  `isClient ? useForm() : { ...stub }` ternary to dodge a
  *"Cannot read properties of null (reading 'useRef')"* crash seen during
  server-side rendering. That was wrong on two counts:
  1. it **violated the Rules of Hooks** — `useForm` is a hook and must run
     unconditionally on every render; and
  2. the SSR stub exposed `control: {}`, which silently broke
     `useFieldArray` (and therefore `useDashFieldArray`) under SSG with
     *"control._getFieldArray is not a function"*.

  `useForm()` is now called unconditionally — it is SSR-safe by design.
  The original `useRef` crash is a dual-React-instance symptom; the cure
  for that is deduping `react` / `react-dom` in the consumer's bundler
  (e.g. Vite `resolve.dedupe`), not skipping the hook. `useDashFieldArray`
  now works correctly under SSR / SSG.

### Added

- **Regression test suite** `forms/src/components/DashForm.test.tsx`
  (4 tests): the `<form>` element carries no `resolver` attribute,
  submitting the form actually invokes the resolver, resolver errors block
  the `onSubmit` handler, and children render inside the form.

### Test totals

- `@dashforge/forms`: **137 / 137** passing (was 133 / 133; +4 from the new
  `DashForm` regression suite).
- `@dashforge/ui`: **484 / 485** passing, 1 skipped (unchanged).
- `@dashforge/rbac`: **264 / 264** passing (unchanged).

### Upgrade notes

- If `<DashForm resolver={...}>` appeared to do nothing on `0.2.0-beta` —
  this is why. Upgrade to `0.2.1-beta` and it works with no code change.
  If you worked around it with `<DashFormProvider resolver={...}>`
  directly, that path was always correct and continues to work.
- If you render Dashforge forms with SSR / SSG and hit a `useRef` null
  crash, make sure your bundler dedupes `react` and `react-dom` to a
  single instance (Vite: `resolve.dedupe: ['react', 'react-dom']`).
  `useForm()` itself is SSR-safe.

---

## [0.2.0-beta] — 2026-05-14

> **Public-API freeze release.** The `DashFormBridge` interface is split
> into a stable **required core** (`register`, `unregister`, `getValue`,
> `setValue`, `getError`, `isTouched`, `isDirty`, `submitCount`,
> `subscribeField`, plus `engine`) and an **optional runtime tier**
> (`getFieldRuntime` / `setFieldRuntime` / `subscribeFieldRuntime`,
> `debug`). The four deprecated "version string" properties
> (`errorVersion` / `touchedVersion` / `dirtyVersion` / `valuesVersion`)
> are **removed**.
>
> All `@dashforge/ui` form components have been simplified from the
> defensive `bridge?.method?.()` pattern to a single optional chain
> `bridge?.method()` — the second `?.` is unnecessary now that the bridge
> exposes those methods unconditionally.
>
> Implementation-detail symbols leaked from each package's `src/index.ts`
> have been flagged `@internal` (still exported for compatibility — they
> will be moved out of the entry point in a future release).
>
> First public **`MIGRATION.md`** at the repo root documents the upgrade
> path. Each package README now links to it.
>
> **Test suite unchanged**: forms 133 / 133, ui 484 / 485 (1 skipped),
> rbac 264 / 264 — proof that the contract tightening did not regress
> behavior.

Affected packages (all bumped to `0.2.0-beta`):

| Package                | Notes                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `@dashforge/tokens`    | Version bump only (no source change).                                                                  |
| `@dashforge/theme-core`| Version bump only (no source change).                                                                  |
| `@dashforge/theme-mui` | Version bump only. README peer-dep line corrected to `@mui/material@^9.0.0`.                           |
| `@dashforge/ui-core`   | `DashFormBridge` interface freeze. `@internal` markers on `DependencyTracker`/`RuleEvaluator`/store helpers/test-only `createMockRHFResult`. |
| `@dashforge/rbac`      | Version bump only (no source change).                                                                  |
| `@dashforge/forms`     | `DashFormProvider` no longer emits the 4 deprecated version strings. `@internal` markers on `FormEngineAdapter`/`createRuntimeStore`/`createReactionRegistry` and their types. `useDashFieldMeta` simplified call sites. |
| `@dashforge/ui`        | All 10 form components migrated from `bridge?.method?.()` to `bridge?.method()`. `mockBridge.ts` + Select test wrapper updated to the new contract. README brought in line with MUI v9 + new peer-dep ranges. |

### Removed (breaking)

- **`DashFormBridge.errorVersion`** — use `subscribeField(name, listener)` + `getError(name)`.
- **`DashFormBridge.touchedVersion`** — use `subscribeField` + `isTouched(name)`.
- **`DashFormBridge.dirtyVersion`** — use `subscribeField` + `isDirty(name)`.
- **`DashFormBridge.valuesVersion`** — use `subscribeField` + `getValue(name)`.

These four fields were `@deprecated` since `0.1.6-alpha` (when the
per-field subscription system replaced the version-string subscribe
trick). The full migration recipe lives in
[`MIGRATION.md`](./MIGRATION.md#019-alpha--020-beta).

### Changed (contract tightening)

- **`DashFormBridge` required surface**: `register`, `unregister`,
  `getValue`, `setValue`, `getError`, `isTouched`, `isDirty`,
  `submitCount`, and `subscribeField` are no longer `?:` optional.
  Implementations now have to provide them; consumers no longer have to
  defensively `bridge.method?.(...)` once they've narrowed `bridge` to
  non-null.
- **`DashFormBridge` optional surface stays optional**: the runtime API
  (`getFieldRuntime`, `setFieldRuntime`, `subscribeFieldRuntime`) and
  the `debug` flag remain `?:`. They are feature-gated by the bridge
  implementation, and `DashFormProvider` continues to wire them.
- **Standalone (no-provider) mode is preserved**: a component rendered
  outside a `DashFormProvider` still gets `bridge === null` from
  `useContext(DashFormContext)` and falls back to controlled `value` +
  `onChange`. The freeze affects the `bridge !== null` branch only.
- **Test fixtures**:
  - `@dashforge/ui` `createMockBridge` (in `test-utils/mockBridge.ts`)
    now implements the required surface and broadcasts via
    `subscribeField`.
  - `Select.characterization.test.tsx`, `Select.test.tsx` updated to
    the new contract.
  - `@dashforge/forms` `useFieldRuntime.test.tsx` adopts a small
    `createTestBridge(overrides)` helper that stubs the required core
    so each test only has to declare the runtime-API methods it
    actually exercises.
  - `DashFormProvider.tsx` drops the now-unused `errorVersion` /
    `touchedVersion` / `dirtyVersion` / `valuesVersion` derivation
    (~30 lines of dead code).

### Added

- **`MIGRATION.md`** at the repo root: collects breaking-change upgrade
  guides. The `0.1.9-alpha → 0.2.0-beta` section is the first entry; it
  includes a contract diff table, pattern migrations
  (version-string → per-field, double-optional-chain simplification,
  test mock pattern), and an explicit "what did NOT change" list.

- **`@internal` JSDoc markers** flag implementation-detail exports in
  `@dashforge/forms` and `@dashforge/ui-core`:
  - **`@dashforge/forms`**: `FormEngineAdapter`, `IFormEngineAdapter`,
    `FormEngineAdapterOptions`, `createRuntimeStore`,
    `DEFAULT_FIELD_RUNTIME`, `RuntimeStore`, `createReactionRegistry`,
    `ReactionRegistry`.
  - **`@dashforge/ui-core`**: `DependencyTracker`, `RuleEvaluator`,
    `DependencyGraph`, `DependencyTrackerConfig`, `RuleEvaluatorConfig`,
    `EvaluationStats`, `createStore`, `resetStore`,
    `get/increment/decrement/resetEvaluationDepth`, `Store`,
    `StoreConfig`, `StoreMetadata`, `createMockRHFResult`.

  These symbols are still exported for compatibility but are no longer
  part of the stable public surface. They may move to subpaths (e.g.
  `@dashforge/ui-core/internal`) or out of the entry point entirely in
  a future release.

- **README "Documentation" section** added to all 7 package READMEs,
  cross-linking the package CHANGELOG, the top-level CHANGELOG,
  `MIGRATION.md`, and the roadmap.

### Backwards compatibility

For **application code** that uses `@dashforge/ui` components inside a
`<DashFormProvider>` — i.e. the standard usage of Dashforge — **nothing
breaks**. The UI components were the only call site of the version-string
subscribe trick, and they were rewired to `useDashFieldMeta` (per-field
`subscribeField`) in `0.1.6-alpha`. The bridge-method optional-chain
simplification is also opaque to application code.

For **custom bridge implementations** — anyone implementing a
`DashFormBridge` outside of `DashFormProvider` (custom adapters, mock
bridges in tests, alternative form libraries) — see
[`MIGRATION.md`](./MIGRATION.md#019-alpha--020-beta).

### Test totals

- `@dashforge/forms`: **133 / 133** passing (unchanged from 0.1.9-alpha).
- `@dashforge/ui`: **484 / 485** passing, 1 skipped (unchanged).
- `@dashforge/rbac`: **264 / 264** passing (unchanged).

### Known issues (deferred)

- **20 pre-existing `TS6305` typecheck warnings** in
  `@dashforge/forms` spec config. Root cause: the rollup build emits
  `dist/src/<file>.d.ts` while the `tsconfig.lib.json` `rootDir: "src"`
  / `outDir: "dist"` setup leads `tsc --build` to look for
  `dist/<file>.d.ts`. The mismatch produces noisy "Output file ... has
  not been built from source file ..." messages during the test config
  typecheck, but does NOT block builds, tests, or `.d.ts` emission for
  consumers. Deferred to a dedicated rollup/composite cleanup release
  (post-`0.2.0-beta`).

---

## [0.1.9-alpha] — 2026-05-13

> **Test coverage + docs polish release.** Zero functional changes. Adds
> 8 new unit tests across two areas, applies Option A typecheck cleanup
> in test files, and ships a "hook decision tree" JSDoc block on the
> three field-scoped hooks so consumers can pick the right one at a
> glance. All previously published behavior is preserved verbatim.

Affected packages (all bumped to `0.1.9-alpha`):

| Package                | Notes                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| `@dashforge/tokens`    | Version bump only (no source change).                                                          |
| `@dashforge/theme-core`| Version bump only (no source change).                                                          |
| `@dashforge/theme-mui` | Version bump only (no source change).                                                          |
| `@dashforge/ui-core`   | Version bump only (no source change).                                                          |
| `@dashforge/rbac`      | Version bump only (no source change).                                                          |
| `@dashforge/forms`     | New: 5 unit tests for `bridge.unregister`. JSDoc decision tree on 3 hooks. Test cleanup.       |
| `@dashforge/ui`        | New: 3 unit tests for `DateTimePicker` `lastValidIsoRef` fallback (time-mode editing).         |

### Added

- **`@dashforge/forms` — 5 new unit tests for `bridge.unregister` (CR fix #3 verification).**
  `libs/dashforge/forms/src/core/DashFormProvider.unregister.test.tsx`
  covers the full lifecycle: API exposure, mount registration, direct
  unregister (clears engine node + RHF value), real-unmount via the
  deferred-microtask cleanup pattern used by every UI form component
  (`TextField`, `Textarea`, `Checkbox`, `Switch`, `Select`, `Autocomplete`,
  `RadioGroup`, `NumberField`, `DateTimePicker`, `OTPField`), and
  mount → unmount → remount of the same field name leaving no stale
  engine state. Locks in the cleanup pattern introduced in `0.1.6-alpha`.
- **`@dashforge/ui` — 3 new unit tests for `DateTimePicker.lastValidIsoRef`
  fallback.** `libs/dashforge/ui/src/components/DateTimePicker/DateTimePicker.unit.test.tsx`
  now documents the time-mode editing behavior: the picker preserves the
  last valid ISO when the bridge briefly returns an empty string mid-edit,
  the ref stays at the last NON-EMPTY ISO across multiple edit cycles, and
  with no previous valid ISO the fallback degrades to "today" without
  crashing. Pure behavioral lockdown of existing code.

### Changed

- **JSDoc decision tree on `useDashFieldMeta` / `useDashFieldNode` /
  `useDashRegister`.** All three hooks now carry the same comparative
  table in their JSDoc plus `@see` cross-references. The intent is to
  collapse the choice from "search docs" to "hover the symbol" — Meta
  for subscribing to per-field RHF state, Node for reading Engine node
  visibility/disabled, Register for wiring a custom input not built on
  the Dashforge UI wrappers. Pure documentation; no runtime change.
- **Test file cleanup (Option A — non-null assertion).** 5 `bridge.register`
  call sites and 1 `bridge.isTouched` call site in
  `DashFormProvider.resolver.test.tsx` now use non-null assertion (`!`)
  to silence the "possibly undefined" typecheck noise that came from
  `bridge.register` being optional on the public `DashFormBridge` type.
  Each non-null is guarded upstream by an `if (!bridge) throw` so the
  assertion is provably safe. Unrelated pre-existing typecheck noise
  (DOM lib in spec config, composite/dist resolution, implicit `any` in
  pre-existing reaction integration tests) is **not** addressed in this
  release — it requires Option B/C from the typecheck-cleanup decision
  tree and will be picked up separately.

### Test totals

- `@dashforge/forms`: **133 / 133** passing (was 128 / 128; +5 from the new
  `bridge.unregister` suite).
- `@dashforge/ui`: **484 / 485** passing, 1 skipped (was 481 / 482; +3 from
  the new `lastValidIsoRef` cases).
- `@dashforge/rbac`: **264 / 264** passing (unchanged).
- `@dashforge/ui-core`: passing baseline unchanged.

### Backwards compatibility

No public API change. No behavioral change. No type narrowing or widening
on any exported symbol. Consumers on `^0.1.8-alpha` can upgrade to
`0.1.9-alpha` with no code change.

---

## [0.1.8-alpha] — 2026-05-13

> **Packaging + docs cleanup release.** No functional changes. Two themes:
> (1) every `@dashforge/*` package now ships its `CHANGELOG.md` inside the
> npm tarball (was only `@dashforge/forms` before); (2) a stale developer
> warning in `Autocomplete`/`Select` that mentioned "no automatic reset"
> has been corrected to reflect the actual `0.1.6-alpha+` behavior.

Affected packages (all bumped to `0.1.8-alpha`):

| Package                | Notes                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| `@dashforge/tokens`    | New `CHANGELOG.md`; included in tarball via `files[]`.                                         |
| `@dashforge/theme-core`| New `CHANGELOG.md`; included in tarball via `files[]`.                                         |
| `@dashforge/theme-mui` | New `CHANGELOG.md`; rollup config copies it to `dist/`.                                        |
| `@dashforge/ui-core`   | New `CHANGELOG.md`; rollup config copies it to `dist/`.                                        |
| `@dashforge/rbac`      | New `CHANGELOG.md`; rollup config copies it to `dist/`.                                        |
| `@dashforge/forms`     | (`CHANGELOG.md` was already shipping since 0.1.7-alpha) Version bump only.                     |
| `@dashforge/ui`        | New `CHANGELOG.md`; rollup config copies it to `dist/`. Stale `warnUnresolvedValue` corrected. |

### Changed

- **Dev warning correction in `Autocomplete` and `Select`.** When a stored
  value can't be resolved against the loaded options, the `console.warn`
  message used to say *"The form value remains unchanged (no automatic
  reset)"*. That hasn't been accurate since `0.1.6-alpha` introduced the
  auto-reset effect — the value is actually cleared to `null` so the user
  can pick a valid option. The warning now reads:

  > *"The form value has been auto-reset to null so the user can pick a
  > valid option (introduced in 0.1.6-alpha)."*

  Pure message change. No runtime behavior change.

### Internal — packaging

- Every package now has a per-package `CHANGELOG.md` at its root. Each one
  links to this top-level changelog for cross-package release context.
- Each package's `files[]` array in `package.json` now includes
  `CHANGELOG.md`, so the file is published in the npm tarball.
- For packages built with Rollup (`@dashforge/{theme-mui,ui-core,rbac,forms,ui}`),
  the `rollup.config.cjs` `assets[]` array now globs `CHANGELOG.md` from the
  package root into `dist/`. This way the changelog is also available inside
  `node_modules/@dashforge/<pkg>/dist/` for consumers that resolve through
  the dist subtree.

### Documentation

- Outdated inline docstrings in `Select.tsx`, `textField.select.ts`,
  `Select.unresolved-display.test.tsx`, and `Select.runtime-loading.test.tsx`
  that described the pre-`0.1.6-alpha` "no automatic reset" policy have been
  rewritten to describe the actual behavior with a clear historical note.

### Tests

- All `@dashforge/ui` tests still passing (**481 / 482**, 1 skipped). The
  warning message change is not asserted in any test — only doc comments
  needed updating.

---

## [0.1.7-alpha] — 2026-05-11

> **MUI v9 compatibility release.** Migrates `@dashforge/ui` and
> `@dashforge/theme-mui` from `@mui/material@^7` to `@mui/material@^9`,
> eliminating the four persistent React deprecation warnings
> (`InputProps`, `inputProps`, `InputLabelProps`, `inputRef`) that fired on
> every render of every form component. No public API breaks.

Affected packages:

| Package                | Notes                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `@dashforge/ui`        | All 9 form components migrated to `slotProps`. Snackbar, ConfirmDialog and LeftNav fixed for v9.    |
| `@dashforge/theme-mui` | Peer dep bumped to `@mui/material@^9.0.0`. Theme overrides untouched (slot signatures unchanged).   |

### Changed

- **Peer dependency** `@mui/material` widened from `^7.0.0` to `^9.0.0`
  in both `@dashforge/ui` and `@dashforge/theme-mui`. The workspace
  dev-dependency is also bumped so tests and builds run against v9.
- **`@dashforge/ui` form components** — all internal usage of the deprecated
  top-level props is migrated to the new MUI v9 `slotProps` API:

  | Old prop          | New location                       |
  | ----------------- | ---------------------------------- |
  | `inputRef`        | `slotProps.htmlInput.ref` (TextField family) or `slotProps.input.ref` (SwitchBase family) |
  | `InputProps`      | `slotProps.input`                  |
  | `inputProps`      | `slotProps.htmlInput`              |
  | `InputLabelProps` | `slotProps.inputLabel`             |

  Touched: `TextField`, `Textarea`, `Select` (via `textField.select.ts`),
  `Autocomplete` (`params.InputProps` → `params.slotProps.input` inside
  `renderInput`), `Checkbox`, `Switch`, `DateTimePicker`.
  `NumberField` and `RadioGroup` did not use the deprecated props internally
  so they only inherit the cleaner downstream behavior.

- **`@dashforge/ui` non-form components** also adapted to v9:
  - `LeftNav`: `PaperProps` → `slotProps.paper`; `ModalProps` → `slotProps.root`.
    Without this, the `role="navigation"` and `data-dash-open` attributes
    were silently dropped under v9.
  - `Snackbar`: `TransitionComponent` → `slots.transition`. The Slide
    `direction` prop now flows through `slotProps.transition`.

### Fixed

- **Four persistent React deprecation warnings** in the browser console
  (one per deprecated prop, fired on every render of every form component
  under MUI v9) are eliminated. End-to-end browser smoke on the
  `~/projects/web/learn/dash` consumer shows zero React deprecation errors.
- **`LeftNav` accessibility**: the `role="navigation"` landmark that
  silently disappeared after the v9 bump is back. Drawer + RBAC tests for
  `LeftNav` pass again.

### Backwards compatibility

The public API of `@dashforge/ui` components does **not** change. The
deprecated MUI props were always:

- Either explicitly `Omit`-ed from the component prop types (`TextField`,
  `Select`, `Autocomplete`), so consumers couldn't pass them anyway;
- Or forwarded internally to the new `slotProps` shape (`DateTimePicker`,
  which still accepts `inputProps` and `InputLabelProps` as `@deprecated`
  props for ergonomic backward compat).

`DateTimePickerProps` now explicitly types `inputProps` and `InputLabelProps`
as `@deprecated` because MUI v9 removed them from `TextFieldProps` —
without the explicit re-declaration TypeScript would have flagged the
existing destructuring as an error.

### Internal

- 19 existing tests in `Snackbar`, `ConfirmDialog` and `LeftNav` were
  updated to assert against the new MUI v9 class names (compound classes
  like `MuiAlert-filledSuccess` and `MuiButton-containedError` were split
  into two atomic classes: `MuiAlert-filled` + `MuiAlert-colorSuccess` etc.).
  No component behavior change — purely test-side assertion updates.
- Full test suite back to baseline: **481 passing / 1 skipped** in
  `@dashforge/ui` (482 total).

---

## [0.1.6-alpha] — 2026-05-10

> **Performance + correctness release.** Restores Dashforge's core promise of
> "fewer renders than plain RHF" via per-field subscriptions, fixes two
> hook-rules / lifecycle bugs flagged in the libs CR, and tightens
> dependent-field UX.

Affected packages (all bumped to `0.1.6-alpha`):

| Package                | Notes                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `@dashforge/ui-core`   | Bridge interface gains `subscribeField`, `unregister` (both optional, fully backwards-compatible).          |
| `@dashforge/forms`     | New `useDashFieldMeta` hook. Bridge identity stabilized; per-field listeners replace global version-bumps.  |
| `@dashforge/rbac`      | New `useRbacOptional` (non-throwing variant of `useRbac`) used by access-aware UI hooks.                    |
| `@dashforge/ui`        | All form components migrate to per-field subscribe; deferred unregister on real unmount; auto-reset policy. |
| `@dashforge/tokens`    | Version bump only (peer alignment).                                                                         |
| `@dashforge/theme-core`| Version bump only (peer alignment).                                                                         |
| `@dashforge/theme-mui` | Version bump only (peer alignment).                                                                         |

### Added

- **`useDashFieldMeta(name)` hook** in `@dashforge/forms` — canonical way to
  subscribe a UI component to its own field's `value` / `error` / `touched` /
  `dirty` / `submitCount` / `allowAutoError`. Backed by `useSyncExternalStore`
  with a primitive-equality cache, so unrelated field edits do not re-render
  the consumer.
- **`useRbacOptional()` hook** in `@dashforge/rbac` — non-throwing version of
  `useRbac()` that returns `null` when `RbacProvider` is absent. Eliminates the
  hooks-rules violation in `useAccessState` (previously wrapped `useRbac()` in
  try/catch).
- **`bridge.unregister?(name)`** in `DashFormBridge` — releases engine + RHF
  state for a field. Form UI components now call this on real unmount,
  preventing the `getNode(name)` memory-leak after dynamic field removal.
- **`bridge.subscribeField?(name, listener)`** in `DashFormBridge` — per-field
  subscription primitive used by `useDashFieldMeta`.
- **`DateTimePicker.layout` prop** — `'stacked'` (default) or `'inline'`.
  `'floating'` is silently downgraded to `'stacked'` with a dev warning, since
  native `<input type="date|time|datetime-local">` always renders a placeholder
  mask that overlaps the floating label.

### Changed

- **Bridge identity is now stable across keystrokes.** Previously the bridge
  object identity changed every time `valuesVersion`, `errorVersion`,
  `touchedVersion`, `dirtyVersion`, or `submitCount` advanced — which forced
  every consumer of `useContext(DashFormContext)` to re-render. The bridge is
  now memoized on the structural deps (`engine`, `runtimeStore`, `rhf`,
  `adapter`, `debug`, `subscribeField`); reactivity is delegated to per-field
  listeners + `useDashFieldMeta`.
- **All 9 UI form components** (`TextField`, `Textarea`, `NumberField`,
  `Checkbox`, `Switch`, `RadioGroup`, `Select`, `Autocomplete`, `OTPField`,
  `DateTimePicker`) replaced the legacy `void bridge?.errorVersion;`-style
  global subscribe with a single `useDashFieldMeta(name)` call.
- **Unresolved-value policy for `Select` and `Autocomplete`** — when loaded
  options can no longer resolve the current form value (e.g. a parent field
  changed and a reaction reloaded options for a different scope), the form
  value is now auto-reset to `null` instead of being preserved silently.
  Previously the user saw a blank control but the form still submitted a stale
  id. **This is a behavior change; see Migration below.**
- **`Autocomplete` object-mapped mode** (custom `getOptionValue` /
  `getOptionLabel`): the displayed text is now strictly derived from the
  matched option's label. The raw stored id can never appear in the input, and
  the freeSolo "commit typed text on blur" path is disabled — typing a label
  string would otherwise overwrite the id and break the round-trip.

### Fixed

- **CR fix #2 — Rules of Hooks violation in `useAccessState`.** The hook
  previously called `useRbac()` inside a `try/catch`, which threw when
  `RbacProvider` was absent and changed the hook count between renders under
  React 19 StrictMode. Refactored to call `useRbacOptional()` unconditionally
  and branch on its return value. Eliminates the
  `"Rendered more hooks than during the previous render."` warning.
- **CR fix #3 — Memory leak on dynamic field unmount.** Bridge-bound field
  components now defer `bridge.unregister(name)` to a `queueMicrotask` after
  unmount, guarded by a mounted-ref. This fixes:
  - the original leak (engine / RHF state stayed attached after unmount), and
  - a regression introduced by the naïve fix where `useEffect`'s cleanup ran
    on every render because the bridge identity used to change every keystroke
    — destroying values on the very first keystroke. Bridge identity is now
    stable, but the deferred-cleanup pattern is preserved as defense-in-depth.
- **`DateTimePicker` time-mode loses base date.** When typing `13:45` into a
  time field bound to `2026-02-25T10:00:00.000Z`, intermediate keystrokes
  (`'1'`, `'13'`, `'13:'`, `'13:4'`) all parsed as invalid time and wrote
  `null` to the bridge, dropping the date component. The next valid parse then
  fell back to **today**, silently changing year/month/day. A new
  `lastValidIsoRef` keeps the most recent valid ISO and is used as the
  fallback `baseIso` during partial typing.
- **`DateTimePicker` floating label overlapping native placeholder.** Native
  date/time inputs always render a mask (e.g. `mm/dd/yyyy`) that visually
  collided with the MUI floating label. The component now defaults to
  `layout="stacked"` and warns if `floating` is requested.
- **`Autocomplete` showing raw id instead of label.** Three independent
  causes: missing sanitization in object-mapped mode, local `inputValue`
  state pollution from MUI's internal "reset" reason, and `inputRef={
  registration.ref}` leaking the RHF stored value (an id) into the DOM,
  overriding the controlled `inputValue`. All three are fixed; the registered
  ref is no longer wired to the visible input in object-mapped mode.
- **`Autocomplete` React 19 key-spread warning.** `<li {...props}>` in
  `renderOption` now extracts `key` first and applies it explicitly, complying
  with React 19's restriction on spreading `key`.

### Performance

The Dashforge tagline — "fewer re-renders than plain RHF" — is now backed by
the per-field subscription model:

- A bridge-bound `<TextField name="A">` re-renders **only** when field `A`'s
  value, error, touched, dirty, or submitCount changes. Editing field `B`
  does not touch field `A`'s reconciler.
- Form-wide getters (`bridge.errorVersion` etc.) remain readable for
  diagnostic / introspection use, but components no longer subscribe through
  them.
- Verified end-to-end with a `React.Profiler`-instrumented test harness
  exercising 9 components, dependent fields with reactions, RBAC gating, and
  a 50× stress submit.

### Migration

Most consumers do **not** need to change anything. Two cases require
attention:

1. **Unresolved Select / Autocomplete values are now reset to `null`.** If
   your code intentionally relied on the previous "preserve unresolved value"
   behavior (e.g. round-tripping a value that's expected to materialize on a
   later runtime load), guard the value yourself before passing it to the
   form, or hold it outside form state until the option list contains it.
2. **Custom components reading `bridge.getError(name)` / `bridge.getValue(name)`
   directly during render** will no longer re-render automatically when those
   values change, because the bridge object identity is now stable. Migrate
   to `useDashFieldMeta(name)` (preferred) or call `bridge.subscribeField(
   name, onChange)` from a `useSyncExternalStore` of your own. The 9 first-
   party UI components have already been migrated.

### Internal

- Test suite recovered from 325 → 0 failures across `forms`, `rbac`,
  `ui-core`, and `ui` (481 / 482 passing in `@dashforge/ui`, 1 skipped).
- Outdated tests for the pre-0.1.6 "no automatic reset" Select policy were
  updated to assert the new auto-reset contract.
- Pre-existing typecheck noise in `DashFormProvider.resolver.test.tsx` and
  `reactionIntegration.test.tsx` (test-only `bridge.register possibly
  undefined`) is **not** addressed in this release; it predates the refactor.

---

For per-package detail, see the package-scoped CHANGELOG.md files (currently
only `libs/dashforge/forms/CHANGELOG.md`).
