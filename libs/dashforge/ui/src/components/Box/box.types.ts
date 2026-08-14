import type { BoxProps as MuiBoxProps } from '@mui/material/Box';
import type { AccessRequirement } from '@dashforge/rbac';
import type { Engine } from '@dashforge/ui-core';

/**
 * Props for the Dashforge MUI `<Box>` — a thin, gating-aware override of
 * MUI's `Box`. Every native `Box` prop (`component`, `sx`, `display`,
 * spacing shorthands, …) is forwarded unchanged; the wrapper only adds
 * `access` and `visibleWhen`, so it can be dropped in wherever a plain
 * MUI `Box` is used.
 *
 * @example
 * ```tsx
 * // Hidden unless the current user may read the audit resource
 * <Box access={{ resource: 'audit', action: 'read', onUnauthorized: 'hide' }}>
 *   <AuditTrail />
 * </Box>
 * ```
 */
export interface BoxProps extends MuiBoxProps {
  /**
   * RBAC access requirement for the whole region. When the current user
   * is unauthorized: `onUnauthorized: 'hide'` → the box does not render;
   * `'disable'` / `'readonly'` → it renders dimmed and non-interactive
   * (a layout container has no intrinsic disabled state). Resolved
   * against the nearest `RbacProvider`.
   */
  access?: AccessRequirement;

  /**
   * Reactive visibility predicate evaluated against the form engine — the
   * box renders only when it returns `true` (e.g. reveal a section once a
   * field has a value). No-op outside a `<DashForm>`.
   */
  visibleWhen?: (engine: Engine) => boolean;
}
