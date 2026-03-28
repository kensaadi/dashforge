import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsCodeBlock } from '../../components/shared/CodeBlock';

/**
 * Quick Start section - minimal token override example
 */
export function DesignTokensQuickStart() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      id="quick-start"
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.04)',
        border: isDark
          ? '1px solid rgba(139,92,246,0.20)'
          : '1px solid rgba(139,92,246,0.15)',
      }}
    >
      <Stack spacing={2}>
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
              color: isDark ? '#a78bfa' : '#7c3aed',
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
              Copy & Paste
            </Typography>
          </Box>
        </Stack>

        <DocsCodeBlock
          code={`import { createDashTheme } from './createDashTheme';
import { createMuiThemeFromDashTheme } from '@dashforge/theme-mui';

const myTheme = createDashTheme({
  color: {
    intent: {
      primary: '#7c3aed',  // Brand purple
      success: '#059669',  // Emerald green
    },
  },
});

const muiTheme = createMuiThemeFromDashTheme(myTheme);`}
          language="tsx"
        />

        <Typography
          sx={{
            fontSize: 14,
            color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(15,23,42,0.60)',
          }}
        >
          Override 2 tokens → 10+ components update instantly
        </Typography>
      </Stack>
    </Box>
  );
}
