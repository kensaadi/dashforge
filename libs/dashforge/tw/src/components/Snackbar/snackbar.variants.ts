import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<Snackbar>` (stacked toast surface).
 *
 * **Sprint 4.4 refactor (1.1.0):** the severity color block has been
 * REMOVED from this recipe. The 3×4 (variant × severity) color matrix
 * now lives in `_shared/severity/severityVariants` and is consumed by
 * Snackbar AND Alert (and any future Banner). This recipe owns layout
 * + spacing + transitions only — the surface / border / icon colors
 * are merged in at render time via `cn()`.
 *
 * Slots:
 *   - `container`   — fixed-position outer stack
 *   - `item`        — single snackbar surface (layout only; severity
 *                     colors injected at render via `getSeverityClasses`)
 *   - `icon`        — leading severity icon (layout only; tone class
 *                     injected at render)
 *   - `message`     — main text
 *   - `action`      — optional action button
 *   - `closeButton` — trailing close `×` button
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
      'text-sm',
      // Subtle enter transition — opacity-only, kept short so a burst
      // of snackbars feels snappy. Gated on motion-reduce
      // (WCAG 2.3.3) — users who request reduced motion see snackbars
      // pop in instantly without the fade.
      'transition-opacity duration-200 motion-reduce:transition-none motion-reduce:duration-0',
      'data-[state=entered]:opacity-100 data-[state=exited]:opacity-0',
    ],
    icon: 'shrink-0 mt-0.5 inline-flex items-center justify-center',
    message: 'flex-1 min-w-0 leading-relaxed',
    action: [
      'shrink-0 inline-flex items-center justify-center px-2 h-7',
      'rounded-md text-xs font-medium',
      // Action button uses currentColor + a soft hover tint so it
      // adapts to whatever (variant, severity) surface it's on. The
      // hover tint relies on a 10% opacity overlay of the current
      // foreground — works in both light and dark severity surfaces.
      'opacity-90 hover:opacity-100 hover:bg-current/10',
      'outline-none focus-visible:ring-2 focus-visible:ring-current',
      'transition-opacity',
    ],
    closeButton: [
      'shrink-0 inline-flex items-center justify-center w-6 h-6',
      'rounded-md',
      'opacity-70 hover:opacity-100',
      'outline-none focus-visible:ring-2 focus-visible:ring-current',
      'transition-opacity',
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
  },
  defaultVariants: {
    position: 'bottom-right',
  },
});

export type SnackbarVariants = VariantProps<typeof snackbarVariants>;
