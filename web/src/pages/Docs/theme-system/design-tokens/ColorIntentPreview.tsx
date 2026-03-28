import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Visual preview for Color Intent tokens
 * Shows color swatches for all semantic intent colors
 */
export function ColorIntentPreview() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        flexWrap: 'wrap',
        mb: 3,
        p: 2.5,
        borderRadius: 1.5,
        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {[
        { name: 'primary', color: dashTheme.color.intent.primary },
        { name: 'secondary', color: dashTheme.color.intent.secondary },
        { name: 'success', color: dashTheme.color.intent.success },
        { name: 'warning', color: dashTheme.color.intent.warning },
        { name: 'danger', color: dashTheme.color.intent.danger },
        { name: 'info', color: dashTheme.color.intent.info },
      ].map((intent) => (
        <Box
          key={intent.name}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.75,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 1,
              bgcolor: intent.color,
              border: '1px solid',
              borderColor: isDark
                ? 'rgba(255,255,255,0.15)'
                : 'rgba(0,0,0,0.1)',
              boxShadow: isDark
                ? '0 2px 8px rgba(0,0,0,0.3)'
                : '0 2px 8px rgba(0,0,0,0.08)',
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
            {intent.name}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
