import { forwardRef, useContext } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { buttonVariants } from '../Button/button.variants.js';
import { Spinner } from '../Spinner/Spinner.js';
import type { SpinnerSize } from '../Spinner/spinner.types.js';
import {
  ICON_BUTTON_BASE,
  ICON_BUTTON_SIZE_OVERRIDES,
} from './iconButton.variants.js';
import type { IconButtonProps } from './iconButton.types.js';

/**
 * Map IconButton size to Spinner size. Same mapping as Button —
 * Spinner has 5 steps, the parent has 3.
 *
 * @internal
 */
function iconButtonSizeToSpinnerSize(size: 'sm' | 'md' | 'lg'): SpinnerSize {
  return size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';
}

/**
 * Dashforge TW IconButton — square, icon-only action button.
 *
 * Reuses `buttonVariants` 1:1 (same `variant` / `color` / `size` /
 * `loading` axes) so every `<Button>` style maps to the equivalent
 * `<IconButton>` with zero code duplication. The ONLY additions are:
 *
 *   - `ICON_BUTTON_SIZE_OVERRIDES` — forces `w-N + px-0` so the button
 *     is square at every size token
 *   - `ICON_BUTTON_BASE` — `aspect-square inline-flex items-center
 *     justify-center` for layout
 *
 * Both additions are token-driven (spacing) or layout-primitive
 * (geometry) — no hardcoded hex, no `dark:` variants.
 *
 * **`aria-label` is REQUIRED** at the type level — icon-only buttons
 * are invisible to assistive tech without an explicit accessible
 * name. The TypeScript compiler enforces this rather than relying on
 * runtime warnings.
 *
 * RBAC integration mirrors `<Button>`: `access` with
 * `onUnauthorized: 'hide' | 'disable' | 'readonly'`. No `visibleWhen`
 * (mirror Button — buttons should disable, not hide, on
 * state-driven unavailability; permission-driven hiding is `access`).
 *
 * @example
 * ```tsx
 * import { Trash2 } from 'lucide-react';
 *
 * <IconButton aria-label="Delete row" color="danger" onClick={onDelete}>
 *   <Trash2 size={20} />
 * </IconButton>
 *
 * // Polymorphism via Radix Slot
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
 *
 * // Loading swap
 * <IconButton aria-label="Save" loading={isSaving}>
 *   <SaveIcon size={20} />
 * </IconButton>
 * ```
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(props, ref) {
    const {
      access,
      visibleWhen,
      disabled,
      variant,
      color,
      size = 'md',
      loading,
      asChild,
      sx,
      className,
      children,
      ...rest
    } = props;

    // Bridge — both hooks called unconditionally (rules-of-hooks).
    const bridge = useContext(DashFormContext);
    const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
    const accessState = useAccessState(access);
    if (!isVisible || !accessState.visible) return null;

    // Effective disabled = explicit OR RBAC.disabled OR RBAC.readonly OR loading.
    // Mirrors `<Button>` exactly — IconButton has no true read-only
    // state, so RBAC readonly maps to disabled (same as MUI side).
    const effectiveDisabled =
      Boolean(disabled) ||
      accessState.disabled ||
      accessState.readonly ||
      Boolean(loading);

    const classes = cn(
      buttonVariants({ variant, color, size, loading }),
      ICON_BUTTON_SIZE_OVERRIDES[size],
      ICON_BUTTON_BASE,
      sx,
      className
    );

    // `aria-busy` while loading — distinguishes "wait for action to
    // finish" from "you can't do this" in screen-reader announcements.
    const ariaBusy = loading ? true : undefined;

    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={classes}
          data-disabled={effectiveDisabled || undefined}
          aria-disabled={effectiveDisabled || undefined}
          aria-busy={ariaBusy}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type={rest.type ?? 'button'}
        disabled={effectiveDisabled}
        aria-busy={ariaBusy}
        className={classes}
        {...rest}
      >
        {loading ? (
          <Spinner
            size={iconButtonSizeToSpinnerSize(size)}
            thickness="thick"
            withTrack
            label=""
          />
        ) : (
          children
        )}
      </button>
    );
  }
);
