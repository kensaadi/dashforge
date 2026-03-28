import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Visual preview for Radius Scale tokens
 * Shows shapes with varying border radius
 */
export function RadiusScalePreview() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        mb: 3,
        p: 3,
        borderRadius: 1.5,
        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {[
        { name: 'sm', radius: dashTheme.radius.sm, size: 56 },
        { name: 'md', radius: dashTheme.radius.md, size: 64 },
        { name: 'lg', radius: dashTheme.radius.lg, size: 72 },
        { name: 'pill', radius: dashTheme.radius.pill, size: 64 },
      ].map((r) => (
        <Box
          key={r.name}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: r.size,
              height: r.size,
              borderRadius: r.radius,
              bgcolor: isDark
                ? 'rgba(139,92,246,0.15)'
                : 'rgba(139,92,246,0.12)',
              border: '2px solid',
              borderColor: isDark
                ? 'rgba(139,92,246,0.4)'
                : 'rgba(139,92,246,0.3)',
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'Fira Code, monospace',
              fontSize: 11,
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
            }}
          >
            {r.name}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
