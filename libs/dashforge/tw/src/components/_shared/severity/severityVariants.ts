import type { Severity, SeverityClasses, SeverityVariant } from './severity.types.js';

/**
 * The 3×4 severity color matrix.
 *
 * Every class is a Tailwind utility that resolves through
 * `dashforgePreset()` to a CSS variable on the host — patchable at
 * runtime via `patchTheme({ <severity>: { …scale } })` without
 * recompiling. **Zero hardcoded hex values, zero `dark:` variants**:
 * the dashforge preset auto-inverts the neutral surface ladder via CSS
 * variable swap; the severity scales themselves do NOT auto-invert
 * (they read the same scale in light + dark, which is the desired
 * behaviour for semantic colors).
 *
 * The matrix is indexed `[variant][severity]` so a consumer-facing
 * `<Alert variant="filled" severity="warning">` resolves with a single
 * lookup.
 */
const SEVERITY_MATRIX: Record<SeverityVariant, Record<Severity, SeverityClasses>> = {
  standard: {
    info: {
      surface: 'bg-info-50 text-info-900',
      border: 'border-info-100',
      icon: 'text-info-600',
    },
    success: {
      surface: 'bg-success-50 text-success-900',
      border: 'border-success-100',
      icon: 'text-success-600',
    },
    warning: {
      surface: 'bg-warning-50 text-warning-900',
      border: 'border-warning-100',
      icon: 'text-warning-600',
    },
    danger: {
      surface: 'bg-danger-50 text-danger-900',
      border: 'border-danger-100',
      icon: 'text-danger-600',
    },
  },
  filled: {
    info: {
      surface: 'bg-info-600 text-info-50',
      border: 'border-info-700',
      icon: 'text-info-50',
    },
    success: {
      surface: 'bg-success-600 text-success-50',
      border: 'border-success-700',
      icon: 'text-success-50',
    },
    warning: {
      surface: 'bg-warning-600 text-warning-50',
      border: 'border-warning-700',
      icon: 'text-warning-50',
    },
    danger: {
      surface: 'bg-danger-600 text-danger-50',
      border: 'border-danger-700',
      icon: 'text-danger-50',
    },
  },
  outlined: {
    info: {
      surface: 'bg-transparent text-info-700',
      border: 'border-info-300',
      icon: 'text-info-600',
    },
    success: {
      surface: 'bg-transparent text-success-700',
      border: 'border-success-300',
      icon: 'text-success-600',
    },
    warning: {
      surface: 'bg-transparent text-warning-700',
      border: 'border-warning-300',
      icon: 'text-warning-600',
    },
    danger: {
      surface: 'bg-transparent text-danger-700',
      border: 'border-danger-300',
      icon: 'text-danger-600',
    },
  },
};

/**
 * Resolve the Tailwind classes for one (variant, severity) pair.
 *
 * @example
 * const { surface, border, icon } = getSeverityClasses('standard', 'warning');
 * // surface: 'bg-warning-50 text-warning-900'
 * // border:  'border-warning-100'
 * // icon:    'text-warning-600'
 */
export function getSeverityClasses(
  variant: SeverityVariant,
  severity: Severity
): SeverityClasses {
  return SEVERITY_MATRIX[variant][severity];
}

/**
 * ARIA role for a severity. Follows the W3C WAI-ARIA spec:
 * - `alert` for assertive states (warning / danger) — interrupts the
 *   screen-reader announcement queue.
 * - `status` for polite states (info / success) — queued behind other
 *   announcements.
 *
 * Consumers can override via an explicit `role` prop.
 */
export function getSeverityRole(severity: Severity): 'alert' | 'status' {
  return severity === 'warning' || severity === 'danger' ? 'alert' : 'status';
}
