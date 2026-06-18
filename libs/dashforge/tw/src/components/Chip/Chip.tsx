import { forwardRef, useContext, type KeyboardEvent, type MouseEvent } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
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
    visibleWhen,
    access,
    sx,
    className,
  } = props;

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
  const innerContent = (
    <>
      {leading != null && (
        <span className="-ml-0.5 inline-flex items-center shrink-0">
          {leading}
        </span>
      )}
      {label}
      {onDelete != null && (
        <button
          type="button"
          aria-label={deleteLabel}
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            // Stop propagation so the chip's own onClick doesn't fire
            // when the user clicks the × — MUI matches this behaviour.
            e.stopPropagation();
            if (!isDisabled) onDelete(e);
          }}
          disabled={isDisabled}
          className={cn(
            'ml-0.5 -mr-1 inline-flex items-center justify-center',
            'h-4 w-4 rounded-full opacity-70 hover:opacity-100',
            'outline-none focus-visible:ring-2 focus-visible:ring-current',
            'transition-opacity'
          )}
        >
          {deleteIcon ?? <DefaultDeleteIcon />}
        </button>
      )}
    </>
  );

  // ─── Interactive root (clickable) ─────────────────────────────
  if (isClickable) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        disabled={isDisabled}
        aria-pressed={selected ? true : undefined}
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          if (isDisabled) return;
          onClick?.(e);
        }}
        onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
          // Native <button> handles Enter + Space already; the keydown
          // is here for future extension (e.g. Delete key to fire
          // onDelete when focused) — currently no-op.
          void e;
        }}
      >
        {innerContent}
      </button>
    );
  }

  // ─── Static root (display only) ───────────────────────────────
  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={classes}
      aria-disabled={isDisabled || undefined}
    >
      {innerContent}
    </span>
  );
});
