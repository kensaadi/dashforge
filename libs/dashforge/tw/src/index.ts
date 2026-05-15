/**
 * @dashforge/tw
 *
 * Tailwind-rendered UI components for the Dashforge ecosystem.
 *
 * Architectural contract (per plan v2 — 2026-05-15):
 * - **Props-driven, not className-driven.** Each Tailwind utility that
 *   matters for the public API becomes a typed prop. `className` and
 *   `sx`/`slotProps` exist only as escape hatches.
 * - **Tokens as source of truth.** Consumes `@dashforge/tw-tokens` via
 *   the `dashforgePreset()` from `@dashforge/tw-theme`. No hardcoded
 *   color/spacing values inside components.
 * - **Shared bridge with @dashforge/ui (MUI).** Both ecosystems consume
 *   `@dashforge/forms` + `@dashforge/ui-core` + `@dashforge/rbac`.
 *   No styling code is shared between MUI and TW.
 * - **Variant API via tailwind-variants (TV).** Multi-slot components
 *   leverage TV's `slots` + `compoundVariants` natively.
 *
 * F1 surface: scaffolding only. Real components arrive in F3 (Button,
 * TextField, Checkbox, Switch as the tier-1 set per the sprint plan).
 *
 * @module @dashforge/tw
 */

// Utilities (stable)
export { cn } from './utils/cn.js';

// Re-export tailwind-variants for consumers building app-level variants
// against the same canonical version used by the library.
export { tv } from 'tailwind-variants';
export type { VariantProps } from 'tailwind-variants';

/**
 * Package version (synced with `package.json` at publish time).
 */
export const VERSION = '0.0.0';
