import MuiStack from '@mui/material/Stack';
import { useGating, gatedSx } from '../../hooks/useGating';
import type { StackProps } from './stack.types';

/**
 * Dashforge MUI `<Stack>` — MUI's `Stack` with the same visibility + RBAC
 * gating the form components use. A drop-in override: every native `Stack`
 * prop is forwarded, and two props are added:
 *
 * - **`access`** — RBAC gate. `hide` removes the region; `disable` /
 *   `readonly` render it dimmed and non-interactive.
 * - **`visibleWhen`** — engine-reactive visibility inside a `<DashForm>`.
 *
 * With neither prop it behaves exactly like MUI's `Stack`.
 *
 * The MUI-flavoured twin of `@dashforge/tw`'s `<Stack>`.
 *
 * @example
 * ```tsx
 * <Stack direction="row" spacing={2} alignItems="center">
 *   <Button>Save</Button>
 *   <Button variant="text">Cancel</Button>
 * </Stack>
 * ```
 */
export function Stack(props: StackProps) {
  const { access, visibleWhen, sx, ...rest } = props;
  const { hidden, dimmed } = useGating(access, visibleWhen);

  if (hidden) return null;

  return (
    <MuiStack {...rest} aria-disabled={dimmed || undefined} sx={gatedSx(dimmed, sx)} />
  );
}
