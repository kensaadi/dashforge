# COVERAGE — `@dashforge/tw`

> Test-coverage audit for `@dashforge/tw`. Current numbers, the gap-fill
> performed, and the tracked debt.

## Current coverage (`vitest --coverage`, v8 provider)

| Metric | Value | Target |
|--------|-------|--------|
| Statements | 83.53% | — |
| **Branches** | **75.87%** | 85% (not met — see Deferred) |
| Functions | 89.06% | — |
| **Lines** | **85.78%** | 85% ✅ |

Suite: **1105 tests** across 55 files.

## Filled in Sprint 6 P4 (+62 tests)

P4 targeted the Sprint 4.2 / 4.2-bis additions that shipped with
integration-only coverage. All are now directly unit-tested:

| Area | Before | After |
|------|--------|-------|
| Cell renderer library (`Table/cells/` — RenderText / RenderTwoLine / RenderChip / RenderButton / RowActionsMenu) | ~0% | high (30 tests) |
| `DataGrid/filters/ColumnFilters.tsx` | 22% branch | covered — every filter type + apply/clear/Enter (17 tests) |
| `DataGrid/resize/useColumnResize.ts` | 33% | **100%** (8 tests — `nudge` clamp paths + pointer-drag commit) |
| `DataGrid/reorder/useColumnReorder.ts` | 32% | 93% stmts / 98% lines (14 tests — `moveColumn` + drag handlers) |

## Deferred — pre-Sprint-6 branch-coverage debt

Line coverage met the 85% target. **Branch coverage (75.87%) did
not.** The shortfall is concentrated in form-input components that
predate Sprint 6 and shipped with partial branch coverage — their
validation-state / RBAC / controlled-vs-uncontrolled branches are
under-exercised:

| Component | Branch % |
|-----------|----------|
| `NumberField` | 50.56% |
| `AppShell` | 55.81% |
| `Textarea` | 56% |
| `Switch` | 62.5% |
| `TextField` | 63.63% |
| `RadioGroup` | 64.06% |
| `Checkbox` | 67.5% |
| `Autocomplete` | 68% |
| `OTPField` | 69.56% |
| `Dialog` | 75% |
| `DataGrid` | 76.15% |

Closing this to 85% overall is a focused **test-debt paydown
sprint** (~100+ branch-targeted tests across the 11 components) —
deliberately scoped OUT of Sprint 6, which is a Table/DataGrid +
theme-core refinement pass. Recommended slot: alongside the
`1.0.0-rc` hardening sprint.

## CI gate

The catalog-wide regression suite (`nx test @dashforge/tw`) is the
enforced gate. A hard per-file coverage threshold is **not** wired
into CI yet — doing so requires first closing the pre-Sprint-6 debt
above, otherwise the gate fails on day one. Wiring the threshold is
part of the same `1.0.0-rc` test-debt sprint.
