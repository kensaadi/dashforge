import { useState, type ReactNode } from 'react';
import type { AccessRequirement } from '@dashforge/rbac';
import { Popover } from '../../Popover/Popover.js';
import { useAccessState } from '../../../hooks/useAccessState.js';
import { cn } from '../../../utils/cn.js';

/**
 * Single action definition for `<RowActionsMenu>`.
 *
 * `access` (optional) gates the action via RBAC:
 *  - `onUnauthorized: 'hide'`     → action not rendered
 *  - `onUnauthorized: 'disable'`  → action visible, disabled
 *  - `onUnauthorized: 'readonly'` → action visible, disabled
 */
export interface TableRowAction<T> {
  label: ReactNode;
  onClick: (row: T) => void;
  icon?: ReactNode;
  color?: 'default' | 'danger' | 'warning';
  disabled?: boolean;
  access?: AccessRequirement;
}

export interface RowActionsMenuProps<T> {
  row: T;
  actions: TableRowAction<T>[];
  /** Custom trigger element. Defaults to a ⋮ icon button. */
  trigger?: ReactNode;
  /** Aria-label for the default trigger. */
  ariaLabel?: string;
}

/**
 * 3-dot row actions menu. Renders a trigger button that opens a
 * Popover (Sprint 3 component) with a list of action menu items.
 *
 * Replaces the MUI-side `RowActions.tsx` (IconButton + Menu) with
 * the TW equivalents. Per-action RBAC honored: hidden actions are
 * filtered out, disabled actions render disabled.
 */
export function RowActionsMenu<T>(props: RowActionsMenuProps<T>) {
  const { row, actions, trigger, ariaLabel = 'Row actions' } = props;
  const [open, setOpen] = useState(false);

  // Filter actions by RBAC (hidden actions removed entirely)
  const visibleActions = actions.filter((action) => {
    if (!action.access) return true;
    return action.access.onUnauthorized !== 'hide';
  });

  if (visibleActions.length === 0) return null;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="bottom"
      align="end"
      content={
        <ul className="flex flex-col gap-0.5 min-w-[140px] list-none pl-0 m-0" role="menu">
          {visibleActions.map((action, idx) => (
            <RowActionMenuItem
              key={idx}
              action={action}
              row={row}
              onClose={() => setOpen(false)}
            />
          ))}
        </ul>
      }
    >
      {trigger ?? (
        <button
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="menu"
          aria-expanded={open}
          className={cn(
            'inline-flex items-center justify-center h-8 w-8 rounded-md',
            // Neutral palette auto-inverts via the dashforgePreset()
            // CSS-var swap — no `dark:` variant needed.
            'text-neutral-500 hover:text-neutral-900',
            'hover:bg-neutral-100',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            'transition-colors motion-reduce:transition-none',
          )}
        >
          <svg
            width="1em"
            height="1em"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="8" cy="3"  r="1.4" />
            <circle cx="8" cy="8"  r="1.4" />
            <circle cx="8" cy="13" r="1.4" />
          </svg>
        </button>
      )}
    </Popover>
  );
}

function RowActionMenuItem<T>(props: {
  action: TableRowAction<T>;
  row: T;
  onClose: () => void;
}) {
  const { action, row, onClose } = props;
  const accessState = useAccessState(action.access);
  const isDisabled = action.disabled || accessState.disabled || accessState.readonly;

  return (
    <li role="none">
      <button
        type="button"
        role="menuitem"
        disabled={isDisabled}
        onClick={() => {
          onClose();
          action.onClick(row);
        }}
        className={cn(
          'flex items-center gap-2 w-full text-left',
          'px-3 py-1.5 rounded-md text-sm',
          // Neutral palette auto-inverts; danger/warning are color
          // palettes (no auto-invert) so they keep their `dark:` shift
          // intentionally — design choice, not a bug.
          'hover:bg-neutral-100',
          'focus:outline-none focus-visible:bg-neutral-100',
          'transition-colors motion-reduce:transition-none',
          'disabled:opacity-50 disabled:pointer-events-none',
          action.color === 'danger' && 'text-danger-700 dark:text-danger-300',
          action.color === 'warning' && 'text-warning-700 dark:text-warning-300',
        )}
      >
        {action.icon && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {action.icon}
          </span>
        )}
        <span>{action.label}</span>
      </button>
    </li>
  );
}
