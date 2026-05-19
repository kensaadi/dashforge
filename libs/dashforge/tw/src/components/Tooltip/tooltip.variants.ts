import { tv, type VariantProps } from 'tailwind-variants';

export const tooltipVariants = tv({
  slots: {
    content: [
      'z-50 max-w-xs rounded-md px-3 py-1.5 text-xs font-medium',
      // Auto-invert via the dashforgePreset() CSS-var swap:
      //  - Light mode: `bg-neutral-900` = #171717 (dark surface) +
      //    `text-neutral-50` = #fafafa (light text) — DARK tooltip
      //    on the light page (high contrast).
      //  - Dark mode: `bg-neutral-900` flips to #f5f5f5 (light) +
      //    `text-neutral-50` flips to #0a0a0a (dark text) — LIGHT
      //    tooltip on the dark page (high contrast against page).
      // Adding `dark:bg-neutral-50 dark:text-neutral-900` (the old
      // pattern) would force the dark-mode tooltip back to a dark
      // surface — invisible against the dark page.
      'bg-neutral-900 text-neutral-50',
      'shadow-md',
      'data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      'motion-reduce:transition-none motion-reduce:duration-0',
    ],
    // Arrow tracks the content bg — auto-inverts the same way.
    arrow: 'fill-neutral-900',
  },
});

export type TooltipVariants = VariantProps<typeof tooltipVariants>;
