import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<Alert>`.
 *
 * Slots:
 *   - `root`         — outer surface, severity + variant color classes
 *                      come from `_shared/severity/severityVariants`
 *                      (NOT baked into this recipe, to keep the matrix
 *                      shared across Alert / Snackbar / future Banner)
 *   - `icon`         — leading severity icon container
 *   - `titleSlot`    — `<AlertTitle>` rendered as the first content row
 *   - `content`      — body text container
 *   - `action`       — trailing action / close button container
 *   - `closeButton`  — built-in close `×` (when `onClose` is defined)
 *
 * The severity color classes are merged at render time via `cn()` in
 * `Alert.tsx` — see the call sites of `getSeverityClasses(variant,
 * severity)`. This recipe owns layout + spacing + typography only.
 */
export const alertVariants = tv({
  slots: {
    root: [
      'relative flex items-start gap-3',
      'px-4 py-3',
      'rounded-lg border',
      'text-sm',
      // Smooth visibility transition (opacity only) — matches the
      // Snackbar entry timing, gated on motion-reduce per WCAG 2.3.3.
      'transition-opacity duration-150 motion-reduce:transition-none motion-reduce:duration-0',
    ],
    icon: [
      'shrink-0 mt-0.5',
      'inline-flex items-center justify-center',
    ],
    titleSlot: [
      'block font-medium leading-snug mb-1',
    ],
    content: [
      'flex-1 min-w-0',
      'leading-relaxed',
    ],
    action: [
      'shrink-0 inline-flex items-center',
      'ml-auto',
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
    /**
     * Layout density. Defaults to comfortable spacing; `compact`
     * tightens the vertical padding for inline contexts (form
     * validation summary at the top of a tight modal, etc.).
     */
    density: {
      comfortable: { root: 'px-4 py-3' },
      compact: { root: 'px-3 py-2 text-[13px]' },
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
});

export type AlertVariantProps = VariantProps<typeof alertVariants>;
