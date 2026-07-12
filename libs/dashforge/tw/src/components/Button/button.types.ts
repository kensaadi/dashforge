import type { ButtonHTMLAttributes } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { ButtonVariants } from './button.variants.js';

/**
 * Subset of `<Button>` props that are configurable via
 * `theme.components.Button.defaults` (Option C).
 *
 * Only design-oriented variant axes are exposed — non-design fields
 * (`access`, `visibleWhen`, event handlers, ARIA, etc.) are NOT
 * theme-configurable because they carry per-instance semantics that
 * do not generalize across a whole app.
 */
export type ButtonVariantProps = Pick<
  ButtonVariants,
  'variant' | 'color' | 'size' | 'fullWidth' | 'loading'
>;

/**
 * Register `<Button>` with the theme's component defaults registry.
 *
 * This makes `theme.components.Button.defaults` type-check the way
 * consumers expect: only the variant axes above are allowed, with
 * autocomplete on each. `useComponentDefaults('Button')` then returns
 * the configured entry (or `undefined`) to `Button.tsx`, which merges
 * theme values under instance props via `{ ...theme.defaults, ...props }`.
 */
declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Button?: {
      defaults?: Partial<ButtonVariantProps>;
    };
  }
}

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
  // axis (`'primary' | 'secondary' | …`). Declared explicitly below so
  // JSDoc + defaults surface through the docs auto-sync pipeline
  // (`pnpm sync:props` in dashforge-docs-lab).
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'color'> {
  /**
   * Semantic intent role. Drives both bg/fg and hover/active states.
   * @default 'primary'
   */
  color?: ButtonVariants['color'];

  /**
   * Visual treatment.
   * @default 'solid'
   */
  variant?: ButtonVariants['variant'];

  /**
   * Height + padding + font size density.
   * @default 'md'
   */
  size?: ButtonVariants['size'];

  /**
   * When `true`, replace the label with a `<Spinner>`, short-circuit
   * click handlers, and set `aria-busy="true"`.
   * @default false
   */
  loading?: ButtonVariants['loading'];

  /**
   * Stretch the button to fill its container's width (`w-full`).
   * @default false
   */
  fullWidth?: ButtonVariants['fullWidth'];

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
   * Reactive visibility predicate. Re-evaluated on every engine state
   * change when the button is mounted inside a `<DashForm>`; outside
   * a form, evaluated as a plain predicate (the consumer captures
   * any external state in the closure).
   *
   * When the predicate returns `false`, the component renders `null`.
   *
   * **Added in 1.1.0 (Sprint 4.4 alignment)** — extends the
   * engine-reactive visibility pattern previously available only on
   * form fields + `<Alert>` to every interactive component in the
   * Dashforge TW catalog (Button, IconButton, Chip, …).
   *
   * Note: `visibleWhen` is for **state-driven** hide. For
   * **permission-driven** hide, use `access` with
   * `onUnauthorized: 'hide'` — it's the semantically correct path
   * and provides better error messages in RBAC dev tools.
   *
   * @example
   * ```tsx
   * // Inside a DashForm — reactive on engine state
   * <Button
   *   visibleWhen={(engine) =>
   *     engine.getNode('plan')?.value === 'premium'
   *   }
   * >
   *   Upgrade extras
   * </Button>
   *
   * // Outside a form — closure over external React state
   * <Button visibleWhen={() => itemCount > 0}>Bulk delete</Button>
   * ```
   */
  visibleWhen?: (engine: Engine) => boolean;

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
