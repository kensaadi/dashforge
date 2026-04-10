import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
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
import { Divider } from '@mui/material';

interface StarterKitCardProps {
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

export function StarterKitCard({ kit }: StarterKitCardProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const IconComponent = iconComponents[kit.icon as keyof typeof iconComponents];

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        bgcolor: 'transparent',
        border: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(15,23,42,0.10)',
        borderRadius: 1,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: isDark
            ? 'rgba(167,139,250,0.30)'
            : 'rgba(109,40,217,0.30)',
          boxShadow: isDark
            ? '0 8px 24px rgba(167,139,250,0.12)'
            : '0 8px 24px rgba(109,40,217,0.12)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Stack spacing={1} sx={{ flexGrow: 1 }}>
        {/* Icon and Title - Inline */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              background: iconGradients[kit.iconColor],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {IconComponent && (
              <IconComponent size={20} color="white" stroke={1.5} />
            )}
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontSize: 17,
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
              lineHeight: 1.3,
            }}
          >
            {kit.name}
          </Typography>
        </Stack>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            fontSize: 13,
            lineHeight: 1.5,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flexGrow: 1,
          }}
        >
          {kit.shortDescription}
        </Typography>

        <Divider />
        {/* Divider */}
        {/* <Box */}
        {/*   sx={{ */}
        {/*     height: 1, */}
        {/*     bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)', */}
        {/*   }} */}
        {/* /> */}

        {/* Price and Buttons */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              background: iconGradients[kit.iconColor],
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ${kit.price}
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              href={kit.previewUrl}
              target="_blank"
              sx={{
                fontSize: 11,
                textTransform: 'none',
                borderColor: isDark
                  ? 'rgba(255,255,255,0.20)'
                  : 'rgba(15,23,42,0.20)',
                color: isDark
                  ? 'rgba(255,255,255,0.75)'
                  : 'rgba(15,23,42,0.75)',
                '&:hover': {
                  borderColor: isDark
                    ? 'rgba(167,139,250,0.50)'
                    : 'rgba(109,40,217,0.50)',
                },
              }}
            >
              Preview
            </Button>

            <Button
              size="small"
              variant="text"
              component={RouterLink}
              to={`/starter-kits/${kit.id}`}
              sx={{
                fontSize: 11,
                textTransform: 'none',
                color: isDark
                  ? 'rgba(167,139,250,0.90)'
                  : 'rgba(109,40,217,0.90)',
                '&:hover': {
                  bgcolor: isDark
                    ? 'rgba(167,139,250,0.08)'
                    : 'rgba(109,40,217,0.08)',
                },
              }}
            >
              Detail
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
