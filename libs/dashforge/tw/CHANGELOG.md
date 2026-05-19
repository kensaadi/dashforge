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

## [0.6.0-beta] — 2026-05-19

**Sprint 4.1 release.** Ships the central piece of the data layer
— a market-grounded `<Table>` built from scratch with NO new
runtime deps. The design references Stripe (visual style),
Atlassian / Jira (column UX), and Pencil & Paper UX research
(density tiers, hover-revealed row actions, selection patterns).
The existing MUI Table inherited from `hub-ws/admin` informed the
public API shape but not the implementation (we discarded the
`@mui/x-data-grid` backing — Table v1 is a hand-rolled native
`<table>`).

**Companion to Sprint 4.2** (DataGrid, virtualization, 10k+ rows)
— Table v1 covers the 80% admin-list use case up to ~500 rows.

**Minor bump** for the new public API surface — 15+ new exports.
Strictly additive — zero breaking changes. Drop-in upgrade from
`0.5.0-beta`.

### Added

- **`<Table>`** — declarative-first data table component.
  - **Smart defaults**: column types auto-detected from the first
    non-null value across visible rows. Number columns get
    `text-right` + `tabular-nums` (digit grid alignment), date
    columns get `tabular-nums` too, booleans get `text-center`,
    strings get `text-left`. **The library never changes the font
    family** — `tabular-nums` is a font-feature setting that
    preserves the consumer's theme `font-sans`. Explicit
    `align` / `tabularNums` / `monospace` per column wins.
  - **Sort**: per-column `sortable: true` (default comparator
    handles string / number / Date / boolean / bigint with
    null-last invariant) or custom `(a, b) => number`. Click
    cycles asc → desc → none. **Shift-click** adds the column to
    a multi-sort model. Controlled via `sortModel` /
    `onSortChange` or uncontrolled with internal state.
  - **Search**: `enableSearch` renders a debounced input above
    the table (default 200 ms). Matches any column flagged
    `searchable: true`. **Nested keys supported** at runtime via
    `getNestedValue(row, 'address.city')` — the type-level
    autocomplete from `NestedKeyOf<T>` matches the runtime
    behavior. Stringification covers string / number / boolean /
    Date / array / object.
  - **Selection**: `rowSelection: 'none' | 'single' | 'multiple'`,
    optional select-all checkbox in the header (multiple mode),
    `selectedRowIds` controlled state, **sticky bulk-action
    footer** rendered only when at least one row is selected
    (Pencil & Paper UX pattern: "appear only when selected").
  - **Expandable rows**: `expandable={{ render, expandedRowIds?,
    onExpandChange? }}`. Chevron toggle in a dedicated column;
    `aria-expanded` updates; expanded detail renders as a
    full-width sibling `<tr>` below the row.
  - **Row actions revealed on hover**: `rowActions={(row) => …}`
    slot — by default hidden via opacity, revealed on
    `tr:hover` / `tr:focus-within` (Stripe pattern — reduces
    visual density while keeping actions discoverable).
  - **RBAC at 3 levels**: table-level `access` (hides / disables
    the whole table), per-column `cols[i].access` (`hide` removes
    the column entirely from header AND every row cell), and
    per-action `actions[i].access` on `<RowActionsMenu>`.
  - **A11Y**: semantic `<table>` + `<th scope="col">` + `aria-sort`
    on sortable headers + `aria-selected` on selected rows +
    `aria-expanded` on expand toggles + `<caption>` (optional,
    `sr-only` by default) + keyboard nav via Tab + Enter/Space.
  - **Loading state**: `loading={true}` renders N `<Skeleton>` rows
    (the Sprint 4 component) with `aria-busy="true"`. Count
    configurable via `loadingRowCount` (default 5).
  - **i18n**: column `header` accepts plain strings (pass
    `t('...')`); all internal default strings configurable via
    `labels` prop with English defaults (search placeholder, a11y
    announcements for sort / select / expand, selection counter
    with `{count}` placeholder, density / filter labels). Same
    pattern as `<Pagination>`.
  - **5 variants** (`plain` · `lines` default — Stripe-style ·
    `striped` · `bordered` · `card`) × **3 sizes** (`sm` · `md` ·
    `lg`) × **3 densities** (`compact` 40px · `comfortable`
    default 48px · `spacious` 56px — Pencil & Paper UX research).
  - **Sticky header** by default (overridable).
  - **`sx` + 15 slot props** for the standard customization
    escape hatches.

- **Cell renderer library** — pre-built renderers for common
  patterns, exported from `@dashforge/tw`:
  - `RenderText` — one-line, optionally truncated / muted
  - `RenderTwoLine` — bold primary + muted secondary
    (name + email pattern)
  - `RenderChip` — internal status badge, 7 intent colors × 3
    variants (soft / solid / outline) × 2 sizes (sm / md)
  - `RenderButton` — inline button wrapper (defaults `ghost` +
    `sm`)
  - `RowActionsMenu` — 3-dot Popover-backed menu with per-action
    RBAC

- **Helpers exported for power use**:
  - `getNestedValue(row, path)` — dotted-path lookup powering
    cell rendering. Useful in consumer custom renderers.

- **Theme identity regression guard** —
  `_internal/themeIdentity.test.ts` scans every Table source file
  and fails if `dark:*-neutral-N` classes are introduced. The
  dashforgePreset auto-inverts the neutral palette via CSS var
  swap; adding `dark:` variants on neutral creates double
  inversion and breaks dark mode. The Sprint 4.1 fix removes the
  anti-pattern from Table; **Sprint 4.3 will sweep the rest of
  the catalog** (Typography, Box, etc. carry the same latent bug).

- **Smoke-test page** in `dash` consumer at `/test-table` —
  exercises every Table feature with 30 realistic users + nested
  meta + chip-rendered status + RBAC per-column + i18n labels in
  Italian + 5 variants × 3 sizes × 3 densities switcher.

- **Doc MDX** `/tw/docs/components/table` — full feature catalog,
  i18n example with `react-i18next`, override matrix
  (align / tabularNums / monospace), 15+ slot props reference,
  cell renderer library, A11Y guarantees, roadmap.

### Internal

- **Theme identity rule** (now codified): the dashforgePreset
  default IS the Dashforge visual identity. Consumer apps consume
  it as-is and never override. Adding `dark:` variants on the
  neutral palette = double inversion = breaks dark mode. Use
  canonical patterns (LeftNav `itemActive` for selected,
  auto-invert for `bg-neutral-*` and `text-neutral-*`).
- **Font family rule**: the library never picks a font family —
  `tabular-nums` is safe to auto-apply (font-feature setting),
  `font-mono` is consumer opt-in only via `col.monospace: true`.
  The dashforgePreset does not own the `fontFamily` axis; the
  consumer configures their mono stack in their own
  `tailwind.config.ts` `theme.extend.fontFamily.mono`.
- **+147 new unit tests** for Table:
  - `getNestedValue` (11) — nested keys, null-safety, zero / empty
    string / false preservation
  - `useTableSearch` (16) — stringification across primitive types
    + nested keys
  - `useTableSort` (15) — null-last invariant (direction-independent),
    multi-column tie-breaking, custom comparator
  - `useTableSelection` (13) — single / multiple / none modes
  - `useColumnAutoDetect` (14) — type inference + align /
    tabularNums / monospace resolution
  - `themeIdentity` (18 file scanner) — regression guard for
    `dark:` on neutral palette
  - `Table.test.tsx` (57) — rendering, smart defaults, sort,
    search, selection, expandable, row actions, RBAC, variants,
    densities, sizes, sx + slotProps, i18n
- Full TW suite at **828/828 passing** (46 files; +147 from
  Table, +newer guard).

### Compatibility

| Axis | Pre-`0.6.0` | Post-`0.6.0` |
|---|---|---|
| Public API surface | 31 components | **+ 1 (`Table`)** + 5 cell renderers + `getNestedValue` helper + `Table*` types (`TableProps`, `TableColumn`, `TableSortModel`, `TableFilterModel`, `TableLabels`, `TableCellContext`, `NestedKeyOf`, `TableRowAction`, …) |
| Peer deps | `react ^18 \|\| ^19`, `tw-theme workspace`, `tw-tokens workspace` | unchanged |
| Bridge deps | `forms` / `rbac` / `ui-core` `workspace:*` | unchanged |
| New runtime deps | — | **none** (no `@tanstack/*`, no DnD libs — constraint honored) |
| Breaking changes | — | Zero |
| Bundle size | 336 KB raw / 73.9 KB gzipped | **402 KB raw / 91 KB gzipped** (+66 KB raw / +17 KB gz / **+23% gz**) |
| Migration | — | Drop-in. Zero code changes required on existing usages. |

> **Bundle regression note**: the +23% gz delta is **above the
> 10% reviewer-sign-off threshold** documented in
> `PERFORMANCE.md`. Justification:
> Table is the lib's central data-display primitive — it includes
> sort + search + selection + expandable + RBAC at 3 levels + 5
> cell renderers + RowActionsMenu (using Popover) + 5 variants ×
> 3 sizes × 3 densities. The bundle weight is proportional to
> the feature surface. Sign-off rationale: this is the
> "MUI X DataGrid Community alternative" component — the single
> highest-value addition before 1.0. Sprint 4.3 (theme identity
> sweep) will recover -1 to -3 KB gz by removing redundant
> `dark:` variants across the catalog.

### Migration

No code changes required:

```bash
pnpm up @dashforge/tw@^0.6.0-beta
```

To adopt the new Table:

```tsx
import { Table, RenderTwoLine, RenderChip, RowActionsMenu } from '@dashforge/tw';
import { useTranslation } from 'react-i18next';

function UsersTable({ users }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Table
      rows={users}
      cols={[
        {
          field: 'name',
          header: t('users.fields.name'),
          sortable: true,
          searchable: true,
          cellRenderer: ({ row }) => (
            <RenderTwoLine primary={row.name} secondary={row.email} />
          ),
        },
        {
          field: 'salary',
          header: t('users.fields.salary'),
          sortable: true,
          // Right-aligned + tabular-nums automatically. Font family
          // stays whatever the consumer's theme provides — opt into
          // `monospace: true` if you want font-mono explicitly.
          access: {
            resource: 'employee.salary',
            action: 'read',
            onUnauthorized: 'hide',
          },
        },
        {
          field: 'status',
          header: t('users.fields.status'),
          cellRenderer: ({ value }) => (
            <RenderChip
              color={value === 'active' ? 'success' : 'warning'}
            >
              {String(value)}
            </RenderChip>
          ),
        },
      ]}
      getRowId={(r) => r.id}
      enableSearch
      rowSelection="multiple"
      selectedRowIds={selected}
      onSelectionChange={setSelected}
      bulkActions={(rows) => (
        <Button color="danger">
          {t('actions.delete', { count: rows.length })}
        </Button>
      )}
      rowActions={(row) => (
        <RowActionsMenu
          row={row}
          actions={[
            { label: t('actions.edit'), onClick: edit },
            { label: t('actions.delete'), onClick: del, color: 'danger' },
          ]}
        />
      )}
      labels={{
        searchPlaceholder: t('table.search'),
        selectedCount: t('table.selected', { defaultValue: '{count} selected' }),
      }}
    />
  );
}
```

### Heads-up — companion releases coming

- **Sprint 4.3 → `0.7.0-beta`**: theme identity audit across the
  whole catalog (Typography, Box, etc. carry the same latent
  `dark:` anti-pattern Table just fixed). Expected bundle delta:
  **−1 to −3 KB gz** (removing redundant classes).
- **Sprint 4.2 → `0.8.0-beta`**: DataGrid with homemade
  virtualization (`IntersectionObserver`-based, no new deps) for
  10k+ row data sets, advanced filter model, sticky columns,
  per-column RBAC.

## [0.5.0-beta] — 2026-05-19

**Sprint 4 release.** Two TW-only utility primitives — `<Skeleton>`
and `<Pagination>` — that were missing from the catalog and are
prerequisite visuals for the upcoming Sprint 4.1 (Table + DataGrid).
Both are pure-UI, no bridge integration, no RBAC sensible — they
exist to compose with the data layer arriving next sprint.

**MUI side note.** Neither component ships in `@dashforge/ui`:
`@mui/material/Skeleton` and `@mui/material/Pagination` already
cover the bridge-free use case fully. Per the Dashforge design rule
(`@dashforge/ui` wraps MUI only when adding bridge / RBAC /
validation / custom-behavior value), MUI consumers reach for the
upstream components directly.

**Minor bump** for 2 new public exports. Strictly additive — zero
breaking changes. Drop-in upgrade from `0.4.0-beta`.

### Added

- **`<Skeleton>`** — loading placeholder primitive.
  Three shapes (`text` default · `rectangle` · `circle`), three
  animations (`pulse` default · `wave` · `none`). Width / height as
  inline CSS lengths; circle's height defaults to its width.
  Rendered as `<span aria-hidden="true" role="presentation">` — screen
  readers skip it; the surrounding container is responsible for
  `aria-busy` / `aria-live` announcements. **WCAG 2.3.3**: both
  animations gated on `prefers-reduced-motion: reduce`. Compose
  multiple `<Skeleton>`s to mimic card / row shapes during fetch.
  19 unit tests covering variants × animations × sizing × sx +
  slotProps override + a11y attributes.
- **`<Pagination>`** — controlled pagination primitive. Three
  variants:
    - `default` — summary + page numbers + first/prev/next/last +
      page-size selector + direct jump input
    - `compact` — page numbers + nav buttons only
    - `minimal` — "Page X of Y" + prev/next (mobile-friendly)
  Three sizes (`sm` / `md` / `lg`). Configurable
  `siblingCount` / `boundaryCount` for the ellipsis range
  algorithm — small totals (≤ `2·boundary + 2·sibling + 3` pages)
  short-circuit to the full range, no ellipsis. Full i18n via
  `labels` prop (English defaults). A11Y: `<nav aria-label="Pagination">`
  landmark, `aria-current="page"` on the active button, native
  `<select>` for page size, native `<input type="number">` for
  the jump input (commit on Enter / blur, clamped to range).
  Page-size selector hidden when `onPageSizeChange` is omitted.
  Jump input toggle via `showJumpInput`. 28 unit tests covering
  the range helper (7) + rendering / interactions / variants /
  i18n / disabled / overrides / edge cases (21).

### Internal

- **47 new unit tests** for the 2 components — full TW suite at
  **681/681 passing** (39 files).
- **`TestUtilities.tsx`** added to the `dash` consumer
  (`/test-utilities`) as the Sprint 4 smoke-test page: variant
  matrix for both components + card-placeholder compose pattern +
  Pagination i18n / size / variant / edge cases + a 50-instance
  Skeleton stress test wrapped in `React.Profiler`. Validated
  end-to-end before docs were written (per Dashforge workflow
  policy: dash smoke test PRECEDES docs).
- **Sidebar entries** for the new `Skeleton` + `Pagination` doc
  pages added to `dashforge-docs-lab/src/tw-docs/sidebar.model.ts`.

### Compatibility

| Axis | Pre-`0.5.0` | Post-`0.5.0` |
|---|---|---|
| Public API surface | 29 components | **+ 2 (`Skeleton`, `Pagination`)** + their `*Props` / `*SlotProps` types + `*Variants` recipes + `PaginationLabels` i18n type |
| Peer deps | `react ^18 \|\| ^19`, `tw-theme workspace`, `tw-tokens workspace` | unchanged |
| Bridge deps | `forms` / `rbac` / `ui-core` `workspace:*` | unchanged |
| New runtime deps | — | **none** (no new external libraries — constraint honored) |
| Breaking changes | — | Zero |
| Bundle size | 312 KB raw / 68.85 KB gzipped | **336 KB raw / 73.9 KB gzipped** (+24 KB raw / +5.05 KB gz / **+7.3% gz**) |
| Migration | — | Drop-in. Zero code changes required on existing usages. |

> **Bundle regression note**: the +7.3% gzipped delta is **above
> the 5% threshold** documented in `PERFORMANCE.md`. Justification:
> Pagination contributes ~4 KB gz (3 variants × 3 sizes × i18n
> surface + range-computation helper + jump-input commit logic);
> Skeleton contributes ~1 KB gz. The delta sits well under the
> 10% reviewer-sign-off threshold and is the necessary cost of
> adding two new public components. Filed as informational per
> the regression policy.

### Migration

No code changes required:

```bash
pnpm up @dashforge/tw@^0.5.0-beta
```

To adopt the new components:

```tsx
import { Skeleton, Pagination } from '@dashforge/tw';

// Loading placeholder while fetching
{isLoading ? (
  <Skeleton variant="text" width="200px" />
) : (
  <UserName>{user.name}</UserName>
)}

// Paginated list (controlled — wire to your data slice)
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(20);

<Pagination
  page={page}
  pageSize={pageSize}
  totalCount={users.length}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
```

MUI consumers: continue using `@mui/material/Skeleton` and
`@mui/material/Pagination` directly. `@dashforge/ui` will NOT ship
wrappers for these (per the design rule documented in
`PARITY.md` — no value-add wrappers).

## [0.4.0-beta] — 2026-05-19

**Sprint 3 release.** Five new Tier-4 overlay & disclosure
components (Dialog, Tabs, Tooltip, Popover, Accordion) + the
internal **MUI ↔ TW parity audit** (`PARITY.md`) + the
**customization escape hatch playbook** in the docs lab + the
first **performance baseline** (`PERFORMANCE.md`). Strictly
additive — zero breaking changes on the existing 24-component
surface.

**Minor bump** for the 5 new public exports + new types. All
existing usages keep working byte-identical. Drop-in upgrade from
`0.3.0-beta`.

### Added

- **`<Dialog>`** — declarative modal dialog (Radix `Dialog`-backed).
  Three size variants (`sm` / `md` / `lg`), controlled `open` /
  `onOpenChange`, optional title + description (wired to
  `aria-labelledby` / `aria-describedby`), `showCloseButton` toggle,
  `disableBackdropClose` / `disableEscapeClose` escapes. APG dialog
  pattern out of the box: focus trap, restore focus on close, Esc
  dismissal, scroll lock. Portal-rendered.
- **`<Tabs>`** — declarative tab navigation (Radix `Tabs`-backed).
  Two variants (`underline` default / `pill`), two orientations
  (`horizontal` default / `vertical`), controlled / uncontrolled
  modes. APG tabs pattern: arrow-key navigation,
  `role="tablist"` / `role="tab"` / `role="tabpanel"` wiring,
  `aria-orientation`.
- **`<Tooltip>`** — hover/focus tooltip (Radix `Tooltip`-backed).
  Per-component provider for delay configuration (default 200ms),
  four placement sides, alignment options, optional arrow
  indicator. APG tooltip pattern: `role="tooltip"`,
  `aria-describedby` wired automatically.
- **`<Popover>`** — clickable floating panel (Radix
  `Popover`-backed). For richer floating UI than tooltip — action
  menus, color pickers, settings panels. Focus trap inside,
  outside-click + Escape dismiss, portal-rendered.
- **`<Accordion>`** — collapsible section list (Radix
  `Accordion`-backed). Two modes (`single` default with
  `collapsible: true` / `multiple`), per-item disabled flag,
  CSS-only chevron flip via `data-state=open` selector. APG
  accordion pattern: arrow-key navigation between triggers,
  `aria-expanded` on triggers, `role="region"` on panels.
- **`PARITY.md`** — internal parity audit between `@dashforge/tw`
  and `@dashforge/ui` (MUI line). Covers the 10 bridge-integrated
  components. Documents intentional deltas (Radix callback
  signatures `onCheckedChange` / `onValueChange` vs MUI
  `onChange(event, value)`; variant taxonomy `solid` / `outline` /
  `soft` / `ghost` vs MUI's `contained` / `outlined` / `text`;
  TW-only features like `loadOptions` async loader on Autocomplete,
  `slotProps.prefix` / `suffix` on TextField, `showStepper` on
  NumberField). Motivation: internal consistency + foundation for
  Sprint 5 starter kits. Not a customer migration document — the
  switch story was scrapped as a non-existent use case.
- **`/docs/guides/customization.mdx`** — customization escape
  hatch playbook. Three sections: `sx` vs `slotProps` decision
  tree with 4 canonical examples (outer wrapper styling, slot
  styling, conflict resolution, combining both), preset extension
  recipes (`extendPreset({ colors: { brand: { … } } })` + custom
  intent augmentation + custom font stack), and a custom-component
  tutorial (`PhoneInput` built on `useDashFieldMeta` +
  `useAccessState`).
- **`PERFORMANCE.md`** — first formal performance baseline. Bundle
  raw + gzipped (312 KB / 68.85 KB for 29 components),
  per-component source size proxy, representative bundle subsets
  (form / layout / foundation / tier-4 / full), render perf table
  (12.1 ms mount / 7-8.6 ms update from `dash` consumer). Sets
  the regression budget policy: any PR with >+5% gzipped delta
  requires a justification line in the CHANGELOG; >+10% requires
  explicit reviewer sign-off.

### Internal

- **MUI ↔ TW parity audit pact.** Every release that touches a
  bridge-integrated component on either line MUST re-run the
  parity audit (low cost — ~30 min per component-level diff). The
  pact is documented at the end of `PARITY.md`.
- **Performance regression budget.** 5% / 10% gzipped thresholds
  documented in `PERFORMANCE.md`. To be enforced via CI in Sprint
  4+ (out of scope for Sprint 3 — the policy is the foundation).
- **Sidebar entry** for the new `Customization` guide added to
  `dashforge-docs-lab/src/tw-docs/sidebar.model.ts`.
- **42 new unit tests** for the 5 Tier-4 components — full TW suite
  now at 634/634 passing (37 files).

### Compatibility

| Axis | Pre-`0.4.0` | Post-`0.4.0` |
|---|---|---|
| Public API surface | 24 components + foundation + bridge hooks | **+5 components + their `*Props` / `*SlotProps` types + their `*Variants` recipes** |
| Peer deps | `react ^18 \|\| ^19`, `tw-theme workspace`, `tw-tokens workspace` | unchanged |
| Bridge deps | `forms` / `rbac` / `ui-core` `workspace:*` | unchanged |
| New runtime deps | — | `@radix-ui/react-dialog ^1.1.0` · `@radix-ui/react-tabs ^1.1.0` · `@radix-ui/react-tooltip ^1.1.0` · `@radix-ui/react-popover ^1.1.0` · `@radix-ui/react-accordion ^1.2.0` |
| Breaking changes | — | **Zero**. The `sx` + `slotProps` design discussion concluded with "keep both, document only" — no rename. |
| Bundle size | 272 KB raw / ~60 KB gzipped | **312 KB raw / 68.85 KB gzipped** (+40 KB raw / +8.85 KB gz; within the projected 14% budget for 5 Radix-backed components) |
| Migration | — | Drop-in. Zero code changes required on existing usages. |

### Migration

No code changes required:

```bash
pnpm up @dashforge/tw@^0.4.0-beta
```

To adopt the new Tier-4 components:

```tsx
import { Dialog, Tabs, Tooltip, Popover, Accordion } from '@dashforge/tw';

<Tooltip content="Delete this item">
  <Button variant="ghost"><TrashIcon /></Button>
</Tooltip>

<Tabs items={[
  { value: 'overview', label: 'Overview', content: <OverviewPanel /> },
  { value: 'details',  label: 'Details',  content: <DetailsPanel /> },
]} />

<Accordion items={faqItems} type="single" defaultValue="q-1" />
```

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
