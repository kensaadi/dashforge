import { useContext } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import {
  getSeverityClasses,
  getSeverityRole,
} from '../_shared/severity/severityVariants.js';
import { getDefaultSeverityIcon } from '../_shared/severity/severityIcons.js';
import { alertVariants } from './alert.variants.js';
import type { AlertProps, AlertTitleProps } from './alert.types.js';

/**
 * `<AlertTitle>` — optional title block, rendered as the first child
 * of `<Alert>`. Pattern mirrors MUI exactly (sub-component, not a
 * prop), so the JSX shape ports 1:1 from `@mui/material`.
 *
 * @example
 * <Alert severity="warning">
 *   <AlertTitle>Subscription expires soon</AlertTitle>
 *   Renew before 2026-06-20 to keep access.
 * </Alert>
 */
export function AlertTitle({ children, className }: AlertTitleProps) {
  const { titleSlot } = alertVariants();
  return (
    <div className={cn(titleSlot(), className)}>
      {children}
    </div>
  );
}

/**
 * `<Alert>` — inline persistent status surface.
 *
 * **API**: full MUI Alert parity (`severity`, `variant`, `icon`,
 * `onClose`, `action`, `role`, `<AlertTitle>` sub-component). One
 * deliberate divergence: `severity="danger"` instead of MUI's
 * `severity="error"` — aligned to the `danger.*` token palette.
 *
 * **Bridge integration** (Dashforge extras):
 *   - `visibleWhen` — engine-reactive predicate (re-evaluated on
 *     every engine state change when mounted inside a `<DashForm>`)
 *   - `access` — RBAC gating via `@dashforge/rbac`
 *
 * **Token-driven**: every color class flows from `dashforgePreset()`
 * via CSS variables. No hardcoded hex, no `dark:` variants. The
 * 3×4 color matrix lives in `_shared/severity/severityVariants.ts`
 * and is shared with the refactored `<Snackbar>` (and future Banner).
 *
 * **A11y**: `role="alert"` for assertive severities (warning, danger)
 * and `role="status"` for polite ones (info, success). Override via
 * the `role` prop. The icon is `aria-hidden` — the message text is
 * the semantic carrier.
 *
 * @example
 * // Default — soft tinted surface, default icon
 * <Alert severity="info">New feature: export to CSV is now in beta.</Alert>
 *
 * // With title (sub-component) + close button
 * <Alert severity="warning" onClose={dismiss}>
 *   <AlertTitle>Subscription expires soon</AlertTitle>
 *   Your Pro plan ends in 3 days.
 * </Alert>
 *
 * // Custom icon
 * import { Bell } from 'lucide-react';
 * <Alert severity="info" icon={<Bell size={20} />}>3 new notifications</Alert>
 *
 * // No icon — colored surface alone carries the severity
 * <Alert severity="success" icon={false}>Saved 2 minutes ago.</Alert>
 *
 * // Custom action — CTA replaces the auto-close button
 * <Alert severity="warning" action={<button onClick={renew}>Renew</button>}>
 *   Trial expires in 3 days.
 * </Alert>
 *
 * // Filled variant — for high-priority callouts
 * <Alert severity="danger" variant="filled">
 *   Couldn't save — 3 fields below contain validation errors.
 * </Alert>
 */
export function Alert({
  severity,
  variant = 'standard',
  children,
  icon: iconProp,
  onClose,
  closeText = 'Close',
  action,
  role: roleProp,
  visibleWhen,
  access,
  sx,
  className,
  slotProps,
}: AlertProps) {
  // Bridge — both hooks safely return defaults outside a DashForm /
  // RbacProvider, matching the TextField pattern.
  const bridge = useContext(DashFormContext);
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  const accessState = useAccessState(access);

  if (!isVisible || !accessState.visible) return null;

  const v = alertVariants();
  const severityClasses = getSeverityClasses(variant, severity);
  const role = roleProp ?? getSeverityRole(severity);

  // Icon resolution:
  // - false → no icon
  // - undefined → default per severity (lib's inline SVG)
  // - ReactNode → consumer's custom icon
  const renderedIcon =
    iconProp === false
      ? null
      : iconProp !== undefined
        ? iconProp
        : getDefaultSeverityIcon(severity);

  return (
    <div
      role={role}
      className={cn(
        v.root(),
        severityClasses.surface,
        severityClasses.border,
        sx,
        className,
        slotProps?.root?.className
      )}
      {...slotProps?.root}
    >
      {renderedIcon !== null && (
        <span
          className={cn(
            v.icon(),
            severityClasses.icon,
            slotProps?.icon?.className
          )}
          {...slotProps?.icon}
        >
          {renderedIcon}
        </span>
      )}

      <div
        className={cn(v.content(), slotProps?.content?.className)}
        {...slotProps?.content}
      >
        {children}
      </div>

      {action ? (
        <div
          className={cn(v.action(), slotProps?.action?.className)}
          {...slotProps?.action}
        >
          {action}
        </div>
      ) : onClose ? (
        <button
          type="button"
          aria-label={closeText}
          onClick={onClose}
          className={cn(v.closeButton(), slotProps?.closeButton?.className)}
          {...slotProps?.closeButton}
        >
          <svg
            width="1em"
            height="1em"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 6 8 8M14 6l-8 8" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
