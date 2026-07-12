import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { ClassValue } from 'tailwind-variants';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { ButtonVariants } from '../Button/button.variants.js';

/**
 * Subset of `<IconButton>` props theme-configurable via
 * `theme.components.IconButton.defaults` (Option C). Same variant axes
 * as `<Button>` since IconButton reuses `buttonVariants`.
 */
export type IconButtonVariantProps = Pick<
  ButtonVariants,
  'variant' | 'color' | 'size' | 'loading'
>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    IconButton?: {
      defaults?: Partial<IconButtonVariantProps>;
    };
  }
}

/**
 * Props for `<IconButton>`.
 *
 * IconButton is the **icon-only variant of `<Button>`** — it reuses
 * `buttonVariants` 1:1 (same `variant` × `color` × `size` × `loading`
 * compound matrix) and adds:
 *
 *   - Square geometry (width = height = size token, `aspect-square`)
 *   - Zero horizontal padding (no text to pad around)
 *   - **`aria-label` REQUIRED** at the type level — icon-only buttons
 *     are invisible to screen readers without an explicit label, so we
 *     enforce it via TypeScript rather than runtime warning.
 *
 * Notes on excluded props (deliberate parity with `<Button>`):
 *   - **No `slotProps`** — IconButton renders a single DOM element
 *     (`<button>` plus a transient loading swap); `className` + `sx`
 *     cover the override surface fully, matching Button.
 *   - **No `fullWidth`** — meaningless on an icon-sized button.
 *
 * As of 1.1.0 (Sprint 4.4 alignment), IconButton + Button both
 * support `visibleWhen` — see prop docs below.
 *
 * @example
 * ```tsx
 * import { TrashIcon } from 'lucide-react';
 *
 * <IconButton aria-label="Delete row" color="danger" onClick={onDelete}>
 *   <TrashIcon size={20} />
 * </IconButton>
 *
 * // Polymorphism via Radix Slot — wrap a router Link without nesting
 * // a button inside an anchor.
 * <IconButton asChild aria-label="Open settings" variant="ghost">
 *   <Link to="/settings"><SettingsIcon size={20} /></Link>
 * </IconButton>
 *
 * // RBAC-gated
 * <IconButton
 *   aria-label="Publish article"
 *   variant="solid"
 *   color="primary"
 *   access={{ resource: 'article', action: 'publish', onUnauthorized: 'disable' }}
 * >
 *   <PublishIcon size={20} />
 * </IconButton>
 * ```
 */
export interface IconButtonProps
  extends Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      'color' | 'children'
    >,
    Pick<ButtonVariants, 'variant' | 'color' | 'size' | 'loading'> {
  /**
   * The icon — typically an SVG element from the consumer's icon
   * library (Lucide / Phosphor / Tabler / inline SVG). A single
   * `ReactNode` is expected.
   */
  children: ReactNode;

  /**
   * Required at the type level — icon-only buttons MUST have an
   * accessible name. Pass a short verb phrase describing the action
   * (e.g. `"Delete row"`, `"Open settings"`, NOT `"Trash icon"`).
   */
  'aria-label': string;

  /**
   * Render-as-child via Radix Slot — the resolved IconButton
   * className is forwarded to the immediate child element, no
   * `<button>` DOM is emitted. Useful for router `<Link>`s.
   * Same contract as `<Button asChild>`.
   */
  asChild?: boolean;

  /**
   * RBAC requirement. When the current subject doesn't satisfy the
   * requirement, the button is hidden / disabled / read-only per
   * `onUnauthorized`. Same contract as `<Button access>`.
   */
  access?: AccessRequirement;

  /**
   * Reactive visibility predicate — same contract as `<Button>` and
   * `<Chip>`. When the predicate returns `false`, the component
   * renders `null`. Inside a `<DashForm>` it subscribes to engine
   * state and re-evaluates on every change; outside a form, it's
   * called with `null` engine (capture external state in closure).
   *
   * Added in 1.1.0 (Sprint 4.4 alignment) to keep IconButton in
   * lockstep with Button.
   */
  visibleWhen?: (engine: Engine) => boolean;

  /**
   * Root-element class shortcut (string or `clsx`-compatible value).
   * Last-wins via `tailwind-merge` inside `cn()`.
   */
  sx?: ClassValue;
}
