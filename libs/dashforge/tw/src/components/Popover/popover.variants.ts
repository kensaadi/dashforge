import { tv, type VariantProps } from 'tailwind-variants';

export const popoverVariants = tv({
  slots: {
    content: [
      'z-50 rounded-md border border-neutral-200 dark:border-neutral-800',
      'bg-white dark:bg-neutral-900 p-4 shadow-lg',
      'text-sm text-neutral-900 dark:text-neutral-50',
      'focus:outline-none',
      'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      'motion-reduce:transition-none motion-reduce:duration-0',
    ],
    arrow: 'fill-white dark:fill-neutral-900',
  },
});

export type PopoverVariants = VariantProps<typeof popoverVariants>;
