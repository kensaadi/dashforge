import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<ConfirmDialog>`.
 *
 * Built on the native HTML `<dialog>` element + `showModal()`, which
 * gives us focus-trap, Escape handling, and `::backdrop` pseudo-element
 * for free. The styling here is for the dialog body — the backdrop is
 * styled via the `::backdrop` selector inside the dialog rule.
 *
 * Slots:
 *   - `backdrop`      — semi-opaque overlay (`::backdrop` pseudo)
 *   - `dialog`        — the modal box
 *   - `title`         — modal heading
 *   - `body`          — message text
 *   - `actions`       — bottom button row
 *   - `confirmButton` — primary action
 *   - `cancelButton`  — secondary action
 */
export const confirmDialogVariants = tv({
  slots: {
    backdrop: 'backdrop:bg-black/40 backdrop:backdrop-blur-sm',
    dialog: [
      'rounded-lg bg-neutral-50 text-neutral-900 shadow-xl',
      'border border-neutral-200',
      'p-0 max-w-md w-[min(28rem,calc(100vw-2rem))]',
      'open:flex open:flex-col',
      // Native <dialog> defaults to centered; reinforce for older browsers.
      'mx-auto my-auto',
      'focus:outline-none',
    ],
    title:
      'px-5 pt-5 pb-2 text-lg font-semibold text-neutral-900 leading-tight',
    body: 'px-5 py-2 text-sm text-neutral-700 leading-relaxed',
    actions:
      'px-5 py-4 mt-2 flex justify-end gap-2 border-t border-neutral-200',
    confirmButton: [
      'inline-flex items-center justify-center px-4 h-9',
      'rounded-md text-sm font-medium',
      'outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'transition-colors',
    ],
    cancelButton: [
      'inline-flex items-center justify-center px-4 h-9',
      'rounded-md text-sm font-medium',
      'text-neutral-800 bg-neutral-100 hover:bg-neutral-200',
      'outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
      'transition-colors',
    ],
  },
  variants: {
    severity: {
      info: {
        confirmButton:
          'bg-primary-600 hover:bg-primary-700 text-white focus-visible:ring-primary-500',
      },
      warning: {
        confirmButton:
          'bg-warning-600 hover:bg-warning-700 text-white focus-visible:ring-warning-500',
      },
      danger: {
        confirmButton:
          'bg-danger-600 hover:bg-danger-700 text-white focus-visible:ring-danger-500',
      },
      success: {
        confirmButton:
          'bg-success-600 hover:bg-success-700 text-white focus-visible:ring-success-500',
      },
    },
  },
  defaultVariants: {
    severity: 'info',
  },
});

export type ConfirmDialogVariants = VariantProps<typeof confirmDialogVariants>;
