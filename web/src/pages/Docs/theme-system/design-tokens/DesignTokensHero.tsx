import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Hero section for Design Tokens documentation page
 * Positions tokens as a semantic design system
 */
export function DesignTokensHero() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={3}>
      <Chip
        label="Semantic System"
        size="small"
        sx={{
          alignSelf: 'flex-start',
          bgcolor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.10)',
          color: isDark ? '#a78bfa' : '#7c3aed',
          border: isDark
            ? '1px solid rgba(139,92,246,0.30)'
            : '1px solid rgba(139,92,246,0.25)',
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      />

      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: 40, md: 56 },
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          color: isDark ? '#ffffff' : '#0f172a',
          background: isDark
            ? 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #7c3aed 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Design Tokens
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontSize: 19,
          lineHeight: 1.6,
          color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
          maxWidth: 680,
        }}
      >
        Define your application's visual language through semantic design
        tokens. Change primary once, see it reflected everywhere.
      </Typography>
    </Stack>
  );
}
