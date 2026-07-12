import type { ElementType, HTMLAttributes } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { BoxVariants } from './box.variants.js';

/**
 * Subset of `<Box>` props theme-configurable via
 * `theme.components.Box.defaults` (Option C).
 *
 * Exposes the design-identity axes (`variant`, `color`, `elevation`,
 * `rounded`, `fullWidth`, `fullHeight`). Per-instance spacing (`p`,
 * `px`, `py`, `m`, `mx`, `my`) is intentionally excluded — spacing is
 * a layout choice, not a component identity, and would encourage
 * antipattern global-margin/padding overrides.
 */
export type BoxVariantProps = Pick<
  BoxVariants,
  'variant' | 'color' | 'elevation' | 'rounded' | 'fullWidth' | 'fullHeight'
>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Box?: {
      defaults?: Partial<BoxVariantProps>;
    };
  }
}

/**
 * Props for `<Box>` — the surface primitive.
 *
 * What lives in props (typed, ergonomic):
 *   • Surface          — variant, color, elevation, rounded
 *   • Spacing          — p, px, py, m, mx, my (token-scale steps)
 *   • Sizing           — fullWidth, fullHeight
 *   • Polymorphism     — as, asChild
 *   • Override escape  — sx (utility string, merged via tailwind-merge)
 *
 * What does NOT live here (deliberate, see Box.tsx header):
 *   • display / flex / grid / gap   → use Stack or Grid
 *   • position / top / z-index      → use sx
 *   • overflow / cursor             → use sx
 *   • animation / transition        → use sx
 *
 * Native attribute overrides:
 *   • `className` is omitted in favour of `sx` (string of utilities,
 *     resolved by tailwind-merge so consumer wins over variant defaults)
 *     — same convention as Button/TextField/Checkbox/Switch.
 *   • `color` is omitted: collides with the deprecated HTML4 `color`
 *     attribute. Our typed `color` (intent) is the right one.
 */
export interface BoxProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'color'>,
          Pick<BoxVariants,
            'variant' | 'color' | 'elevation' | 'rounded'
            | 'p' | 'px' | 'py' | 'm' | 'mx' | 'my'
            | 'fullWidth' | 'fullHeight'> {
  /**
   * Override the rendered HTML tag. Defaults to `'div'`. Useful when
   * the surface should also carry semantic meaning — `<Box as="section">`
   * for a page section, `<Box as="article">` for a card-shaped article.
   *
   * Ignored when `asChild` is true.
   */
  as?: ElementType;

  /**
   * Render via Radix `Slot` — the Box styles paint onto the single
   * React child instead of wrapping it in our own element. Useful for
   * `<Box asChild><Link>...</Link></Box>` to get a styled router link
   * with no extra DOM wrapper.
   *
   * Mutually exclusive with `as` (when both are passed, `asChild` wins
   * — see Box.tsx for the reasoning).
   */
  asChild?: boolean;

  /**
   * Utility classes appended to the variant chain. Resolved via
   * `tailwind-merge` so the consumer's classes always win over the
   * variant defaults. Use for one-off overrides AND for utility
   * dimensions Box deliberately doesn't expose as props (overflow,
   * position, animation, etc.).
   */
  sx?: string;

  /**
   * Reactive visibility predicate — added in 1.1.0 (Sprint 4.4
   * surface alignment). When the predicate returns `false`, the
   * component renders `null`. Inside a `<DashForm>` it subscribes
   * reactively to engine state changes; outside a form, it's
   * evaluated as a plain closure.
   *
   * Use for state-driven hiding of dashboard cards, conditional
   * sections, gated content, etc. **For permission-driven hiding,
   * prefer `access` with `onUnauthorized: 'hide'`** — it's semantically
   * the correct path and surfaces better in RBAC dev tools.
   *
   * @example
   * ```tsx
   * // Dashboard card visible only when there are pending shipments
   * <Box variant="outlined" rounded="lg" p={4}
   *   visibleWhen={() => pendingCount > 0}>
   *   <Typography variant="h3">{pendingCount} pending</Typography>
   * </Box>
   * ```
   */
  visibleWhen?: (engine: Engine) => boolean;

  /**
   * RBAC requirement — added in 1.1.0 (Sprint 4.4 surface alignment).
   * Controls Box visibility / disabled-state via the centralized
   * `@dashforge/rbac` policy engine.
   *
   * - `onUnauthorized: 'hide'`     → Box does not render
   * - `onUnauthorized: 'disable'`  → adds `aria-disabled` + dimmed
   *   visual; interactive children should derive their disabled state
   *   from `data-disabled` on the Box or pass their own `access`
   * - `onUnauthorized: 'readonly'` → adds `aria-readonly`; mostly used
   *   when Box wraps form sections that propagate readonly to children
   *
   * Use for permission-gated dashboard cards, admin-only sections,
   * tenant-aware layouts. The hide path is the common case.
   *
   * @example
   * ```tsx
   * // Revenue card visible only to users with billing:read permission
   * <Box variant="elevated" rounded="lg" elevation={2} p={4}
   *   access={{
   *     resource: 'billing',
   *     action: 'read',
   *     onUnauthorized: 'hide'
   *   }}>
   *   <Typography variant="h3">Q3 Revenue</Typography>
   * </Box>
   * ```
   */
  access?: AccessRequirement;
}
