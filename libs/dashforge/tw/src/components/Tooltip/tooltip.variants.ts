import { tv, type VariantProps } from 'tailwind-variants';

export const tooltipVariants = tv({
  slots: {
    content: [
      'z-50 max-w-xs rounded-md px-3 py-1.5 text-xs font-medium',
      'bg-neutral-900 text-neutral-50',
      'dark:bg-neutral-50 dark:text-neutral-900',
      'shadow-md',
      'data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      'motion-reduce:transition-none motion-reduce:duration-0',
    ],
    arrow: 'fill-neutral-900 dark:fill-neutral-50',
  },
});

export type TooltipVariants = VariantProps<typeof tooltipVariants>;
