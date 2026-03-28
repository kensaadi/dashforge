import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

type CalloutType = 'success' | 'info' | 'warning' | 'error';

interface CalloutConfig {
  icon: string;
  bgColor: { dark: string; light: string };
  borderColor: { dark: string; light: string };
  iconColor: { dark: string; light: string };
}

const calloutStyles: Record<CalloutType, CalloutConfig> = {
  success: {
    icon: '✓',
    bgColor: {
      dark: 'rgba(34,197,94,0.10)',
      light: 'rgba(34,197,94,0.08)',
    },
    borderColor: {
      dark: 'rgba(34,197,94,0.25)',
      light: 'rgba(34,197,94,0.20)',
    },
    iconColor: {
      dark: '#86efac',
      light: '#16a34a',
    },
  },
  info: {
    icon: 'ℹ️',
    bgColor: {
      dark: 'rgba(59,130,246,0.10)',
      light: 'rgba(59,130,246,0.08)',
    },
    borderColor: {
      dark: 'rgba(59,130,246,0.25)',
      light: 'rgba(59,130,246,0.20)',
    },
    iconColor: {
      dark: '#60a5fa',
      light: '#2563eb',
    },
  },
  warning: {
    icon: '⚠️',
    bgColor: {
      dark: 'rgba(251,191,36,0.10)',
      light: 'rgba(251,191,36,0.08)',
    },
    borderColor: {
      dark: 'rgba(251,191,36,0.25)',
      light: 'rgba(251,191,36,0.20)',
    },
    iconColor: {
      dark: '#fbbf24',
      light: '#f59e0b',
    },
  },
  error: {
    icon: '✕',
    bgColor: {
      dark: 'rgba(239,68,68,0.10)',
      light: 'rgba(239,68,68,0.08)',
    },
    borderColor: {
      dark: 'rgba(239,68,68,0.25)',
      light: 'rgba(239,68,68,0.20)',
    },
    iconColor: {
      dark: '#f87171',
      light: '#dc2626',
    },
  },
};

interface DocsCalloutBoxProps {
  /**
   * Callout type determines styling and default icon
   */
  type: CalloutType;

  /**
   * Callout message (can be string or React node)
   */
  message: string | React.ReactNode;

  /**
   * Optional custom icon (overrides default type icon)
   */
  icon?: string;

  /**
   * Optional title displayed above message
   */
  title?: string;
}

/**
 * Callout box for docs pages
 * Used for tips, warnings, info boxes, etc.
 */
export function DocsCalloutBox({
  type,
  message,
  icon,
  title,
}: DocsCalloutBoxProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const config = calloutStyles[type];
  const displayIcon = icon ?? config.icon;

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 1.5,
        bgcolor: isDark ? config.bgColor.dark : config.bgColor.light,
        border: `1px solid ${
          isDark ? config.borderColor.dark : config.borderColor.light
        }`,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 700,
            color: isDark ? config.iconColor.dark : config.iconColor.light,
          }}
        >
          {displayIcon}
        </Typography>
        <Box sx={{ flex: 1 }}>
          {title && (
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
          )}
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
            }}
          >
            {message}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
