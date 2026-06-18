import { forwardRef, useContext } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { Spinner } from '../Spinner/Spinner.js';
import type { SpinnerSize } from '../Spinner/spinner.types.js';
import { buttonVariants } from './button.variants.js';
import type { ButtonProps } from './button.types.js';

/**
 * Map Button size to Spinner size. Button has 3 sizes (sm/md/lg);
 * Spinner has 5 (xs/sm/md/lg/xl). Picking the closest match keeps
 * the spinner visually proportional to the button label.
 *
 * @internal
 */
function buttonSizeToSpinnerSize(size: 'sm' | 'md' | 'lg'): SpinnerSize {
  return size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';
}

/**
 * Dashforge TW Button — action component with RBAC support.
 *
 * Mirrors the public contract of the MUI-side
 * `@dashforge/ui/Button` (RBAC behaviour identical) while rendering
 * through Tailwind classes + the `dashforgePreset` color scales. Like
 * the MUI version, this is NOT a form field — there is no bridge
 * integration and no `DashFormContext` consumption.
 *
 * **`asChild`** mirrors the shadcn/Radix pattern: when set, the
 * immediate child element receives the Button's resolved className
 * and the Button DOM is not emitted. Useful for router Links, anchor
 * tags, or any element that should look like a button without
 * nesting one inside it.
 *
 * **Override precedence**: `sx` wins over variant classes via
 * `tailwind-merge` inside `cn()`. Variants win over the `base` class
 * group (TV's `compoundVariants` handle color×variant combos
 * explicitly).
 *
 * @example
 * ```tsx
 * <Button onClick={onSave}>Save</Button>
 *
 * <Button variant="outline" color="danger" size="lg" sx="ml-4">
 *   Delete
 * </Button>
 *
 * <Button asChild variant="solid" color="primary">
 *   <Link to="/dashboard">Open Dashboard</Link>
 * </Button>
 *
 * <Button
 *   loading
 *   access={{ resource: 'article', action: 'publish', onUnauthorized: 'disable' }}
 *   onClick={onPublish}
 * >
 *   Publish
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  props,
  ref
) {
  const {
    access,
    visibleWhen,
    disabled,
    variant,
    color,
    size,
    fullWidth,
    loading,
    asChild,
    sx,
    children,
    ...rest
  } = props;

  // Bridge — both hooks called unconditionally (rules-of-hooks).
  // Inside a `<DashForm>`, `useEngineVisibility` subscribes to engine
  // state and re-evaluates the predicate on changes; outside a form,
  // the predicate is called with `null` engine (consumer captures
  // external state in the closure).
  const bridge = useContext(DashFormContext);
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  const accessState = useAccessState(access);

  // Early return for hidden state — either RBAC denies visibility or
  // the engine-reactive predicate returned false.
  if (!isVisible || !accessState.visible) return null;

  // Effective disabled = explicit OR RBAC-disabled OR RBAC-readonly OR loading.
  // Buttons do not support a true readonly state — RBAC readonly is mapped
  // to disabled (matches the MUI-side semantics in @dashforge/ui).
  const effectiveDisabled =
    Boolean(disabled) || accessState.disabled || accessState.readonly || Boolean(loading);

  const classes = cn(
    buttonVariants({ variant, color, size, fullWidth, loading }),
    sx
  );

  /*
   * `aria-busy` announces the loading state to assistive tech.
   * `disabled` alone hides the reason (perm-denied vs loading vs
   * intrinsic), so SR users only hear "dimmed/inactive" without
   * knowing why. Adding `aria-busy={true}` while loading distinguishes
   * "wait for the action to finish" from "you can't do this".
   */
  const ariaBusy = loading ? true : undefined;

  // `asChild` renders through Radix Slot: the immediate child element
  // gets the resolved className, no extra Button DOM is emitted.
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
      {loading && (
        <Spinner
          size={buttonSizeToSpinnerSize(size ?? 'md')}
          thickness="thick"
          withTrack
          label=""
        />
      )}
      {children}
    </button>
  );
});
