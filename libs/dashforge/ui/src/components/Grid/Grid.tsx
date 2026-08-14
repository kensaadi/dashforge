import MuiGrid from '@mui/material/Grid';
import { useGating, gatedSx } from '../../hooks/useGating';
import type { GridProps } from './grid.types';

/**
 * Dashforge MUI `<Grid>` — MUI's `Grid` with the same visibility + RBAC
 * gating the form components use. A drop-in override: every native `Grid`
 * prop is forwarded (`container`, `size`, `offset`, `spacing`, …), and two
 * props are added:
 *
 * - **`access`** — RBAC gate. `hide` removes the node; `disable` /
 *   `readonly` render it dimmed and non-interactive.
 * - **`visibleWhen`** — engine-reactive visibility inside a `<DashForm>`.
 *
 * With neither prop it behaves exactly like MUI's `Grid`, so it works as a
 * container or an item.
 *
 * The MUI-flavoured twin of `@dashforge/tw`'s `<Grid>`.
 *
 * @example
 * ```tsx
 * <Grid container spacing={2}>
 *   <Grid size={{ xs: 12, md: 6 }}><MetricCard /></Grid>
 * </Grid>
 * ```
 */
export function Grid(props: GridProps) {
  const { access, visibleWhen, sx, ...rest } = props;
  const { hidden, dimmed } = useGating(access, visibleWhen);

  if (hidden) return null;

  return (
    <MuiGrid {...rest} aria-disabled={dimmed || undefined} sx={gatedSx(dimmed, sx)} />
  );
}
