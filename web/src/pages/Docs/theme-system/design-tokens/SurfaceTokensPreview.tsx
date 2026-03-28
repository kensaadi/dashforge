import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Visual preview for Surface tokens
 * Shows layered cards demonstrating elevation hierarchy
 */
export function SurfaceTokensPreview() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        mb: 3,
        p: 3,
        borderRadius: 1.5,
        bgcolor: dashTheme.color.surface.canvas,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {[
        { name: 'canvas', color: dashTheme.color.surface.canvas, z: 0 },
        { name: 'elevated', color: dashTheme.color.surface.elevated, z: 1 },
        { name: 'overlay', color: dashTheme.color.surface.overlay, z: 2 },
      ].map((surface) => (
        <Box
          key={surface.name}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 80,
              borderRadius: 1.5,
              bgcolor: surface.color,
              border: '1px solid',
              borderColor: isDark
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow:
                surface.z === 0
                  ? 'none'
                  : surface.z === 1
                  ? isDark
                    ? '0 2px 8px rgba(0,0,0,0.4)'
                    : '0 2px 8px rgba(0,0,0,0.08)'
                  : isDark
                  ? '0 8px 24px rgba(0,0,0,0.5)'
                  : '0 8px 24px rgba(0,0,0,0.12)',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: 10,
                fontWeight: 600,
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)',
                textTransform: 'uppercase',
              }}
            >
              z-{surface.z}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'Fira Code, monospace',
              fontSize: 11,
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
              textAlign: 'center',
            }}
          >
            {surface.name}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
