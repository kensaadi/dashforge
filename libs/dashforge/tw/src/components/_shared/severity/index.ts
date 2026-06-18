/**
 * `_shared/severity/` — foundation for every severity-aware
 * component in `@dashforge/tw` (Alert, refactored Snackbar, future
 * Banner / status indicators).
 *
 * Centralising:
 *   - the `Severity` and `SeverityVariant` taxonomies (mirror MUI;
 *     `danger` not `error` for token alignment)
 *   - the 3×4 token-driven color matrix (token-resolved, no hardcoded
 *     hex, no `dark:` variants on neutral)
 *   - the default per-severity inline SVG icons (`icon={false}` opt-out
 *     supported on consumer components)
 *   - the ARIA role helper (`alert` vs `status`)
 *
 * Consumers (Alert, Snackbar) import from this barrel — never reach
 * into the individual files.
 */

export type {
  Severity,
  SeverityClasses,
  SeverityVariant,
} from './severity.types.js';

export {
  getSeverityClasses,
  getSeverityRole,
} from './severityVariants.js';

export {
  SEVERITY_DEFAULT_ICON,
  getDefaultSeverityIcon,
} from './severityIcons.js';
