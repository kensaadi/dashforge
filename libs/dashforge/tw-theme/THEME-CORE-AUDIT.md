# THEME-CORE-AUDIT — `@dashforge/tw-theme` + `@dashforge/tw-tokens`

> Sprint 6 P1 deliverable (2026-05-20). Audit of the TW theme core:
> token shapes, `dashforgePreset()`, CSS-var runtime, the Valtio
> store, and packaging hygiene.
>
> Companion to `../tw/THEME-AUDIT.md` (Sprint 4.3 — the per-component
> `dark:` variant sweep). This document covers the *engine*; that one
> covers the *components*.

## Healthy — no action

- CSS-var swap architecture is sound: `dashforgePreset()` emits
  `rgb(var(--df-tw-color-…) / <alpha-value>)` refs, runtime injection
  via `DashforgeTailwindProvider`, SSR priming via `serverSideStyleTag`.
- 7 color roles × 11-tone scale (50–950). `secondary` verified
  consumed by 16 component files — not an orphan token.
- Valtio store: priority cascade (localStorage → matchMedia → light),
  cross-tab `storage` sync, `patchTheme` deep-merge — all correct.
- Test suite green: `tw-tokens` 11, `tw-theme` 72.

## Fixed in Sprint 6 P1

| ID | Finding | Fix |
|----|---------|-----|
| F1 | `vitest` + `@vitejs/plugin-react` were in `dependencies` of all 3 packages — every consumer pulled test tooling into `node_modules`. | Moved to `devDependencies`. |
| F2 | `dashforgePreset()` emits `darkMode: ['selector', …]`, which requires Tailwind ≥ 3.4.1. The catalog actively uses `dark:` brand-shift variants (Tabs, Pagination); on Tailwind 3.0–3.3 those break silently. No `tailwindcss` peer was declared. | Kept `'selector'` (cleaner long-term). Added `peerDependencies.tailwindcss: ">=3.4.1"` to `@dashforge/tw` + `@dashforge/tw-theme`. |
| F4 | No shadow/elevation tokens — `Box.elevation` + `DataGrid` used Tailwind built-in `shadow-*`, not theme-controlled. | Added `TWShadowTokens` (none/sm/DEFAULT/md/lg/xl/2xl) + `TWTheme.shadow`, wired into `dashforgePreset()` (`boxShadow` extend) + `twThemeCssVars()` (`--df-tw-shadow-*`). `Box.elevation` is now theme-controlled with **zero Box code change** — the existing `shadow-sm`/`shadow-md`/… classes resolve to CSS-var refs via the preset extend. |
| F8 | `tailwind-variants@3.x` requires `tailwind-merge@>=3.0.0`; both `@dashforge/tw` and the workspace root pinned `^2.5.0`. Version skew. | Bumped `tailwind-merge` to `^3.0.0` (root + `@dashforge/tw`). Full 1022-test suite green on 3.6.0 — `cn()` + all TV recipes unaffected. |
| F6 | `defaultTWTheme*.meta.version` was the `'0.0.1'` placeholder. | Bumped to `'1.0.0'` (semver of the theme *definition*, distinct from the package version). |

## Deferred — tracked for a dedicated design-pass sprint

| ID | Finding | Why deferred |
|----|---------|--------------|
| F3 | **Dark mode only inverts `neutral`.** Brand scales (primary/secondary/success/warning/danger/info) are identical in light & dark — `bg-primary-500` is the same blue on a dark surface. | This is a *design* decision (choosing dark-adjusted brand tones — desaturate/lighten for contrast on dark surfaces), not a code fix. Folded into a future "design pass" sprint before `1.0.0-rc`. **#1 theme item to close before 1.0.** |
| F4-dark | Shadow tokens are mode-agnostic (`sharedShadow`). Dark mode often needs stronger / differently-tuned shadows. | Same design-pass sprint as F3. The token *shape* is in place now (`TWTheme.shadow`); supplying dark-specific values later is a pure data change. |

## By design — documented, not a defect

- **No `fontFamily` axis in the theme.** The `dashforgePreset()`
  deliberately does NOT own `fontFamily`. The consumer configures
  `theme.extend.fontFamily` (sans / mono stacks) in their own
  `tailwind.config`. `@dashforge/tw` never sets `font-mono` unless a
  component explicitly opts in (e.g. `TableColumn.monospace`).
  Rationale: a UI library overriding the host app's typography is an
  anti-pattern — font choice belongs to the consuming product.
- **Spacing scale is a curated subset** (`0, 0.5, 1, 2, 3, 4, 6, 8,
  12, 16, 24`). `theme.extend.spacing` *merges* with Tailwind's
  built-in scale, so `p-5` / `p-10` etc. still work (un-themed, raw
  rem). Only the curated subset is runtime-patchable. Acceptable —
  expanding it later is purely additive.

## Cosmetic — low priority

- F7 — `VERSION` consts in `tw-theme/index.ts` + `tw-tokens/index.ts`
  are manually synced with `package.json`. Drift risk. Candidate for
  a build-time inject (deferred — no functional impact).
