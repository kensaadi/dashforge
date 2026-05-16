import type { ButtonHTMLAttributes } from 'react';
import type { AccessRequirement } from '@dashforge/rbac';
import type { ButtonVariants } from './button.variants.js';

/**
 * Props for the Dashforge TW `<Button>` component.
 *
 * Extends the native `<button>` attributes (so `onClick`, `type`,
 * `aria-*`, `data-*` etc. all flow through), narrowed in two places:
 *
 *   - `disabled` is kept (combines with RBAC + loading via OR)
 *   - `className` is omitted — use `sx` instead. This keeps the
 *     override path **single and explicit**: `sx` is the escape hatch
 *     for adding utility classes, and `tailwind-merge` (via `cn()`)
 *     guarantees it wins over any conflicting variant class.
 *
 * Plus the variant axes from `tailwind-variants` and Dashforge-specific
 * additions:
 *
 *   - `access` — RBAC requirement (hide / disable / readonly)
 *   - `asChild` — Radix Slot polymorphism: when `true`, renders the
 *     immediate child element with the Button's class merged in, so
 *     `<Button asChild><a href="/x">Go</a></Button>` produces a styled
 *     `<a>` with no extra wrapper DOM
 */
export interface ButtonProps
  // `color` is omitted from the native `<button>` attributes because
  // HTML's legacy `color` attribute (string) collides with our variant
  // axis (`'primary' | 'secondary' | …`). The Picked variant version
  // is the canonical one.
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'color'>,
    Pick<ButtonVariants, 'variant' | 'color' | 'size' | 'fullWidth' | 'loading'> {
  /**
   * RBAC access control requirement.
   *
   * Controls button visibility and interaction based on user
   * permissions:
   *   - `onUnauthorized: 'hide'`     → button does not render
   *   - `onUnauthorized: 'disable'`  → button renders disabled
   *   - `onUnauthorized: 'readonly'` → button renders disabled
   *     (buttons do not support true readonly semantics; disabled is
   *     used as fallback)
   *
   * Combines with `disabled` and `loading` props via OR logic.
   */
  access?: AccessRequirement;

  /**
   * When `true`, the immediate child element is rendered with the
   * Button's classes merged in (via `@radix-ui/react-slot`). The
   * Button DOM element is not emitted.
   *
   * Common pattern: render a router `Link` with Button styling.
   *
   * @example
   * ```tsx
   * <Button asChild variant="solid">
   *   <Link to="/dashboard">Dashboard</Link>
   * </Button>
   * ```
   */
  asChild?: boolean;

  /**
   * Tailwind utility classes appended **after** the variant classes,
   * so they win on any conflict via `tailwind-merge`.
   *
   * @example
   * ```tsx
   * <Button sx="md:w-1/2 shadow-xl">Save</Button>
   * ```
   */
  sx?: string;
}
