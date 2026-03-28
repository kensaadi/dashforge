import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsCodeBlock } from '../shared/CodeBlock';

/**
 * Quick Start section for Snackbar
 * Shows minimal setup and basic usage
 */
export function SnackbarQuickStart() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      id="quick-start"
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: isDark ? 'rgba(251,191,36,0.06)' : 'rgba(251,191,36,0.04)',
        border: isDark
          ? '1px solid rgba(251,191,36,0.20)'
          : '1px solid rgba(251,191,36,0.15)',
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              color: isDark ? '#fbbf24' : '#f59e0b',
            }}
          >
            Quick Start
          </Typography>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.10)',
              border: isDark
                ? '1px solid rgba(34,197,94,0.30)'
                : '1px solid rgba(34,197,94,0.25)',
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: isDark ? '#86efac' : '#16a34a',
              }}
            >
              2 Steps
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={2}>
          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(15,23,42,0.85)',
                mb: 1,
              }}
            >
              Step 1: Wrap your app with the provider
            </Typography>
            <DocsCodeBlock
              code={`import { SnackbarProvider } from '@dashforge/ui';

<SnackbarProvider>
  <App />
</SnackbarProvider>`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(15,23,42,0.85)',
                mb: 1,
              }}
            >
              Step 2: Use the hook to show notifications
            </Typography>
            <DocsCodeBlock
              code={`import { useSnackbar } from '@dashforge/ui';

const { success } = useSnackbar();

success('Saved successfully');`}
              language="tsx"
            />
          </Box>
        </Stack>

        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(59,130,246,0.10)' : 'rgba(59,130,246,0.08)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.25)'
              : '1px solid rgba(59,130,246,0.20)',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 700,
                color: isDark ? '#60a5fa' : '#2563eb',
              }}
            >
              ℹ️
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                lineHeight: 1.6,
                color: isDark
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(15,23,42,0.85)',
              }}
            >
              The snackbar is rendered automatically by the provider. No
              component needs to be added to your UI.
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
