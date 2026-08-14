import type { StackProps as MuiStackProps } from '@mui/material/Stack';
import type { AccessRequirement } from '@dashforge/rbac';
import type { Engine } from '@dashforge/ui-core';

/**
 * Props for the Dashforge MUI `<Stack>` — a thin, gating-aware override
 * of MUI's `Stack`. Every native `Stack` prop (`direction`, `spacing`,
 * `divider`, `alignItems`, `sx`, …) is forwarded unchanged; the wrapper
 * only adds `access` and `visibleWhen`.
 *
 * @example
 * ```tsx
 * <Stack direction="row" spacing={2} visibleWhen={(e) => !!e.getValue('advanced')}>
 *   <AdvancedControls />
 * </Stack>
 * ```
 */
export interface StackProps extends MuiStackProps {
  /**
   * RBAC access requirement for the whole stack. When the current user
   * is unauthorized: `onUnauthorized: 'hide'` → the stack does not
   * render; `'disable'` / `'readonly'` → it renders dimmed and
   * non-interactive. Resolved against the nearest `RbacProvider`.
   */
  access?: AccessRequirement;

  /**
   * Reactive visibility predicate evaluated against the form engine — the
   * stack renders only when it returns `true`. No-op outside a
   * `<DashForm>`.
   */
  visibleWhen?: (engine: Engine) => boolean;
}
