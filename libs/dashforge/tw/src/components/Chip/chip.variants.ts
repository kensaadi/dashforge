import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<Chip>` — promoted from the internal
 * `Table/cells/RenderChip` (Sprint 4.4). The visual treatment is
 * preserved byte-identical: the same 3 × 7 compound matrix
 * (variant × color) emitted by RenderChip is now the single source
 * of truth, consumed by both the public `<Chip>` and (via thin
 * wrapper) the legacy `RenderChip` internal.
 *
 * Slots (only `root` slot used by the public Chip; sub-slots
 * surfaced via separate inline classes in `Chip.tsx`):
 *   - `root` — outer chip surface
 *
 * Variants axis (3 × 7, plus orthogonal `size`):
 *   - `color`: 7 intents (`neutral / primary / secondary / success /
 *     warning / danger / info`)
 *   - `variant`: `soft` (default) / `solid` / `outline`
 *   - `size`: `sm` (default) / `md`
 *
 * Token-driven: every Tailwind utility resolves through
 * `dashforgePreset()` → CSS variables. No hardcoded hex.
 *
 * `dark:` variants on color palettes (lines 49-77 of legacy
 * RenderChip, preserved here) are INTENTIONAL — color palettes do not
 * auto-invert via the CSS-var swap (only the `neutral` palette does),
 * so the `dark:` shift is a deliberate design choice (darker bg +
 * lighter text in dark mode for visual cohesion). `dark:` on the
 * `neutral` row is AVOIDED — that would double-invert.
 */
export const chipVariants = tv({
  base: [
    'inline-flex items-center gap-1 rounded-full font-medium',
    'whitespace-nowrap',
    // Smooth transitions for clickable / selected state changes.
    'transition-colors',
    'motion-reduce:transition-none',
  ],
  variants: {
    color: {
      neutral: '',
      primary: '',
      secondary: '',
      success: '',
      warning: '',
      danger: '',
      info: '',
    },
    variant: {
      soft: '',
      solid: '',
      outline: '',
    },
    size: {
      sm: 'h-5 px-2 text-xs',
      md: 'h-6 px-2.5 text-xs',
    },
    /**
     * Clickable state — adds focus ring + hover transition. Applied
     * when the chip renders as `<button>` (i.e. `onClick` or
     * explicit `clickable` is set).
     */
    clickable: {
      true: [
        'cursor-pointer select-none',
        'outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
      ],
    },
    /**
     * Selected state — used on filter chips to indicate active
     * selection. Visually shifts the chip to a heavier emphasis
     * (one step up the elevation ladder of its current variant).
     * Compound rules below apply the actual shift per (variant, color)
     * cell.
     */
    selected: {
      true: 'ring-2 ring-offset-1',
    },
    /** Disabled state for clickable chips. */
    disabled: {
      true: 'opacity-50 cursor-not-allowed pointer-events-none',
    },
  },
  compoundVariants: [
    // ─── soft × color ──────────────────────────────────────────────
    // Subtle bg + readable text. Neutral row uses NO `dark:` (auto-
    // inverts via the dashforgePreset CSS-var swap). Color rows KEEP
    // `dark:` (color palettes don't auto-invert).
    { variant: 'soft', color: 'neutral',   class: 'bg-neutral-100 text-neutral-700' },
    { variant: 'soft', color: 'primary',   class: 'bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300' },
    { variant: 'soft', color: 'secondary', class: 'bg-secondary-100 dark:bg-secondary-950 text-secondary-700 dark:text-secondary-300' },
    { variant: 'soft', color: 'success',   class: 'bg-success-100 dark:bg-success-950 text-success-700 dark:text-success-300' },
    { variant: 'soft', color: 'warning',   class: 'bg-warning-100 dark:bg-warning-950 text-warning-700 dark:text-warning-300' },
    { variant: 'soft', color: 'danger',    class: 'bg-danger-100 dark:bg-danger-950 text-danger-700 dark:text-danger-300' },
    { variant: 'soft', color: 'info',      class: 'bg-info-100 dark:bg-info-950 text-info-700 dark:text-info-300' },
    // ─── solid × color ─────────────────────────────────────────────
    // Full bg + contrasting text. Solid neutral uses neutral-700/50
    // (both on neutral palette → auto-invert together).
    // `text-white` is deliberately NOT used: white does not auto-invert,
    // which would flip the contrast in dark mode for the neutral row.
    { variant: 'solid', color: 'neutral',   class: 'bg-neutral-700 text-neutral-50' },
    { variant: 'solid', color: 'primary',   class: 'bg-primary-500 text-white' },
    { variant: 'solid', color: 'secondary', class: 'bg-secondary-500 text-white' },
    { variant: 'solid', color: 'success',   class: 'bg-success-500 text-white' },
    { variant: 'solid', color: 'warning',   class: 'bg-warning-500 text-white' },
    { variant: 'solid', color: 'danger',    class: 'bg-danger-500 text-white' },
    { variant: 'solid', color: 'info',      class: 'bg-info-500 text-white' },
    // ─── outline × color ───────────────────────────────────────────
    // Border + colored text. Outline neutral: both auto-invert via
    // CSS-var swap. Color rows: `dark:text-*-300` for legibility in
    // dark mode on a transparent background.
    { variant: 'outline', color: 'neutral',   class: 'border border-neutral-300 text-neutral-700' },
    { variant: 'outline', color: 'primary',   class: 'border border-primary-500 text-primary-700 dark:text-primary-300' },
    { variant: 'outline', color: 'secondary', class: 'border border-secondary-500 text-secondary-700 dark:text-secondary-300' },
    { variant: 'outline', color: 'success',   class: 'border border-success-500 text-success-700 dark:text-success-300' },
    { variant: 'outline', color: 'warning',   class: 'border border-warning-500 text-warning-700 dark:text-warning-300' },
    { variant: 'outline', color: 'danger',    class: 'border border-danger-500 text-danger-700 dark:text-danger-300' },
    { variant: 'outline', color: 'info',      class: 'border border-info-500 text-info-700 dark:text-info-300' },
    // ─── clickable × color hover (subtle bg shift) ─────────────────
    // Hover state on clickable chips. Each (variant, color) hover
    // emits a one-tier deeper bg tint, working across both modes via
    // the same auto-invert logic as the base compound.
    { clickable: true, variant: 'soft',  color: 'neutral',   class: 'hover:bg-neutral-200' },
    { clickable: true, variant: 'soft',  color: 'primary',   class: 'hover:bg-primary-200 dark:hover:bg-primary-900' },
    { clickable: true, variant: 'soft',  color: 'secondary', class: 'hover:bg-secondary-200 dark:hover:bg-secondary-900' },
    { clickable: true, variant: 'soft',  color: 'success',   class: 'hover:bg-success-200 dark:hover:bg-success-900' },
    { clickable: true, variant: 'soft',  color: 'warning',   class: 'hover:bg-warning-200 dark:hover:bg-warning-900' },
    { clickable: true, variant: 'soft',  color: 'danger',    class: 'hover:bg-danger-200 dark:hover:bg-danger-900' },
    { clickable: true, variant: 'soft',  color: 'info',      class: 'hover:bg-info-200 dark:hover:bg-info-900' },
    // Solid hover → one tone darker
    { clickable: true, variant: 'solid', color: 'neutral',   class: 'hover:bg-neutral-800' },
    { clickable: true, variant: 'solid', color: 'primary',   class: 'hover:bg-primary-600' },
    { clickable: true, variant: 'solid', color: 'secondary', class: 'hover:bg-secondary-600' },
    { clickable: true, variant: 'solid', color: 'success',   class: 'hover:bg-success-600' },
    { clickable: true, variant: 'solid', color: 'warning',   class: 'hover:bg-warning-600' },
    { clickable: true, variant: 'solid', color: 'danger',    class: 'hover:bg-danger-600' },
    { clickable: true, variant: 'solid', color: 'info',      class: 'hover:bg-info-600' },
    // Outline hover → tinted bg appears (transparent → light tint)
    { clickable: true, variant: 'outline', color: 'neutral',   class: 'hover:bg-neutral-100' },
    { clickable: true, variant: 'outline', color: 'primary',   class: 'hover:bg-primary-50 dark:hover:bg-primary-950' },
    { clickable: true, variant: 'outline', color: 'secondary', class: 'hover:bg-secondary-50 dark:hover:bg-secondary-950' },
    { clickable: true, variant: 'outline', color: 'success',   class: 'hover:bg-success-50 dark:hover:bg-success-950' },
    { clickable: true, variant: 'outline', color: 'warning',   class: 'hover:bg-warning-50 dark:hover:bg-warning-950' },
    { clickable: true, variant: 'outline', color: 'danger',    class: 'hover:bg-danger-50 dark:hover:bg-danger-950' },
    { clickable: true, variant: 'outline', color: 'info',      class: 'hover:bg-info-50 dark:hover:bg-info-950' },
    // ─── selected × color (focus ring tone) ────────────────────────
    // When selected, the ring color matches the chip's intent.
    { selected: true, color: 'neutral',   class: 'ring-neutral-400' },
    { selected: true, color: 'primary',   class: 'ring-primary-500' },
    { selected: true, color: 'secondary', class: 'ring-secondary-500' },
    { selected: true, color: 'success',   class: 'ring-success-500' },
    { selected: true, color: 'warning',   class: 'ring-warning-500' },
    { selected: true, color: 'danger',    class: 'ring-danger-500' },
    { selected: true, color: 'info',      class: 'ring-info-500' },
    // ─── clickable × color (focus ring tone) ───────────────────────
    // Tab-focused ring tone matches the chip color (same intent as
    // selected but only when keyboard-focused, via focus-visible).
    { clickable: true, color: 'neutral',   class: 'focus-visible:ring-neutral-400' },
    { clickable: true, color: 'primary',   class: 'focus-visible:ring-primary-500' },
    { clickable: true, color: 'secondary', class: 'focus-visible:ring-secondary-500' },
    { clickable: true, color: 'success',   class: 'focus-visible:ring-success-500' },
    { clickable: true, color: 'warning',   class: 'focus-visible:ring-warning-500' },
    { clickable: true, color: 'danger',    class: 'focus-visible:ring-danger-500' },
    { clickable: true, color: 'info',      class: 'focus-visible:ring-info-500' },
  ],
  defaultVariants: {
    color: 'neutral',
    variant: 'soft',
    size: 'sm',
  },
});

export type ChipVariants = VariantProps<typeof chipVariants>;
