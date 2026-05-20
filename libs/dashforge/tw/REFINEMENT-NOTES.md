# REFINEMENT-NOTES — `@dashforge/tw` Table + DataGrid

> Sprint 6 P2 deliverable (2026-05-20). Blind technical review of
> `<Table>` + `<DataGrid>` — what was fixed, and what was explicitly
> deferred.

## Fixed in Sprint 6 P2

| ID | Area | Fix |
|----|------|-----|
| D1 | DataGrid a11y | `aria-rowcount` on the `<table>` (true dataset size, not the virtualized window) + `aria-rowindex` on the header row (1) and every data row (`absoluteIndex + 2`). A screen reader now announces the real position. |
| D3 | DataGrid a11y | Column resize is now keyboard-operable: the resize handle is `tabIndex=0`, `ArrowLeft`/`ArrowRight` nudge the width 16px (64px with Shift), `aria-valuemin/max/now` announce the bounds. New `nudge()` on `useColumnResize`. |
| D6 | DataGrid bug | The resize handle on a reorderable column could also start a column-reorder drag (the `<th>` is `draggable`). Handle now sets `draggable={false}` — grabbing it always resizes. |
| D2 | DataGrid touch | Column reorder rides native HTML5 drag-and-drop, whose events don't fire on touch. The grid now detects a coarse pointer (`matchMedia('(pointer: coarse)')`) and disables the `draggable` affordance there, so it isn't a dead interaction. (Full touch reorder — see Deferred below.) |
| D4 | DataGrid UX | `Enter` in any filter Popover input now applies the filter (was: must click "Apply"). |
| D7 | Table + DataGrid UX | Empty state distinguishes a genuinely empty dataset (`noData`) from one emptied by an active search / filter (`noResults`). New `TableLabels.noResults`. |
| D8 | Table | Verified non-issue — Table is auto-height by design; skeleton rows inherit cell density padding. Added a clarifying code comment. |
| M4 | Cell library | Cleaned up a self-contradictory comment in `RenderChip` (the `solid neutral` variant). |
| T1 | Table | `getRowId` stays optional (back-compat) but now emits a dev-only `console.warn` when omitted while sort / search / selection / expandable is active — the positional-index fallback breaks row identity on reorder. Expanded the prop JSDoc. |

## Deferred — tracked follow-ups

### T3 — Per-column filter UI on `<Table>`
`<DataGrid>` got the in-header filter Popover in 0.8.0-beta (`filterable: true`).
`<Table>` still only accepts a controlled `filterModel` with no UI to
produce it. Porting `ColumnFilterTrigger` + the filter pipeline to
Table is a feature, not a refinement — it belongs in a dedicated
feature sprint (or post-1.0). Until then, Table's `filterModel` is
consumer-driven only.

### C2 — Cell renderer library additions
The library ships `RenderText`, `RenderTwoLine`, `RenderChip`,
`RenderButton`, `RowActionsMenu`. Common table-cell patterns still
missing:
- `RenderDate` — locale-aware date formatting (`Intl.DateTimeFormat`,
  zero-dep)
- `RenderAvatar` — avatar image / initials + label, the canonical
  "user" cell
- `RenderLink` — a styled anchor honoring the theme

Purely additive — slated for a feature sprint, not refinement.

### D2-full — Pointer-events column reorder (touch support)
The D2 fix above is *graceful degradation* — reorder is cleanly
unavailable on touch rather than silently broken. A proper touch
implementation means replacing `useColumnReorder`'s HTML5
drag-and-drop with pointer events (à la `useColumnResize`): track
`pointerdown` → `pointermove` with hit-testing (`elementFromPoint`)
for the drop target → `pointerup` to commit. Meaningful rewrite —
deferred to a follow-up so P2 stays a refinement pass.
