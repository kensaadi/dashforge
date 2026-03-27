import { useState, useMemo } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { ThemeProvider } from '@mui/material/styles';
import { useDashTheme } from '@dashforge/theme-core';
import { createMuiThemeFromDashTheme } from '@dashforge/theme-mui';
import { createDashTheme } from '../createDashTheme';

/**
 * CRITICAL: Live interactive demo showing one token affecting multiple components
 * This is the proof that tokens control the UI system
 */
export function TokenLiveDemo() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const [primaryColor, setPrimaryColor] = useState('#2563EB');

  const customTheme = useMemo(
    () =>
      createDashTheme({
        color: {
          intent: {
            primary: primaryColor,
          },
        },
      }),
    [primaryColor]
  );

  const muiTheme = useMemo(
    () => createMuiThemeFromDashTheme(customTheme),
    [customTheme]
  );

  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          Live Token Demo
        </Typography>
        <Typography
          sx={{
            fontSize: 15,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
          }}
        >
          This is proof that tokens control the UI system. Change the primary
          token below and watch multiple components update consistently.
        </Typography>
      </Stack>

      {/* Color Picker */}
      <Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Primary Token:
          </Typography>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            style={{
              width: 60,
              height: 36,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          />
          <Typography
            sx={{
              fontFamily: '"Fira Code", monospace',
              fontSize: 14,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            {primaryColor}
          </Typography>
        </Stack>
      </Box>

      {/* Live Component Preview */}
      <ThemeProvider theme={muiTheme}>
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(0,0,0,0.20)' : 'rgba(248,250,252,0.80)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15,23,42,0.08)',
          }}
        >
          <Stack spacing={2}>
            <Button variant="contained" color="primary" fullWidth>
              Primary Button
            </Button>
            <Button variant="outlined" color="primary" fullWidth>
              Outlined Button
            </Button>
            <Alert severity="info">
              This info alert uses the primary token for its color
            </Alert>
          </Stack>
        </Box>
      </ThemeProvider>

      {/* Validation Message */}
      <Box
        sx={{
          p: 2,
          borderRadius: 1.5,
          bgcolor: isDark ? 'rgba(34,197,94,0.10)' : 'rgba(34,197,94,0.08)',
          border: isDark
            ? '1px solid rgba(34,197,94,0.25)'
            : '1px solid rgba(34,197,94,0.20)',
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: isDark ? '#86efac' : '#16a34a',
          }}
        >
          ✓ 1 token changed → 3+ components updated instantly
        </Typography>
      </Box>
    </Stack>
  );
}
