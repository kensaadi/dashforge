# THEME-AUDIT — @dashforge/tw catalog identity sweep

> Sprint 4.3 deliverable (2026-05-19). Audit of every `@dashforge/tw`
> component against the **default `dashforgePreset()` identity rule**
> (memory: `feedback_dashforge_preset_is_identity`).
>
> **Rule recap.** The `dashforgePreset()` CSS-variable swap
> auto-inverts the neutral palette:
> `bg-neutral-50` / `text-neutral-900` etc. resolve to the
> appropriate physical color via `--df-tw-color-neutral-N`. Adding a
> `dark:` variant on a neutral class **double-inverts** the value
> and breaks dark mode. The Sprint 4.1 Table fix established the
> canonical patterns; Sprint 4.3 applies them to the whole catalog.

## Scoring legend

- **A** — Pure double inversion. REMOVE `dark:` variant entirely.
- **B** — `bg-white` / `text-white` paired with a wrong `dark:`
  target. KEEP the `dark:` variant (white doesn't auto-invert) but
  FIX the target — `dark:bg-neutral-900` in dark mode resolves to
  near-white (broken); use `dark:bg-neutral-100` for proper dark
  elevated surface.
- **C** — Intentional `dark:` on color palette (`primary`,
  `success`, `warning`, `danger`, `info`, `secondary`). KEEP — color
  palettes don't auto-invert; explicit `dark:` is a design choice.
- **D** — Component-specific exception (e.g. Tooltip wants
  high-contrast inversion against the page). Document why kept.

## Per-file findings

### Accordion (`accordion.variants.ts`)

| Line | Class | Category | Fix |
|---|---|---|---|
| 6 | `border-b border-neutral-200 dark:border-neutral-800` | A | `border-b border-neutral-200` |
| 10 | `text-sm font-medium text-neutral-900 dark:text-neutral-50` | A | `text-sm font-medium text-neutral-900` |
| 18 | `overflow-hidden text-sm text-neutral-700 dark:text-neutral-300` | A | drop `dark:text-neutral-300` |

### Box (`box.variants.ts`)

| Line | Class | Category | Fix |
|---|---|---|---|
| 58 | `bg-white dark:bg-neutral-900` (elevated) | B | `bg-white dark:bg-neutral-100` (dark-mode elevation tier above page surface) |
| 168 | `border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900` (outlined) | A + B | `border-neutral-200 bg-white dark:bg-neutral-100` (border auto-inverts; bg keeps `bg-white` + corrected dark target) |
| 184 | `bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100` (soft) | A | `bg-neutral-100 text-neutral-900` |
| 200 | `bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900` (solid neutral) | D | `bg-neutral-900 text-neutral-50` (auto-invert — solid neutral becomes inverted accent: dark surface in light mode, light surface in dark mode; consistent with identity rule) |

### Dialog (`dialog.variants.ts`)

| Line | Class | Category | Fix |
|---|---|---|---|
| 29 | `w-full bg-white dark:bg-neutral-900 rounded-lg shadow-xl` | B | `dark:bg-neutral-100` |
| 30 | `border border-neutral-200 dark:border-neutral-800` | A | drop `dark:` |
| 37 | `text-lg ... text-neutral-900 dark:text-neutral-50` | A | drop `dark:` |
| 38 | `text-sm text-neutral-600 dark:text-neutral-400` | A | drop `dark:` |
| 42 | `dark:text-neutral-400 dark:hover:text-neutral-50` (close button) | A | drop both `dark:` |
| 43 | `hover:bg-neutral-100 dark:hover:bg-neutral-800` | A | drop `dark:` |

### Divider (`divider.variants.ts` + `Divider.tsx`)

| File / Line | Class | Category | Fix |
|---|---|---|---|
| `divider.variants.ts:88` | `border-neutral-200 dark:border-neutral-800` (neutral color variant) | A | drop `dark:` |
| `Divider.tsx:131` | `text-sm text-neutral-500 dark:text-neutral-400` (label) | A | drop `dark:` |

### Pagination (`pagination.variants.ts` + `Pagination.tsx`)

10 violations — full sweep of borders / text / bg / hover / active-button.

| Line | Class | Category | Fix |
|---|---|---|---|
| `variants:26` summary | `text-neutral-600 dark:text-neutral-400` | A | drop |
| `variants:30, 44, 58` borders | `border border-neutral-300 dark:border-neutral-700` | A | drop |
| `variants:31, 45, 59` button/selector/input bg | `bg-white dark:bg-neutral-900` | B → drop entirely | use `bg-neutral-50` (auto-inverts; border provides separation against page) |
| `variants:32, 46, 55` button text | `text-neutral-700 dark:text-neutral-300` | A | drop |
| `variants:33, 47` button hover bg | `hover:bg-neutral-50 dark:hover:bg-neutral-800` | A | `hover:bg-neutral-100` (1 elevation tier; auto-inverts) |
| `variants:60` jumpInput text | `text-neutral-900 dark:text-neutral-50` | A | drop |
| `Pagination.tsx:241` select bg+border | `border ... dark:border-neutral-700 bg-white dark:bg-neutral-900` | B → drop | `border border-neutral-300 bg-neutral-50` |

### Popover (`popover.variants.ts`)

| Line | Class | Category | Fix |
|---|---|---|---|
| 6 | `border border-neutral-200 dark:border-neutral-800` | A | drop |
| 7 | `bg-white dark:bg-neutral-900 p-4 shadow-lg` | B | `dark:bg-neutral-100` |
| 8 | `text-sm text-neutral-900 dark:text-neutral-50` | A | drop |
| 14 | `fill-white dark:fill-neutral-900` (arrow) | B | `fill-white dark:fill-neutral-100` (match content bg) |

### Skeleton (`skeleton.variants.ts`)

| Line | Class | Category | Fix |
|---|---|---|---|
| 38 | `bg-neutral-200 dark:bg-neutral-800` | A | drop `dark:` (auto-inverts — skeleton placeholder slightly more visible than page surface in both modes) |

### Tabs (`tabs.variants.ts`)

| Line | Class | Category | Fix |
|---|---|---|---|
| 22 | `border-b border-neutral-200 dark:border-neutral-800` (underline list) | A | drop |
| 24 | `... text-neutral-600 dark:text-neutral-400` (underline trigger) | A | drop |
| 25 | `hover:text-neutral-900 dark:hover:text-neutral-50` | A | drop |
| 31 | `bg-neutral-100 dark:bg-neutral-800 p-1` (pill list) | A | drop |
| 33 | `... text-neutral-600 dark:text-neutral-400` (pill trigger) | A | drop |
| 34 | `hover:text-neutral-900 dark:hover:text-neutral-50` | A | drop |
| 35 | `data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900` (pill active) | B | `dark:bg-neutral-100` |
| 36 | `data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-50` | A | drop |

### Tooltip (`tooltip.variants.ts`)

Tooltip historically used a "fixed dark surface in both modes" pattern.
Per the identity rule, **auto-invert** is the right behavior: dark
tooltip on light page (light mode), light tooltip on dark page (dark
mode) — the inversion **is** the high-contrast effect.

| Line | Class | Category | Fix |
|---|---|---|---|
| 8 | `bg-neutral-900 text-neutral-50` + `dark:bg-neutral-50 dark:text-neutral-900` | A | drop the `dark:` line entirely (the base classes already auto-invert and give the high-contrast effect against the page) |
| 14 | `fill-neutral-900 dark:fill-neutral-50` (arrow) | A | drop `dark:` (arrow auto-inverts with content bg) |

### Typography (`typography.variants.ts`)

| Line | Class | Category | Fix |
|---|---|---|---|
| 65 | `neutral: 'text-neutral-900 dark:text-neutral-100'` | A | `'text-neutral-900'` |
| 66 | `muted: 'text-neutral-600 dark:text-neutral-400'` | A | `'text-neutral-600'` |

### Table-side (Sprint 4.1 — already fixed)

Per-file already corrected in Sprint 4.1. Sprint 4.3 just verifies
the regression guard (themeIdentity test) is promoted to global so
the rest of the catalog is covered too.

## Summary

| Component | Violations | Fix categories |
|---|---|---|
| Accordion | 3 | A × 3 |
| Box | 4 | A + B + D |
| Dialog | 6 | A × 5 + B × 1 |
| Divider | 2 | A × 2 |
| Pagination | 10 | A × 7 + B × 3 |
| Popover | 4 | A × 3 + B × 1 |
| Skeleton | 1 | A × 1 |
| Tabs | 8 | A × 7 + B × 1 |
| Tooltip | 2 | A × 2 (was "double-inverted to preserve fixed look" — auto-invert is now the canonical choice) |
| Typography | 2 | A × 2 |
| **Total** | **42** | **31 A + 5 B + 1 D + 5 fixed already** |

## Color palettes — NOT touched

`dark:` variants on `primary`, `secondary`, `success`, `warning`,
`danger`, `info` palettes are **intentional** — those palettes do
not auto-invert (same physical color in both modes), so the
`dark:` shift is a design choice for tone refinement. They stay.

Affected sites (kept as-is):

- `Box` compound variants (`outlined/soft/solid` × color) for the
  6 color palettes (lines 188-198 in `box.variants.ts`)
- `RenderChip` color rows (Sprint 4.1 decision)
- `RowActionsMenu` `text-danger-700 dark:text-danger-300` and same
  for warning

## Sprint 4.3 deliverables

1. ✅ THEME-AUDIT.md (this file)
2. ⏳ Apply fixes per-file (P3)
3. ⏳ Promote `themeIdentity.test.ts` from `Table/_internal/` to
   package-level scanner walking `libs/dashforge/tw/src/components/**`
   (P2). Excludes `*.test.*` files. The test fails any future
   `dark:*-neutral-N` reintroduction.
4. ⏳ Visual regression catch in `dash` (manual check in both
   light + dark mode)
5. ⏳ Release `@dashforge/tw@0.7.0-beta` — expected bundle to
   **shrink** by 1-3 KB gz (removing redundant classes).
