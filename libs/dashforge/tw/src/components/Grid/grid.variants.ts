import { tv, type VariantProps } from 'tailwind-variants';

/**
 * `gridVariants` — CSS Grid container + item, polymorphic in role.
 *
 * Architectural choice (planned with the user — F9 deep dive):
 *
 *   Pattern is MUI Grid v2 from the API side (`<Grid container>` +
 *   `<Grid xs={6}>`), but engine is REAL CSS Grid under the hood
 *   (`display: grid` + `grid-template-columns: repeat(N, 1fr)` +
 *   `col-span-*`). MUI v2 uses flexbox + basis percentages — historical
 *   IE11 reasons. In 2026, CSS Grid is universally supported AND
 *   Tailwind ships `grid-cols-*` / `col-span-*` natively, so flexbox
 *   would be a downgrade.
 *
 * Two distinct shapes coexist in the same TV recipe:
 *
 *   • container=true   — display:grid + cols + gap + autoFlow
 *   • container=false  — col-span at each breakpoint (xs/sm/md/lg/xl)
 *
 *   The discriminated union lives in grid.types.ts (TypeScript-level);
 *   here the TV catalogue exposes every axis so the consumer's choice
 *   triggers the right classes regardless of which role the component
 *   is playing. Unused axes produce no classes (TV silently drops
 *   undefined variants), so a container Grid never accidentally emits
 *   `col-span-6` and an item Grid never accidentally emits `grid`.
 *
 * Mapping table size:
 *   • cols                  : 6 entries (12, 6, 4, 3, 2, 1)
 *   • autoFlow              : 5 entries
 *   • span axes (5×14)      : 70 entries (xs/sm/md/lg/xl × {1..12, auto, full})
 *   • gap / gapX / gapY     : 33 entries (11 steps × 3 axes)
 *
 *   Total: ~115 literal class names. All explicit, all Tailwind-scannable.
 *   Bundle CSS impact when fully exercised: ~3 KB gz (mostly the
 *   responsive col-span set).
 */
export const gridVariants = tv({
  base: '',

  variants: {
    // ─── CONTAINER role ────────────────────────────────────────────────
    container: { true: 'grid' },

    cols: {
      1:  'grid-cols-1',
      2:  'grid-cols-2',
      3:  'grid-cols-3',
      4:  'grid-cols-4',
      6:  'grid-cols-6',
      12: 'grid-cols-12',
    },

    autoFlow: {
      row:        'grid-flow-row',
      col:        'grid-flow-col',
      dense:      'grid-flow-dense',
      'row-dense':'grid-flow-row-dense',
      'col-dense':'grid-flow-col-dense',
    },

    /*
     * Container gap — token-scale step. Same set as Box/Stack so muscle
     * memory carries across primitives.
     */
    spacing: {
      0:    'gap-0',    '0.5': 'gap-0.5', 1:  'gap-1',  2:  'gap-2',  3:  'gap-3',
      4:    'gap-4',    6:     'gap-6',   8:  'gap-8',  12: 'gap-12', 16: 'gap-16',
      24:   'gap-24',
    },
    spacingX: {
      0:    'gap-x-0',  '0.5': 'gap-x-0.5', 1:  'gap-x-1',  2:  'gap-x-2',  3:  'gap-x-3',
      4:    'gap-x-4',  6:     'gap-x-6',   8:  'gap-x-8',  12: 'gap-x-12', 16: 'gap-x-16',
      24:   'gap-x-24',
    },
    spacingY: {
      0:    'gap-y-0',  '0.5': 'gap-y-0.5', 1:  'gap-y-1',  2:  'gap-y-2',  3:  'gap-y-3',
      4:    'gap-y-4',  6:     'gap-y-6',   8:  'gap-y-8',  12: 'gap-y-12', 16: 'gap-y-16',
      24:   'gap-y-24',
    },

    // ─── ITEM role — col-span at each breakpoint ──────────────────────
    /*
     * `xs` is the base breakpoint (no prefix) — Tailwind's mobile-first
     * convention. `sm/md/lg/xl` cascade up from there.
     *
     * Special values:
     *   • 'auto' → col-auto (content-sized)
     *   • 'full' → col-span-full (span all columns regardless of count)
     */
    xs: {
      1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
      5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
      9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12',
      auto: 'col-auto', full: 'col-span-full',
    },
    sm: {
      1: 'sm:col-span-1', 2: 'sm:col-span-2', 3: 'sm:col-span-3', 4: 'sm:col-span-4',
      5: 'sm:col-span-5', 6: 'sm:col-span-6', 7: 'sm:col-span-7', 8: 'sm:col-span-8',
      9: 'sm:col-span-9', 10: 'sm:col-span-10', 11: 'sm:col-span-11', 12: 'sm:col-span-12',
      auto: 'sm:col-auto', full: 'sm:col-span-full',
    },
    md: {
      1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4',
      5: 'md:col-span-5', 6: 'md:col-span-6', 7: 'md:col-span-7', 8: 'md:col-span-8',
      9: 'md:col-span-9', 10: 'md:col-span-10', 11: 'md:col-span-11', 12: 'md:col-span-12',
      auto: 'md:col-auto', full: 'md:col-span-full',
    },
    lg: {
      1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4',
      5: 'lg:col-span-5', 6: 'lg:col-span-6', 7: 'lg:col-span-7', 8: 'lg:col-span-8',
      9: 'lg:col-span-9', 10: 'lg:col-span-10', 11: 'lg:col-span-11', 12: 'lg:col-span-12',
      auto: 'lg:col-auto', full: 'lg:col-span-full',
    },
    xl: {
      1: 'xl:col-span-1', 2: 'xl:col-span-2', 3: 'xl:col-span-3', 4: 'xl:col-span-4',
      5: 'xl:col-span-5', 6: 'xl:col-span-6', 7: 'xl:col-span-7', 8: 'xl:col-span-8',
      9: 'xl:col-span-9', 10: 'xl:col-span-10', 11: 'xl:col-span-11', 12: 'xl:col-span-12',
      auto: 'xl:col-auto', full: 'xl:col-span-full',
    },
  },

  /*
   * No `defaultVariants`. The default semantics are role-dependent:
   *   • container Grid defaults to cols=12 (set in Grid.tsx)
   *   • item Grid defaults to xs="full" — full-width until a breakpoint
   *     prop overrides (also set in Grid.tsx)
   * Encoding these defaults at the TV level would emit them even when
   * irrelevant (e.g. an item Grid never wants `grid grid-cols-12`).
   */
});

export type GridVariants = VariantProps<typeof gridVariants>;
