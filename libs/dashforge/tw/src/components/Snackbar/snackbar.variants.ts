import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<Snackbar>` (stacked toast surface).
 *
 * Slots:
 *   - `container`   — fixed-position outer stack
 *   - `item`        — single snackbar surface
 *   - `icon`        — leading severity icon
 *   - `message`     — main text
 *   - `action`      — optional action button
 *   - `closeButton` — trailing `×` button
 */
export const snackbarVariants = tv({
  slots: {
    container: [
      'fixed z-50 flex flex-col gap-2 p-4 pointer-events-none',
      'max-w-[min(28rem,calc(100vw-2rem))]',
    ],
    item: [
      'pointer-events-auto',
      'flex items-start gap-3 px-4 py-3 w-full',
      'rounded-lg border shadow-lg',
      'text-sm bg-neutral-50 text-neutral-900',
      // Subtle enter transition — opacity + translate, kept short so a
      // burst of snackbars feels snappy.
      'transition-all duration-200',
      'data-[state=entered]:opacity-100 data-[state=exited]:opacity-0',
    ],
    icon: 'shrink-0 mt-0.5 w-5 h-5 inline-flex items-center justify-center',
    message: 'flex-1 min-w-0 leading-relaxed',
    action: [
      'shrink-0 inline-flex items-center justify-center px-2 h-7',
      'rounded-md text-xs font-medium',
      'text-primary-700 hover:bg-primary-100',
      'outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
      'transition-colors',
    ],
    closeButton: [
      'shrink-0 inline-flex items-center justify-center w-6 h-6',
      'rounded-md text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900',
      'outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
      'transition-colors',
    ],
  },
  variants: {
    position: {
      'top-left': { container: 'top-0 left-0 items-start' },
      'top-center': {
        container: 'top-0 left-1/2 -translate-x-1/2 items-center',
      },
      'top-right': { container: 'top-0 right-0 items-end' },
      'bottom-left': { container: 'bottom-0 left-0 items-start' },
      'bottom-center': {
        container: 'bottom-0 left-1/2 -translate-x-1/2 items-center',
      },
      'bottom-right': { container: 'bottom-0 right-0 items-end' },
    },
    severity: {
      info: { item: 'border-primary-200', icon: 'text-primary-600' },
      success: { item: 'border-success-200', icon: 'text-success-600' },
      warning: { item: 'border-warning-200', icon: 'text-warning-600' },
      danger: { item: 'border-danger-200', icon: 'text-danger-600' },
    },
  },
  defaultVariants: {
    position: 'bottom-right',
    severity: 'info',
  },
});

export type SnackbarVariants = VariantProps<typeof snackbarVariants>;
