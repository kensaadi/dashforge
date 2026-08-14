import MuiBox from '@mui/material/Box';
import { useGating, gatedSx } from '../../hooks/useGating';
import type { BoxProps } from './box.types';

/**
 * Dashforge MUI `<Box>` — MUI's `Box` with the same visibility + RBAC
 * gating the form components use. A drop-in override: every native `Box`
 * prop is forwarded, and two props are added:
 *
 * - **`access`** — RBAC gate. `hide` removes the region; `disable` /
 *   `readonly` render it dimmed and non-interactive.
 * - **`visibleWhen`** — engine-reactive visibility inside a `<DashForm>`.
 *
 * With neither prop it behaves exactly like MUI's `Box`.
 *
 * The MUI-flavoured twin of `@dashforge/tw`'s `<Box>`.
 *
 * @example
 * ```tsx
 * <Box sx={{ p: 2 }} access={{ resource: 'billing', action: 'read', onUnauthorized: 'hide' }}>
 *   <Invoice />
 * </Box>
 * ```
 */
export function Box(props: BoxProps) {
  const { access, visibleWhen, sx, ...rest } = props;
  const { hidden, dimmed } = useGating(access, visibleWhen);

  if (hidden) return null;

  return (
    <MuiBox {...rest} aria-disabled={dimmed || undefined} sx={gatedSx(dimmed, sx)} />
  );
}
