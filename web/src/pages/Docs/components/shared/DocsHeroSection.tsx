import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDashTheme } from '@dashforge/theme-core';

type ThemeColor = 'purple' | 'blue' | 'amber' | 'orange' | 'green' | 'red';

interface ColorGradient {
  dark: string;
  light: string;
}

const gradients: Record<ThemeColor, ColorGradient> = {
  purple: {
    dark: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
    light: 'linear-gradient(135deg, #0f172a 0%, #7c3aed 100%)',
  },
  blue: {
    dark: 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)',
    light: 'linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)',
  },
  amber: {
    dark: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 100%)',
    light: 'linear-gradient(135deg, #0f172a 0%, #f59e0b 100%)',
  },
  orange: {
    dark: 'linear-gradient(135deg, #ffffff 0%, #fb923c 100%)',
    light: 'linear-gradient(135deg, #0f172a 0%, #f97316 100%)',
  },
  green: {
    dark: 'linear-gradient(135deg, #ffffff 0%, #4ade80 100%)',
    light: 'linear-gradient(135deg, #0f172a 0%, #22c55e 100%)',
  },
  red: {
    dark: 'linear-gradient(135deg, #ffffff 0%, #f87171 100%)',
    light: 'linear-gradient(135deg, #0f172a 0%, #ef4444 100%)',
  },
};

interface DocsHeroSectionProps {
  /**
   * Component title displayed in hero
   */
  title: string;

  /**
   * Component description displayed below title
   */
  description: string;

  /**
   * Theme color for gradient
   * @default 'purple'
   */
  themeColor?: ThemeColor;
}

/**
 * Hero section for component docs pages
 * Displays title with gradient and description
 */
export function DocsHeroSection({
  title,
  description,
  themeColor = 'purple',
}: DocsHeroSectionProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const gradient = gradients[themeColor];

  return (
    <Stack spacing={3}>
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: 40, md: 56 },
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          color: isDark ? '#ffffff' : '#0f172a',
          background: isDark ? gradient.dark : gradient.light,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {title}
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
        {description}
      </Typography>
    </Stack>
  );
}
