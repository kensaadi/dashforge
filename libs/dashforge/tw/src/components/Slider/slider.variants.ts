import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<Slider>` — token-driven numeric value
 * picker (single value or [min, max] range).
 *
 * Slots:
 *   - `root`            — outer wrapper (label + control + helper/error)
 *   - `label`           — text above the control
 *   - `requiredMark`    — `*` for required
 *   - `controlWrapper`  — flex container holding the Radix Slider.Root
 *   - `track`           — the full horizontal bar (Radix Slider.Track)
 *   - `rangeSegment`    — highlighted portion between thumbs
 *                         (Radix Slider.Range — start→thumb for single,
 *                         thumb1→thumb2 for range)
 *   - `thumb`           — draggable handle (one per value tick)
 *   - `mark`            — tick on the track for a discrete step
 *   - `markLabel`       — text label under a mark
 *   - `valueLabel`      — tooltip above the thumb showing current value
 *   - `helperText`      — descriptive line below the control
 *   - `errorText`       — semantic counterpart for error mode
 *
 * Color intents follow the palette convention used elsewhere in the
 * catalog. `neutral` auto-inverts via the preset CSS-var swap; the
 * other five carry `dark:` variants where needed for visual cohesion.
 */
export const sliderVariants = tv({
  slots: {
    root: 'flex',
    label: 'block text-sm font-medium text-neutral-900 mb-1',
    requiredMark: 'text-danger-500 ml-0.5',
    controlWrapper: 'relative flex items-center w-full py-2 select-none touch-none',
    track: [
      'relative grow rounded-full',
      'bg-neutral-200',
    ],
    rangeSegment: [
      'absolute h-full rounded-full',
      // color applied via variant below
    ],
    thumb: [
      'block rounded-full border-2 border-neutral-50 bg-neutral-50 shadow',
      'transition-shadow',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'hover:shadow-md',
      'data-[disabled]:opacity-60 data-[disabled]:cursor-not-allowed',
      // border/shadow color applied via variant below
    ],
    mark: [
      'absolute top-1/2 -translate-x-1/2 -translate-y-1/2',
      'w-1 h-1 rounded-full bg-neutral-400',
      'data-[in-range=true]:bg-neutral-50',
    ],
    markLabel: [
      'absolute top-full mt-1.5 -translate-x-1/2',
      'text-xs text-neutral-600 whitespace-nowrap',
      'data-[disabled=true]:opacity-60',
    ],
    valueLabel: [
      'absolute -translate-x-1/2 -translate-y-full',
      'px-1.5 py-0.5 rounded text-xs font-medium text-neutral-50',
      'pointer-events-none whitespace-nowrap',
      'shadow-sm',
      // background color applied via variant below
      'transition-opacity duration-100 motion-reduce:transition-none',
    ],
    helperText: 'mt-1 text-sm text-neutral-600',
    errorText: 'mt-1 text-sm text-danger-600',
  },
  variants: {
    color: {
      primary: {
        rangeSegment: 'bg-primary-500 dark:bg-primary-400',
        thumb: 'border-primary-500 focus-visible:ring-primary-500/50 dark:border-primary-400',
        valueLabel: 'bg-primary-700 dark:bg-primary-600',
      },
      secondary: {
        rangeSegment: 'bg-secondary-500 dark:bg-secondary-400',
        thumb: 'border-secondary-500 focus-visible:ring-secondary-500/50 dark:border-secondary-400',
        valueLabel: 'bg-secondary-700 dark:bg-secondary-600',
      },
      success: {
        rangeSegment: 'bg-success-500 dark:bg-success-400',
        thumb: 'border-success-500 focus-visible:ring-success-500/50 dark:border-success-400',
        valueLabel: 'bg-success-700 dark:bg-success-600',
      },
      warning: {
        rangeSegment: 'bg-warning-500 dark:bg-warning-400',
        thumb: 'border-warning-500 focus-visible:ring-warning-500/50 dark:border-warning-400',
        valueLabel: 'bg-warning-700 dark:bg-warning-600',
      },
      danger: {
        rangeSegment: 'bg-danger-500 dark:bg-danger-400',
        thumb: 'border-danger-500 focus-visible:ring-danger-500/50 dark:border-danger-400',
        valueLabel: 'bg-danger-700 dark:bg-danger-600',
      },
      // neutral: no `dark:` variants — preset CSS-var swap handles it.
      neutral: {
        rangeSegment: 'bg-neutral-700',
        thumb: 'border-neutral-700 focus-visible:ring-neutral-500/50',
        valueLabel: 'bg-neutral-900',
      },
    },
    size: {
      sm: {
        controlWrapper: 'py-1.5 h-6',
        track: 'h-1',
        thumb: 'w-3.5 h-3.5',
        mark: 'w-0.5 h-0.5',
        valueLabel: 'text-[10px] px-1',
      },
      md: {
        controlWrapper: 'py-2 h-8',
        track: 'h-1.5',
        thumb: 'w-4 h-4',
        mark: 'w-1 h-1',
        valueLabel: 'text-xs px-1.5',
      },
      lg: {
        controlWrapper: 'py-2.5 h-10',
        track: 'h-2',
        thumb: 'w-5 h-5',
        mark: 'w-1.5 h-1.5',
        valueLabel: 'text-sm px-2',
      },
    },
    layout: {
      stacked: { root: 'flex-col' },
      inline: {
        root:  'flex-row items-center gap-3',
        label: 'mb-0 whitespace-nowrap shrink-0',
      },
    },
    error: {
      true: {
        // Focus ring turns danger regardless of chosen color intent —
        // consistent with TextField / Autocomplete error semantics.
        thumb: 'border-danger-500 focus-visible:ring-danger-500/50 dark:border-danger-400',
        rangeSegment: 'bg-danger-500 dark:bg-danger-400',
      },
    },
    fullWidth: {
      true: {
        root: 'w-full',
      },
    },
    disabled: {
      true: {
        controlWrapper: 'opacity-60 cursor-not-allowed',
        thumb: 'cursor-not-allowed',
      },
    },
  },
  defaultVariants: {
    color: 'primary',
    size: 'md',
    layout: 'stacked',
    error: false,
    fullWidth: false,
    disabled: false,
  },
});

export type SliderVariants = VariantProps<typeof sliderVariants>;
