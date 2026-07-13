import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<Progress>` — display-only determinate
 * progress bar. Two visual flavors:
 *
 *   - `variant='linear'`   — horizontal bar with a filled `bar` slot
 *   - `variant='circular'` — SVG arc with a filled `arc` slot
 *
 * Slots:
 *   - `root`       — outer wrapper (label + control + value label)
 *   - `label`      — optional field-style label above the control
 *   - `control`    — the linear track OR the SVG viewport for circular
 *   - `track`      — the grey background (linear bar OR circular ring)
 *   - `bar`        — the filled portion on the linear variant
 *   - `arc`        — the filled arc on the circular variant
 *   - `valueLabel` — the `%` text (positioned differently per variant)
 *
 * Colour intents match the rest of the catalog. `neutral` skips
 * `dark:` variants — the preset CSS-var swap handles inversion.
 * Thickness axis controls the track height on `linear` and the arc
 * `stroke-width` on `circular`.
 */
export const progressVariants = tv({
  slots: {
    root: 'inline-flex flex-col gap-1',
    label: 'text-sm font-medium text-neutral-900',
    control: 'relative',
    track: 'bg-neutral-200',
    bar: [
      'h-full rounded-full',
      'transition-[width] duration-200 motion-reduce:transition-none',
      // color applied via variant
    ],
    // The circular arc is a SVG <circle> — stroke controls the visible ring.
    arc: [
      'transition-[stroke-dashoffset] duration-200 motion-reduce:transition-none',
      // stroke color applied via variant
    ],
    valueLabel: 'text-sm font-medium text-neutral-900 tabular-nums',
  },
  variants: {
    variant: {
      linear: {
        control: 'w-full flex items-center gap-2',
        track: 'relative flex-1 h-full rounded-full overflow-hidden',
      },
      circular: {
        control: 'relative flex items-center justify-center',
        // Track becomes the background ring, positioned absolutely under
        // the SVG viewport (both share the same rendered size).
        track: 'hidden',
        valueLabel: 'absolute inset-0 flex items-center justify-center',
      },
    },
    color: {
      primary:   { bar: 'bg-primary-500 dark:bg-primary-400',     arc: 'stroke-primary-500 dark:stroke-primary-400' },
      secondary: { bar: 'bg-secondary-500 dark:bg-secondary-400', arc: 'stroke-secondary-500 dark:stroke-secondary-400' },
      success:   { bar: 'bg-success-500 dark:bg-success-400',     arc: 'stroke-success-500 dark:stroke-success-400' },
      warning:   { bar: 'bg-warning-500 dark:bg-warning-400',     arc: 'stroke-warning-500 dark:stroke-warning-400' },
      danger:    { bar: 'bg-danger-500 dark:bg-danger-400',       arc: 'stroke-danger-500 dark:stroke-danger-400' },
      // neutral — no dark: (preset auto-inverts)
      neutral:   { bar: 'bg-neutral-700',                          arc: 'stroke-neutral-700' },
    },
    size: {
      sm: {
        control: 'text-xs',
        // linear height + circular viewport handled inline via the size
        // token below (see Progress.tsx).
      },
      md: {
        control: 'text-sm',
      },
      lg: {
        control: 'text-base',
      },
    },
    fullWidth: {
      true: {
        root: 'w-full',
      },
    },
  },
  compoundVariants: [
    // Linear track height depends on size AND thickness — implemented
    // via inline style in the component (see LINEAR_TRACK_HEIGHTS in
    // Progress.tsx) to keep the variant matrix from exploding.
  ],
  defaultVariants: {
    variant: 'linear',
    color: 'primary',
    size: 'md',
    fullWidth: false,
  },
});

export type ProgressVariants = VariantProps<typeof progressVariants>;

/**
 * Linear track height (in px) per (size × thickness) pair. Derived
 * inline in the component to avoid a compound-variant explosion.
 */
export const LINEAR_TRACK_HEIGHTS: Record<
  'sm' | 'md' | 'lg',
  Record<'thin' | 'md' | 'thick', number>
> = {
  sm: { thin: 2, md: 4,  thick: 6  },
  md: { thin: 4, md: 6,  thick: 10 },
  lg: { thin: 6, md: 10, thick: 14 },
};

/**
 * Circular geometry per size — SVG viewBox is a square. Radius +
 * stroke-width define the visible arc. Derived inline.
 */
export const CIRCULAR_GEOMETRY: Record<
  'sm' | 'md' | 'lg',
  Record<'thin' | 'md' | 'thick', { size: number; stroke: number }>
> = {
  sm: { thin: { size: 32, stroke: 2 }, md: { size: 32, stroke: 3 }, thick: { size: 32, stroke: 4 } },
  md: { thin: { size: 48, stroke: 3 }, md: { size: 48, stroke: 4 }, thick: { size: 48, stroke: 6 } },
  lg: { thin: { size: 72, stroke: 4 }, md: { size: 72, stroke: 6 }, thick: { size: 72, stroke: 8 } },
};
