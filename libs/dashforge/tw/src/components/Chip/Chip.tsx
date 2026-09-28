import { forwardRef, useContext, type KeyboardEvent, type MouseEvent } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { chipVariants } from './chip.variants.js';
import type { ChipProps } from './chip.types.js';

/**
 * Default delete-button glyph — inline stroke SVG. Inherits the
 * chip's text colour via `currentColor`. No icon-library dep.
 *
 * @internal
 */
function DefaultDeleteIcon() {
  return (
    <svg
      width="0.875em"
      height="0.875em"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m4 4 6 6M10 4l-6 6" />
    </svg>
  );
}

/**
 * Dashforge TW Chip — status / filter / tag pill.
 *
 * Promoted from the internal `Table/cells/RenderChip` (Sprint 4.4):
 * preserves the 3 × 7 variant × color matrix byte-identical and adds
 * the public API (label, icon, avatar, clickable, onClick, onDelete,
 * selected, access).
 *
 * **Rendering modes** (chosen at runtime from props):
 *   - **Static** (default) → `<span>`. Pure display.
 *   - **Clickable** (`clickable` true OR `onClick` provided) →
 *     `<button type="button">` with focus ring + hover state.
 *   - **Deletable** (`onDelete` provided) → root + trailing `<button>`
 *     for the delete glyph. Static or clickable root depending on
 *     whether `onClick` is also set.
 *
 * **Variant axis** is `soft | solid | outline` (Dashforge chip
 * vocabulary, default `'soft'`). Distinct from Button's
 * (`solid | outline | ghost | link`) and Alert's
 * (`standard | filled | outlined`) by design — see CHANGELOG.
 *
 * **A11y**:
 *   - Static chip → no role (it's a `<span>`).
 *   - Clickable chip → native `<button>` semantics.
 *   - `selected` → `aria-pressed="true"` (so it announces as a toggle
 *     button in pressed state).
 *   - Delete button → its own `<button>` with `aria-label`
 *     (defaults to `'Remove'`).
 *
 * @example
 * ```tsx
 * // Static status chip
 * <Chip label="Active" color="success" />
 *
 * // With icon
 * import { CheckIcon } from 'lucide-react';
 * <Chip label="Verified" color="success" icon={<CheckIcon size={14} />} />
 *
 * // Filter chip (clickable + toggle via selected)
 * <Chip
 *   label="Last 7 days"
 *   color="primary"
 *   clickable
 *   selected={range === '7d'}
 *   onClick={() => setRange('7d')}
 * />
 *
 * // Removable tag
 * <Chip
 *   label="design-system"
 *   color="info"
 *   variant="outline"
 *   onDelete={() => removeTag('design-system')}
 * />
 *
 * // RBAC-gated admin chip
 * <Chip
 *   label="Admin"
 *   color="danger"
 *   variant="solid"
 *   access={{ resource: 'role', action: 'read', onUnauthorized: 'hide' }}
 * />
 * ```
 */
export const Chip = forwardRef<HTMLElement, ChipProps>(function Chip(
  props,
  ref
) {
  const themeDefaults = useComponentDefaults('Chip');
  const merged: ChipProps = { ...themeDefaults?.defaults, ...props };
  const {
    label,
    icon,
    avatar,
    variant,
    color,
    size,
    clickable: clickableProp,
    onClick,
    onDelete,
    deleteIcon,
    deleteLabel = 'Remove',
    selected,
    disabled: disabledProp,
    draggable,
    onDragStart,
    onDragEnd,
    visibleWhen,
    access,
    sx,
    className,
  } = merged;

  // Bridge — both hooks called unconditionally (rules-of-hooks).
  // Inside a `<DashForm>`, `useEngineVisibility` subscribes to engine
  // state and re-evaluates the predicate on changes; outside a form,
  // the predicate is called with `null` engine (consumer captures
  // external state in the closure).
  const bridge = useContext(DashFormContext);
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  const accessState = useAccessState(access);

  if (!isVisible || !accessState.visible) return null;

  // Effective interactivity / disabled — mirrors Button semantics.
  const isClickable = Boolean(clickableProp ?? onClick);
  const isDisabled =
    Boolean(disabledProp) || accessState.disabled || accessState.readonly;

  const classes = cn(
    chipVariants({
      color,
      variant,
      size,
      clickable: isClickable || undefined,
      selected: selected || undefined,
      disabled: isDisabled || undefined,
          draggable: draggable || undefined,
    }),
    sx,
    className
  );

  // ─── Inner content — leading slot + label + delete ────────────
  // Avatar wins over icon when both provided (MUI parity).
  // Label is rendered as a direct text node (no wrapping span) so
  // the chip DOM stays minimal and consumers that target the root
  // via `getByText(label)` continue working. The root's
  // `inline-flex items-center` provides vertical alignment with
  // any leading / trailing slots.
  const leading = avatar ?? icon;

  const deleteClasses = cn(
    'ml-0.5 -mr-1 inline-flex items-center justify-center',
    'h-4 w-4 rounded-full opacity-70 hover:opacity-100',
    'transition-opacity'
  );

  /*
   * The delete affordance has TWO shapes, and which one is legal depends
   * on what the root turned out to be. See README-BUG § BUG 35.
   *
   * Static root (`<span>`): a real `<button>`. A span is not a widget, so
   * a focusable button inside it is valid HTML and is the only keyboard
   * path to delete. Unchanged.
   *
   * Clickable root (`role="button"`): NOT a button, and not focusable.
   * Both `<button>` and `role="button"` forbid interactive descendants —
   * HTML by its content model, ARIA by the presentational-children rule,
   * which strips the semantics of everything inside a `button` role. So a
   * nested control is either invalid markup or invisible to AT, depending
   * on which spelling you pick. The keyboard path moves to Backspace /
   * Delete on the chip itself, which is what MUI does and what this
   * component's own `onKeyDown` comment already anticipated.
   */
  const deleteNode =
    onDelete == null ? null : isClickable ? (
      <span
        data-chip-delete=""
        // Not focusable and hidden from AT on purpose: a `button` role
        // makes its children presentational, so exposing this would only
        // promise an affordance assistive tech cannot reach. Backspace
        // and Delete on the chip are the accessible path.
        aria-hidden="true"
        onClick={(e: MouseEvent<HTMLSpanElement>) => {
          // Stop propagation so the chip's own onClick doesn't fire when
          // the user clicks the × — MUI matches this behaviour.
          e.stopPropagation();
          if (!isDisabled) onDelete(e);
        }}
        className={cn(deleteClasses, !isDisabled && 'cursor-pointer')}
      >
        {deleteIcon ?? <DefaultDeleteIcon />}
      </span>
    ) : (
      <button
        data-chip-delete=""
        type="button"
        aria-label={deleteLabel}
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          if (!isDisabled) onDelete(e);
        }}
        disabled={isDisabled}
        className={cn(
          deleteClasses,
          'outline-none focus-visible:ring-2 focus-visible:ring-current'
        )}
      >
        {deleteIcon ?? <DefaultDeleteIcon />}
      </button>
    );

  const innerContent = (
    <>
      {leading != null && (
        <span className="-ml-0.5 inline-flex items-center shrink-0">
          {leading}
        </span>
      )}
      {label}
      {deleteNode}
    </>
  );

  // ─── Interactive root (clickable) ─────────────────────────────
  /*
   * A `<div role="button">`, not a `<button>`. With `onDelete` also set,
   * the native element nested a `<button>` inside a `<button>`, which is
   * invalid HTML: React reported a hydration error and the parser hoisted
   * the inner control out. BUG 35.
   *
   * Everything the native element gave away is re-supplied below, because
   * a div gives none of it: focusability, Enter / Space activation, and
   * inertness while disabled.
   */
  // A disabled chip must not be a drag source either: `pointer-events-none`
  // already blocks the pointer, but the attribute would still advertise it.
  const dragProps = {
    draggable: draggable && !isDisabled ? true : undefined,
    onDragStart: draggable && !isDisabled ? onDragStart : undefined,
    onDragEnd: draggable && !isDisabled ? onDragEnd : undefined,
  };

  if (isClickable) {
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        className={classes}
        {...dragProps}
        aria-disabled={isDisabled || undefined}
        aria-pressed={selected ? true : undefined}
        onClick={(e: MouseEvent<HTMLDivElement>) => {
          if (isDisabled) return;
          onClick?.(e);
        }}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if (isDisabled) return;

          // Ignore anything bubbling up from a child, so a focusable slot
          // (an interactive avatar, say) keeps its own keys. Mirrors
          // MUI's `event.currentTarget === event.target` guard.
          if (e.currentTarget !== e.target) return;

          // A div has no implicit activation. Space is prevented first so
          // the page does not scroll under the chip.
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.(e as unknown as MouseEvent<HTMLDivElement>);
            return;
          }

          // The keyboard path to the delete affordance, which is not
          // focusable in this branch. Same keys as MUI.
          if (onDelete != null && (e.key === 'Backspace' || e.key === 'Delete')) {
            e.preventDefault();
            onDelete(e as unknown as MouseEvent<HTMLButtonElement>);
          }
        }}
      >
        {innerContent}
      </div>
    );
  }

  // ─── Static root (display only) ───────────────────────────────
  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={classes}
      aria-disabled={isDisabled || undefined}
      {...dragProps}
    >
      {innerContent}
    </span>
  );
});
