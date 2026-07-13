import type { AnchorHTMLAttributes, ReactNode } from 'react';
import type { LinkVariants } from './link.variants.js';

/**
 * Subset of `<Link>` props theme-configurable via
 * `theme.components.Link.defaults` (Option C).
 */
export type LinkVariantProps = Pick<
  LinkVariants,
  'color' | 'underline' | 'weight' | 'size'
>;

/**
 * Per-slot override map. Each entry accepts a `{ className?: string }`
 * merged via `tailwind-merge` at render time.
 *
 * Slots:
 *   - `root`      — the `<a>` (or, with `asChild`, the polymorphic
 *                   host). `sx` is a shortcut for `slotProps.root.className`.
 *   - `startIcon` — the leading icon wrapper (`<span>` inline-flex).
 *   - `endIcon`   — the trailing icon wrapper (`<span>` inline-flex).
 */
export interface LinkSlotProps {
  root?: { className?: string };
  startIcon?: { className?: string };
  endIcon?: { className?: string };
}

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Link?: {
      defaults?: Partial<LinkVariantProps>;
      slotProps?: LinkSlotProps;
    };
  }
}

/**
 * Props for `<Link>` — the token-driven anchor primitive.
 *
 * Every visual axis is opt-in AND `theme.components.Link.defaults`
 * configurable, so a DS that says "Link is primary + semibold +
 * uppercase" writes it once in the theme and bare `<Link>text</Link>`
 * renders that identity everywhere. No hardcoded design language
 * inside the component.
 *
 * Precedence (lowest → highest):
 *   1. `defaultVariants` in `linkVariants` (primary / hover / normal / md).
 *   2. `theme.components.Link.defaults`.
 *   3. Instance props (`<Link color="danger">`).
 *   4. `sx` (tailwind-merge, last).
 *
 * @example Minimal
 * ```tsx
 * <Link href="/dashboard">Go to dashboard</Link>
 * ```
 *
 * @example Theme-driven DS identity (Option C)
 * ```tsx
 * patchTheme({
 *   components: {
 *     Link: {
 *       defaults: { color: 'primary', weight: 'semibold', underline: 'always', size: 'sm' },
 *     },
 *   },
 * });
 * // then anywhere:
 * <Link href="/x">go to page</Link>
 * ```
 *
 * @example With optional icons
 * ```tsx
 * <Link href="/docs" endIcon={<ChevronRight size={14} />}>Read docs</Link>
 * <Link href="/logo" startIcon={<img src="https://s3.example.com/logo.svg" width={16} alt="" />}>Brand</Link>
 * ```
 *
 * @example External — no auto-glyph; the dev owns the visual affordance
 * ```tsx
 * <Link href="https://external.example.com" external endIcon={<ExternalLinkIcon size={12} />}>
 *   Docs
 * </Link>
 * ```
 *
 * @example Router integration via `asChild` (Radix Slot pattern)
 * ```tsx
 * <Link asChild color="primary" underline="hover">
 *   <NextLink to="/settings">Settings</NextLink>
 * </Link>
 * // The <NextLink> receives Link's classes directly — no wrapping <a>.
 * ```
 */
export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'color'> {
  /**
   * Color intent. `inherit` opts out for links on coloured surfaces.
   * @default (theme.components.Link.defaults.color ?? 'primary')
   */
  color?: LinkVariants['color'];

  /**
   * Underline behavior. `always` for prose, `hover` for buttons/nav,
   * `none` for icon-heavy links where the underline would be visual noise.
   * @default (theme.components.Link.defaults.underline ?? 'hover')
   */
  underline?: LinkVariants['underline'];

  /**
   * Font weight override. Matches Typography's `weight`.
   * @default (theme.components.Link.defaults.weight ?? 'normal')
   */
  weight?: LinkVariants['weight'];

  /**
   * Font size step. Matches Typography's caption / body / subtitle scale.
   * @default (theme.components.Link.defaults.size ?? 'md')
   */
  size?: LinkVariants['size'];

  /**
   * Icon rendered BEFORE the link text. Accepts any `ReactNode` —
   * a lucide/Radix icon, an inline `<svg>`, an `<img src="...">`
   * (S3 / CDN URL included). Ignored when `asChild` is true (the
   * consumer child renders its own content).
   */
  startIcon?: ReactNode;

  /**
   * Icon rendered AFTER the link text. Same acceptance as `startIcon`.
   * Common uses: chevron, external-link glyph, download icon. Ignored
   * when `asChild` is true.
   */
  endIcon?: ReactNode;

  /**
   * When true, applies `target="_blank"` + `rel="noopener noreferrer"`
   * on the rendered `<a>`. Consumer-supplied `target` / `rel` on the
   * same instance are honoured (not overwritten).
   *
   * **Does NOT append any visual glyph** — the caller owns that choice.
   * Pass an icon via `endIcon` for the standard `↗` affordance.
   *
   * @default false
   */
  external?: boolean;

  /**
   * Radix Slot polymorphism. When true, the Link's styles paint onto
   * the single React child (matching the pattern used by
   * `<Button asChild>`, `<Chip asChild>`, etc.). Idiomatic for router
   * integration:
   *
   * ```tsx
   * <Link asChild>
   *   <NextLink to="/x">Go</NextLink>
   * </Link>
   * ```
   *
   * With `asChild=true`, `startIcon` / `endIcon` are ignored — the
   * consumer child renders its own content and the Slot has no seam to
   * inject a wrapper.
   *
   * @default false
   */
  asChild?: boolean;

  /**
   * Utility-class escape hatch. Appended to the variant chain and
   * resolved via `tailwind-merge` so consumer classes win over the
   * variant defaults on the same axis (Dashforge idiom).
   */
  sx?: string;

  /**
   * Per-slot overrides. See {@link LinkSlotProps}.
   */
  slotProps?: LinkSlotProps;
}
