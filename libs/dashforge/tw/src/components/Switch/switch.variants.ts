import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<Switch>` with slots.
 *
 * Slots:
 *   - `root`       — outer flex wrapper (control + label)
 *   - `control`    — the visible track (Radix `Switch.Root`)
 *   - `thumb`      — the moving knob (Radix `Switch.Thumb`); animated
 *                    via translate-x on data-state="checked"
 *   - `label`      — text next to the control
 *   - `helperText` / `errorText` — informational lines below
 */
export const switchVariants = tv({
  slots: {
    /*
     * `relative` is load-bearing, not cosmetic. Radix renders a hidden
     * native input for form participation with inline
     * `position: absolute; opacity: 0; transform: translateX(-100%)`.
     * Without a positioned ancestor it anchors to the BODY, so it escapes
     * any `overflow: hidden` ancestor and extends the document's
     * scrollable area down to wherever the field happens to sit.
     *
     * Measured on `learn/dash` with a checkbox ~1870px down the page:
     * `document.documentElement.scrollHeight` 1891 against a 768px
     * viewport, and the window scrolled 800px inside an AppShell that had
     * just been given `h-dvh overflow-hidden`. Adding this one declaration
     * dropped scrollHeight to 768 and the window scroll to 0.
     * See README-BUG § BUG 36.
     */
    root: 'relative inline-flex items-start gap-3',
    control: [
      'relative inline-flex shrink-0 cursor-pointer items-center',
      'rounded-full border-2 border-transparent',
      'transition-colors',
      'bg-neutral-300',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary-500',
      'data-[state=checked]:bg-primary-500',
      'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
    ],
    thumb: [
      'pointer-events-none inline-block rounded-full bg-white shadow ring-0',
      // Slide animation gated on `prefers-reduced-motion: no-preference`
      // (WCAG 2.3.3). The thumb still moves between positions instantly
      // for users who request reduced motion — the data-state change
      // applies the translate-x rule unconditionally, only the smooth
      // transition between the two is suppressed.
      'transition-transform motion-reduce:transition-none',
      'data-[state=unchecked]:translate-x-0',
    ],
    label: 'select-none cursor-pointer text-neutral-900',
    // BUG 21: `*` marker after the label, same tokens as
    // `checkboxVariants.requiredMark` for visual parity.
    requiredMark: 'text-danger-500 ml-0.5',
    helperText: 'text-sm text-neutral-600 mt-1',
    errorText: 'text-sm text-danger-600 mt-1',
  },
  variants: {
    size: {
      sm: {
        control: 'h-4 w-7',
        thumb: 'h-3 w-3 data-[state=checked]:translate-x-3',
        label: 'text-sm',
      },
      md: {
        control: 'h-6 w-11',
        thumb: 'h-5 w-5 data-[state=checked]:translate-x-5',
        label: 'text-base',
      },
      lg: {
        control: 'h-7 w-14',
        thumb: 'h-6 w-6 data-[state=checked]:translate-x-7',
        label: 'text-lg',
      },
    },
    error: {
      true: {
        control: 'bg-danger-200 data-[state=checked]:bg-danger-500 focus-visible:ring-danger-500',
      },
    },
  },
  defaultVariants: {
    size: 'md',
    error: false,
  },
});

export type SwitchVariants = VariantProps<typeof switchVariants>;
