import { tv, type VariantProps } from 'tailwind-variants';

export const tabsVariants = tv({
  slots: {
    root: 'flex',
    list: 'inline-flex items-center gap-1',
    trigger: [
      'inline-flex items-center justify-center whitespace-nowrap',
      'text-sm font-medium transition-colors',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
      'disabled:opacity-50 disabled:pointer-events-none',
      'motion-reduce:transition-none',
    ],
    content: [
      'mt-3 focus:outline-none',
      'data-[state=inactive]:hidden',
    ],
  },
  variants: {
    variant: {
      underline: {
        // Neutral palette auto-inverts via CSS-var swap.
        list: 'border-b border-neutral-200',
        trigger: [
          'px-3 py-2 border-b-2 border-transparent text-neutral-600',
          'hover:text-neutral-900',
          // Primary palette does NOT auto-invert — `dark:` shift is
          // an intentional tone refinement (kept).
          'data-[state=active]:border-primary-500 data-[state=active]:text-primary-700',
          'dark:data-[state=active]:text-primary-400',
        ],
      },
      pill: {
        // Pill list bg uses the elevation tier — auto-inverts.
        list: 'rounded-lg bg-neutral-100 p-1',
        trigger: [
          'px-3 py-1.5 rounded-md text-neutral-600',
          'hover:text-neutral-900',
          // Active pill is one tier above the list bg
          // (`bg-neutral-100`-inverted = #171717 in dark).
          // `bg-white` is hardcoded so a `dark:` is required —
          // target `dark:bg-neutral-200` (= #262626 in dark) sits
          // ONE TIER above the list bg, preserving the elevation
          // semantic from light mode (where `bg-white` sits above
          // `bg-neutral-100` = #f5f5f5).
          'data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-200',
          'data-[state=active]:text-neutral-900',
          'data-[state=active]:shadow-sm',
        ],
      },
    },
    orientation: {
      horizontal: {
        root: 'flex-col',
        list: 'flex-row',
      },
      vertical: {
        root: 'flex-row gap-4',
        list: 'flex-col items-stretch',
      },
    },
  },
  defaultVariants: {
    variant: 'underline',
    orientation: 'horizontal',
  },
});

export type TabsVariants = VariantProps<typeof tabsVariants>;
