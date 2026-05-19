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
        list: 'border-b border-neutral-200 dark:border-neutral-800',
        trigger: [
          'px-3 py-2 border-b-2 border-transparent text-neutral-600 dark:text-neutral-400',
          'hover:text-neutral-900 dark:hover:text-neutral-50',
          'data-[state=active]:border-primary-500 data-[state=active]:text-primary-700',
          'dark:data-[state=active]:text-primary-400',
        ],
      },
      pill: {
        list: 'rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1',
        trigger: [
          'px-3 py-1.5 rounded-md text-neutral-600 dark:text-neutral-400',
          'hover:text-neutral-900 dark:hover:text-neutral-50',
          'data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900',
          'data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-50',
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
