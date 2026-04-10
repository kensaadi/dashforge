import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  IconUserPlus,
  IconDashboard,
  IconShoppingCart,
  IconBuilding,
} from '@tabler/icons-react';
import { useDashTheme } from '@dashforge/theme-core';
import type { StarterKit } from '../data/starterKits';

interface StarterKitHeroProps {
  kit: StarterKit;
}

const iconComponents = {
  IconUserPlus,
  IconDashboard,
  IconShoppingCart,
  IconBuilding,
};

const iconGradients = {
  purple: 'linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)',
  blue: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
  green: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
  orange: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
};

export function StarterKitHero({ kit }: StarterKitHeroProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const IconComponent = iconComponents[kit.icon as keyof typeof iconComponents];

  return (
    <Box
      sx={{
        bgcolor: isDark ? 'rgba(17,24,39,0.30)' : 'rgba(248,250,252,0.60)',
        borderBottom: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(15,23,42,0.08)',
      }}
    >
      <Container sx={{ py: 6, maxWidth: 1200 }}>
        <Stack spacing={3}>
          {/* Icon and Title Row */}
          <Stack direction="row" alignItems="center" spacing={3}>
            {/* Icon */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2,
                background: iconGradients[kit.iconColor],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {IconComponent && (
                <IconComponent size={48} color="white" stroke={1.5} />
              )}
            </Box>

            {/* Title and Version */}
            <Box>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: 32, md: 36 },
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                  color: isDark ? '#ffffff' : '#0f172a',
                  mb: 1,
                }}
              >
                {kit.name}
              </Typography>
              <Chip
                label={`v${kit.version}`}
                size="small"
                sx={{
                  fontSize: 12,
                  fontWeight: 500,
                  bgcolor: isDark
                    ? 'rgba(255,255,255,0.10)'
                    : 'rgba(15,23,42,0.08)',
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              />
            </Box>
          </Stack>

          {/* Long Description */}
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
              maxWidth: 720,
            }}
          >
            {kit.longDescription}
          </Typography>

          {/* CTA Buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              size="large"
              href={kit.purchaseUrl}
              target="_blank"
              sx={{
                textTransform: 'none',
                fontSize: 15,
                fontWeight: 600,
                px: 4,
                py: 1.5,
                background: iconGradients[kit.iconColor],
                '&:hover': {
                  opacity: 0.9,
                },
              }}
            >
              Buy Now ${kit.price}
            </Button>

            <Button
              variant="outlined"
              size="large"
              href={kit.previewUrl}
              target="_blank"
              sx={{
                textTransform: 'none',
                fontSize: 15,
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderColor: isDark
                  ? 'rgba(255,255,255,0.20)'
                  : 'rgba(15,23,42,0.20)',
                color: isDark
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(15,23,42,0.85)',
                '&:hover': {
                  borderColor: isDark
                    ? 'rgba(167,139,250,0.50)'
                    : 'rgba(109,40,217,0.50)',
                  bgcolor: isDark
                    ? 'rgba(167,139,250,0.08)'
                    : 'rgba(109,40,217,0.08)',
                },
              }}
            >
              Preview Demo
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
