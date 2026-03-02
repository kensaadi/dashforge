import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useDashTheme } from '@dashforge/theme-core';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  maxWidth?: number | string;
};

export function SectionHeader({
  title,
  subtitle,
  align = 'left',
  maxWidth,
}: SectionHeaderProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack
      spacing={0.75}
      alignItems={align === 'center' ? 'center' : 'flex-start'}
      sx={{
        textAlign: align,
        ...(maxWidth && { maxWidth }),
      }}
    >
      <Typography
        component="h2"
        sx={{
          fontSize: { xs: 20, md: 22 },
          fontWeight: 950,
          letterSpacing: '-0.02em',
          color: isDark ? 'rgba(255,255,255,0.88)' : 'rgba(15,23,42,0.88)',
        }}
      >
        {title}
      </Typography>

      {subtitle && (
        <Typography
          sx={{
            fontSize: 14,
            lineHeight: 1.6,
            fontWeight: 400,
            color: isDark ? 'rgba(255,255,255,0.62)' : 'rgba(15,23,42,0.62)',
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Stack>
  );
}
