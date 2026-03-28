import Divider from '@mui/material/Divider';
import { useDashTheme } from '@dashforge/theme-core';

interface DocsDividerProps {
  /**
   * Spacing above and below the divider (in MUI spacing units)
   * @default 4
   */
  spacing?: number;
}

/**
 * Standardized divider for docs pages
 * Provides consistent spacing and theme-aware styling
 */
export function DocsDivider({ spacing = 4 }: DocsDividerProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Divider
      sx={{
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
        my: spacing,
      }}
    />
  );
}
