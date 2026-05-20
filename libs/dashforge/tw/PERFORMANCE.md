# `@dashforge/tw` performance baseline

> Sprint 3 P4 deliverable (2026-05-19). Establishes the pre-`1.0.0`
> performance commitment for `@dashforge/tw@0.4.0-beta` (29
> components). Every subsequent release MUST hold this line or
> justify the regression in `CHANGELOG.md`.

## Bundle size

### Full library (`dist/index.esm.js`)

Measured immediately after `nx build @dashforge/tw` on the
`0.4.0-beta` source tree.

| Metric | Value |
|---|---|
| Raw size | **312 KB** (319,924 bytes) |
| Gzipped | **68.85 KB** (70,499 bytes) |
| Brotli (estimate) | ~58 KB |

### Historical bundle trajectory

| Version | Raw | Gzipped | Components | Delta vs prev |
|---|---|---|---|---|
| `0.1.0-beta` | 255 KB | ~57 KB | 16 (tier-1/2/3) | baseline |
| `0.2.0-beta` | 272 KB | ~60 KB | 24 (+8 foundation) | +17 KB raw |
| `0.3.0-beta` | 272 KB | ~60 KB | 24 | 0 (no new components) |
| `0.4.0-beta` | **312 KB** | **68.85 KB** | 29 (+5 tier-4) | **+40 KB raw / +8.85 KB gz** |

The `0.4.0-beta` delta is the cost of 5 new Tier-4 components +
their 5 Radix UI primitive dependencies (`@radix-ui/react-dialog`,
`-tabs`, `-tooltip`, `-popover`, `-accordion`). The Radix runtime
sub-dependencies (`@radix-ui/react-portal`, `-presence`,
`-dismissable-layer`, etc.) are shared across primitives so the
marginal cost of each new primitive after the first is smaller.

### Tree-shaken size — per-component source weight

Tree-shaken bundle size depends on the consumer's bundler (Vite,
webpack, esbuild, Rollup). The TS source size below is a **proxy**
for the contribution each component makes — not the precise
tree-shaken cost, which includes the Radix runtime and shared
helpers (`cn()`, `tailwind-variants`).

| Component | Source bytes | Tier |
|---|---:|---|
| Autocomplete | 49,020 | Tier-3 (heaviest — multi-select + free-solo + async) |
| LeftNav | 18,002 | F6 (navigation) |
| RadioGroup | 16,946 | Tier-2 |
| NumberField | 16,289 | Tier-2 |
| DateTimePicker | 16,075 | Tier-3 |
| Checkbox | 15,732 | Tier-1 |
| Grid | 15,086 | F10 (foundation) |
| TextField | 14,772 | Tier-1 |
| Snackbar | 14,770 | F7 |
| Box | 14,039 | F9 (foundation) |
| ConfirmDialog | 13,361 | F7 |
| AppShell | 12,734 | F6 |
| Button | 12,628 | Tier-1 |
| OTPField | 12,497 | Tier-2 |
| Breadcrumbs | 11,694 | F6 |
| Typography | 11,619 | F9 |
| Divider | 11,026 | F10 |
| Textarea | 10,310 | Tier-2 |
| Stack | 9,131 | F9 |
| Switch | 8,711 | Tier-1 |
| **Dialog** | **7,421** | **Tier-4 (new)** |
| Container | 6,754 | F10 |
| **Accordion** | **6,150** | **Tier-4 (new)** |
| **Tabs** | **5,303** | **Tier-4 (new)** |
| AspectRatio | 4,871 | F10 |
| TopBar | 4,723 | F6 |
| **Tooltip** | **4,389** | **Tier-4 (new)** |
| **Popover** | **3,747** | **Tier-4 (new)** |
| VisuallyHidden | 3,744 | F10 |

The 5 new Tier-4 components contribute **~27 KB of source** combined
— roughly aligned with the +40 KB raw bundle delta (the extra
~13 KB is Radix runtime).

### Representative bundle subsets

If a consumer imports only a subset, expected gzipped cost
(estimated, depends on bundler):

| Subset | Components | Estimated gzipped |
|---|---|---|
| Atomic (Button only) | 1 | ~6 KB |
| Form bundle | TextField + Checkbox + Switch + RadioGroup + NumberField + Textarea + OTPField | ~28 KB |
| Layout bundle | Box + Stack + Grid + Container + AppShell + LeftNav + TopBar + Breadcrumbs | ~24 KB |
| Foundation (F9 + F10) | Typography + Box + Stack + Grid + Container + Divider + AspectRatio + VisuallyHidden | ~18 KB |
| Tier-4 overlay primitives | Dialog + Tabs + Tooltip + Popover + Accordion | ~12 KB |
| Full library | 29 | **68.85 KB** |

Estimates are upper bounds — actual tree-shaking can do better if
the consumer doesn't trigger code paths (e.g. importing
`<Autocomplete>` without using `loadOptions` won't strip the async
loader code from the bundle, but other unused components are
fully eliminable).

## Render performance

### Sprint 2 baseline (in `dash` consumer, React Profiler)

Measured in
`~/projects/web/learn/dash/src/pages/TestFoundation.tsx` — page
mounts all 8 Foundation primitives × ~6 instances each (50+
primitives total) inside `<DashforgeTailwindProvider>` wrapped in
`<React.Profiler>`:

| Operation | Time | Notes |
|---|---|---|
| First mount | **12.1 ms** | Cold cache, no styles compiled yet |
| Re-render (no state change) | **7.0 ms** | After style cache warm |
| Re-render (state change) | **8.6 ms** | One field updated, sibling fields untouched |

Within the **60 fps budget** (16.67 ms per frame) for the full page
mount + every subsequent interaction. The primitives are pure (no
internal `useState`, no `useEffect`, only className resolution via
`tv()` + `cn()`), so React's reconciler trivially handles re-renders
without `React.memo`.

### Tier-4 components — expected render cost

Tier-4 components (Dialog, Tabs, Tooltip, Popover, Accordion) carry
internal Radix state machines. Render cost is dominated by Radix's
own reconciliation, which is well-optimized. Expected ranges:

| Component | Expected mount | Notes |
|---|---|---|
| Tooltip | <1 ms | Renders nothing until hover; portal mount on open is ~2 ms |
| Popover | <1 ms | Same as Tooltip |
| Tabs | ~2 ms | Static — all triggers + active panel mount once |
| Accordion | ~3 ms | Per-item triggers + lazy panel mount |
| Dialog | ~3 ms | Portal + focus trap setup on open |

These are estimates based on Radix's published benchmarks. Real
consumer-app numbers will be captured in Sprint 3 follow-up
end-to-end validation pass (`/test-tier-4` page in `dash`).

## Regression budget policy

**Every PR that touches a component or adds a new export MUST**:

1. Re-run `nx build @dashforge/tw` and check the new
   `dist/index.esm.js` size (raw + gzipped).
2. If the gzipped delta is **> +5%** vs the previous release,
   include in the PR description:
   - The bytes added (raw + gzipped)
   - The reason (new component / new feature / new dep / refactor)
   - A justification for why the cost is worth it
3. If the gzipped delta is **> +10%**, the PR also requires a
   reviewer's sign-off on the bundle impact explicitly (not a
   silent pass).

The 5% threshold at the current 68.85 KB baseline = 3.4 KB. That's
enough headroom for a typical component-level change (e.g. adding a
single Radix primitive's worth of code) without the policy
triggering, but small enough that a careless dep addition gets
flagged.

## Render perf test suite (Sprint 6 P3)

CI-enforced render budgets, co-located as `*.perf.test.tsx`. Bounds
are deliberately generous — they catch **order-of-magnitude**
regressions (an accidental O(n²) in the pipeline, or a virtualization
break that mounts the full dataset), not micro-jitter.

### `<Table>` — non-virtualized (`Table.perf.test.tsx`)

| Scenario | Budget | Asserts |
|---|---|---|
| Mount 500 rows (Table's row-count ceiling) | < 800 ms | render path stays linear |
| 500 rows in DOM | exactly 500 `<tbody tr>` | non-virtualized contract |
| Default sort over 500 rows | < 800 ms | sort pipeline is not O(n²) |

### `<DataGrid>` — virtualized (`DataGrid.perf.test.tsx`)

| Scenario | Budget | Asserts |
|---|---|---|
| Mount 10 000 rows | < 500 ms | render is O(window) |
| 10 000-row DOM node count | < 100 `<tbody tr>` | only the window is mounted |
| Mount 100 000 rows | < 800 ms | cost does NOT scale with the dataset |

The 100 000-row test is the load-bearing one: if a regression makes
`renderedRows` slice the full array, the DOM-node-count assertion
fails immediately (100k `<tr>` ≫ 100).

## Strict gate assessment (Sprint 6 P3)

A probe enabled `exactOptionalPropertyTypes` + `noUncheckedIndexedAccess`
+ `noUnusedParameters` on `@dashforge/tw`. Result: **42 errors, zero
real bugs.** Every hit was either pedantic (`exactOptionalPropertyTypes`
flagging `fn | undefined` passed to an optional prop) or invariant-safe
but unprovable (`noUncheckedIndexedAccess` flagging array accesses
already guarded by a `.length` check — AppShell focus trap, RadioGroup
option access, Autocomplete highlight index).

**Decision**: enabling those flags is a workspace-wide change (the
`@dashforge/source` path mapping pulls the bridge layer's source into
the same program) for near-zero bug-catching value. Deferred to the
`1.0.0-rc` hardening sprint. The codebase is already solid under the
current `strict: true` baseline + `noImplicitOverride` /
`noImplicitReturns` / `noUnusedLocals` / `noFallthroughCasesInSwitch`.
ESLint is on `typescript-eslint recommended` + `react-hooks
recommended` + Nx boundary/dependency checks; promotion to
`strict-type-checked` (type-aware `no-unsafe-*` / `no-floating-promises`)
is the same workspace-wide 1.0-rc item.

## Console hygiene (Sprint 6 P3)

The full test run is audited for stray `console.error` / `console.warn`.
Sprint 6 P3 fixed the one finding: Radix logged 8× *"Missing
`Description` or `aria-describedby` for DialogContent"* — `<Dialog>`
now passes `aria-describedby={undefined}` on the content when no
`description` is supplied (Radix's documented opt-out). Console is
clean apart from a single jsdom-only *"Not implemented: navigation"*
(an environment limitation, not a component defect).

## Reference

- **Build command**: `nx build @dashforge/tw`
- **Measurement script**: `gzip -c dist/index.esm.js | wc -c`
- **Render perf setup**: see Sprint 2 P1
  (`/test-foundation` route in `dash` consumer)
- **Render perf suite**: `*.perf.test.tsx` (Sprint 6 P3 — Table + DataGrid)
- **CHANGELOG entries**: every release records the bundle delta
  in the `Compatibility` section
