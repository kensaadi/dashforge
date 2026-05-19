import { tv, type VariantProps } from 'tailwind-variants';

/**
 * `<Dialog>` variant recipe.
 *
 * Slots:
 *  - `overlay`  — backdrop (Radix's `DialogOverlay`)
 *  - `content`  — the dialog box itself
 *  - `title`    — heading at the top
 *  - `description` — secondary text under the title
 *  - `closeButton` — top-right `×` button
 *  - `body`     — main scrollable area
 *  - `actions`  — footer action bar
 *
 * Three sizes (`sm` / `md` / `lg`) drive the content max-width.
 * Motion is gated by `prefers-reduced-motion` so the slide-in
 * animation collapses to an instant appear on users that opt out.
 */
export const dialogVariants = tv({
  slots: {
    overlay: [
      'fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=open]:fade-in-0',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
      'motion-reduce:transition-none motion-reduce:duration-0',
    ],
    content: [
      'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
      'w-full bg-white dark:bg-neutral-900 rounded-lg shadow-xl',
      'border border-neutral-200 dark:border-neutral-800',
      'p-6 flex flex-col gap-4 max-h-[90vh]',
      'focus:outline-none',
      'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      'motion-reduce:transition-none motion-reduce:duration-0',
    ],
    title: 'text-lg font-semibold leading-tight text-neutral-900 dark:text-neutral-50',
    description: 'text-sm text-neutral-600 dark:text-neutral-400',
    closeButton: [
      'absolute top-4 right-4 inline-flex items-center justify-center',
      'h-8 w-8 rounded-md text-neutral-500 hover:text-neutral-900',
      'dark:text-neutral-400 dark:hover:text-neutral-50',
      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
      'focus:outline-none focus:ring-2 focus:ring-primary-500',
      'transition-colors',
    ],
    body: 'flex-1 overflow-y-auto',
    actions: 'flex justify-end gap-2 pt-2',
  },
  variants: {
    size: {
      sm: { content: 'max-w-sm' },
      md: { content: 'max-w-md' },
      lg: { content: 'max-w-2xl' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type DialogVariants = VariantProps<typeof dialogVariants>;
