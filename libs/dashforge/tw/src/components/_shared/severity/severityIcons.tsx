import type { ComponentType, ReactNode, SVGProps } from 'react';
import type { Severity } from './severity.types.js';

/**
 * Default severity icons — inline stroke SVG, no runtime icon dep.
 *
 * Convention copied from `Calendar` / `Autocomplete` (existing pattern
 * in the lib): icons live INLINE inside the component module, never as
 * imports from an external icon library. The "no icons in the library"
 * principle means **no external icon package** (`lucide-react`,
 * `phosphor-icons`, etc.) — small file-local SVG functions are
 * allowed and already used.
 *
 * All icons:
 *   - 20×20 viewBox (5:1 ratio of intrinsic size to body text-sm)
 *   - `stroke="currentColor"` — colored via the parent's
 *     `text-<severity>-600` class through the severity matrix
 *   - `fill="none"` — outline style, matches Tabler / Heroicons /
 *     Phosphor-outline conventions, low visual weight
 *   - `aria-hidden="true"` — the message text carries the semantic;
 *     the icon is decorative reinforcement, not the announcement
 */

type IconProps = SVGProps<SVGSVGElement>;

const BASE_PROPS: IconProps = {
  width: '1.25em',
  height: '1.25em',
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
};

function InfoIcon(props: IconProps) {
  return (
    <svg {...BASE_PROPS} {...props}>
      <circle cx="10" cy="10" r="8.25" />
      <path d="M10 6.5h.01M10 9.5v4" />
    </svg>
  );
}

function SuccessIcon(props: IconProps) {
  return (
    <svg {...BASE_PROPS} {...props}>
      <circle cx="10" cy="10" r="8.25" />
      <path d="m6.5 10 2.5 2.5 4.5-5" />
    </svg>
  );
}

function WarningIcon(props: IconProps) {
  return (
    <svg {...BASE_PROPS} {...props}>
      <path d="M10 2.5 18 17H2L10 2.5Z" />
      <path d="M10 8v3.5M10 14.5h.01" />
    </svg>
  );
}

function DangerIcon(props: IconProps) {
  return (
    <svg {...BASE_PROPS} {...props}>
      <circle cx="10" cy="10" r="8.25" />
      <path d="m7 7 6 6M13 7l-6 6" />
    </svg>
  );
}

/**
 * Map of severity → default Icon component. Used by Alert (and
 * eventually Snackbar / Banner / etc.) to render the per-severity
 * default when the consumer doesn't pass a custom `icon` prop and
 * doesn't opt-out with `icon={false}`.
 */
export const SEVERITY_DEFAULT_ICON: Record<Severity, ComponentType<IconProps>> = {
  info: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  danger: DangerIcon,
};

/**
 * Convenience helper — render the default icon for a severity as a
 * `ReactNode`, ready to inject into a JSX slot.
 *
 * @example
 * <span className={severityClasses.icon}>
 *   {getDefaultSeverityIcon('warning')}
 * </span>
 */
export function getDefaultSeverityIcon(severity: Severity): ReactNode {
  const Icon = SEVERITY_DEFAULT_ICON[severity];
  return <Icon />;
}

// Re-export individual icons for cases where a consumer wants the same
// glyph in a custom context (e.g. inline in a paragraph). Not part of
// the public `@dashforge/tw` barrel — internal use only.
export { InfoIcon, SuccessIcon, WarningIcon, DangerIcon };
