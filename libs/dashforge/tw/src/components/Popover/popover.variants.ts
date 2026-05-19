import { tv, type VariantProps } from 'tailwind-variants';

export const popoverVariants = tv({
  slots: {
    content: [
      // Neutral border auto-inverts via CSS-var swap.
      'z-50 rounded-md border border-neutral-200',
      // bg-white hardcoded (no auto-invert) so `dark:` is required.
      // Target `dark:bg-neutral-100` resolves to #171717 in dark mode
      // (one elevation tier above the page surface).
      'bg-white dark:bg-neutral-100 p-4 shadow-lg',
      // Text auto-inverts.
      'text-sm text-neutral-900',
      'focus:outline-none',
      'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      'motion-reduce:transition-none motion-reduce:duration-0',
    ],
    // Arrow follows content bg: `fill-white` in light + matching dark target.
    arrow: 'fill-white dark:fill-neutral-100',
  },
});

export type PopoverVariants = VariantProps<typeof popoverVariants>;
