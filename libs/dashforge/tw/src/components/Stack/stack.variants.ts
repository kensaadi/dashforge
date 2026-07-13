import { tv, type VariantProps } from 'tailwind-variants';

/**
 * `stackVariants` — flex container 1D, the layout primitive of @dashforge/tw.
 *
 * Architectural role (planned with the user — F9 deep dive):
 *
 *   Stack is the ONLY way to do flex in this library. Box is the
 *   surface (border / bg / shadow); Stack is the arrangement (direction
 *   / align / justify / gap). Two primitives, two responsibilities,
 *   zero overlap.
 *
 *   This rules out the MUI failure mode where every `<Box display="flex"
 *   gap={2}>` quietly becomes the de-facto flex container, drowning
 *   the surface vs layout distinction. Here, if you see `<Stack>` in
 *   the JSX, you KNOW it's flex; if you see `<Box>`, you KNOW it's
 *   not. The component name carries the intent.
 *
 * Axes:
 *   • direction         — row / col (+ reverse variants)
 *   • align / justify   — cross-axis / main-axis alignment
 *   • gap               — token-scale step (mirror Box spacing scale)
 *   • wrap              — flex-wrap
 *   • divider           — runtime-only (handled in Stack.tsx, not here)
 *
 * Sizing (`fullWidth`, `fullHeight`) is duplicated from Box because
 * Stack often plays the role of a full-width strip / full-height
 * column — re-typing `sx="w-full"` every time would be friction.
 */
export const stackVariants = tv({
  base: 'flex',

  variants: {
    direction: {
      row:           'flex-row',
      col:           'flex-col',
      'row-reverse': 'flex-row-reverse',
      'col-reverse': 'flex-col-reverse',
    },

    align: {
      start:    'items-start',
      center:   'items-center',
      end:      'items-end',
      stretch:  'items-stretch',
      baseline: 'items-baseline',
    },

    justify: {
      start:   'justify-start',
      center:  'justify-center',
      end:     'justify-end',
      between: 'justify-between',
      around:  'justify-around',
      evenly:  'justify-evenly',
    },

    /*
     * `gap` — explicit literal mapping for the 11 token-scale steps.
     * Same set as Box's spacing axes (p, m, etc.) so muscle memory
     * carries over: `<Stack gap={4}>` aligns visually with `<Box p={4}>`.
     */
    gap: {
      0:    'gap-0',    '0.5': 'gap-0.5', 1:  'gap-1',  2:  'gap-2',  3:  'gap-3',
      4:    'gap-4',    6:     'gap-6',   8:  'gap-8',  12: 'gap-12', 16: 'gap-16',
      24:   'gap-24',
    },

    wrap: { true: 'flex-wrap' },

    fullWidth:  { true: 'w-full' },
    fullHeight: { true: 'h-full' },
  },

  defaultVariants: {
    direction: 'col',
  },
});

export type StackVariants = VariantProps<typeof stackVariants>;

/**
 * The 11 accepted values for `<Stack gap>` — same set as Box's spacing
 * axes (p, m, etc.). Exported so the JSDoc, the runtime dev-warn, and
 * the `<Stack>` prop type all speak the same list.
 *
 * Why re-declared instead of derived from `stackVariants.variants.gap`
 * via `VariantProps`: `tailwind-variants` 3.x widens variant value
 * types to `string | undefined` when the variant object has mixed-type
 * keys (numeric literals + string literals like `'0.5'`), which is why
 * TS silently accepted `<Stack gap="md">` before #111 — that's the
 * whole bug this literal union closes. Keep this list in sync with
 * the `gap` object in the `variants` block above.
 *
 * @see Issue #111 — silent-fail when `gap` receives a token value that
 * isn't on the numeric scale (G-27).
 */
export type StackGap =
  | 0
  | 0.5
  | 1
  | 2
  | 3
  | 4
  | 6
  | 8
  | 12
  | 16
  | 24;

/**
 * Runtime allow-list, for the dev-warn to check against a passed
 * `gap` value at render time. Same set as {@link StackGap}. Frozen
 * so callers can't mutate the source of truth.
 */
export const STACK_GAP_VALUES: readonly StackGap[] = Object.freeze([
  0, 0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24,
]);
