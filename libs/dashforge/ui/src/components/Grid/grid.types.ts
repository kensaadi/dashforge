import type { GridProps as MuiGridProps } from '@mui/material/Grid';
import type { AccessRequirement } from '@dashforge/rbac';
import type { Engine } from '@dashforge/ui-core';

/**
 * Props for the Dashforge MUI `<Grid>` — a thin, gating-aware override of
 * MUI's `Grid` (the modern CSS-Grid based `Grid`, with `container` /
 * `size` / `offset`). Every native `Grid` prop is forwarded unchanged;
 * the wrapper only adds `access` and `visibleWhen`.
 *
 * @example
 * ```tsx
 * <Grid container spacing={2}>
 *   <Grid size={{ xs: 12, md: 6 }}>
 *     <MetricCard />
 *   </Grid>
 *   <Grid size={{ xs: 12, md: 6 }} access={{ resource: 'revenue', action: 'read', onUnauthorized: 'hide' }}>
 *     <RevenueCard />
 *   </Grid>
 * </Grid>
 * ```
 */
export interface GridProps extends MuiGridProps {
  /**
   * RBAC access requirement for this grid node (container or item). When
   * the current user is unauthorized: `onUnauthorized: 'hide'` → the node
   * does not render; `'disable'` / `'readonly'` → it renders dimmed and
   * non-interactive. Resolved against the nearest `RbacProvider`.
   */
  access?: AccessRequirement;

  /**
   * Reactive visibility predicate evaluated against the form engine — the
   * grid node renders only when it returns `true`. No-op outside a
   * `<DashForm>`.
   */
  visibleWhen?: (engine: Engine) => boolean;
}
