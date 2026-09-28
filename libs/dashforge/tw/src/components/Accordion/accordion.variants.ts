import { tv, type VariantProps } from 'tailwind-variants';

export const accordionVariants = tv({
  slots: {
    root: 'w-full',
    // Neutral palette auto-inverts via the dashforgePreset() CSS-var
    // swap — no `dark:` variant needed (would double-invert).
    item: 'border-b border-neutral-200',
    header: 'flex',
    trigger: [
      'flex flex-1 items-center justify-between py-3 text-left',
      'text-sm font-medium text-neutral-900',
      // `transition-all` covers transform-able properties, so it is
      // motion under WCAG 2.3.3 and needs the gate. Every other
      // `transition-transform` in the catalog has one; this was the
      // only movement left ungated.
      'transition-all hover:underline motion-reduce:transition-none',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded-sm',
      '[&[data-state=open]>svg]:rotate-180',
      'disabled:opacity-50 disabled:pointer-events-none',
      'motion-reduce:transition-none',
    ],
    content: [
      'overflow-hidden text-sm text-neutral-700',
      'data-[state=open]:animate-accordion-down',
      'data-[state=closed]:animate-accordion-up',
      'motion-reduce:animate-none',
    ],
    chevron: [
      'h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200',
      'motion-reduce:transition-none motion-reduce:duration-0',
    ],
  },
});

export type AccordionVariants = VariantProps<typeof accordionVariants>;
