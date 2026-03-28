import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Visual preview for Text tokens
 * Shows text samples in different hierarchy levels
 */
export function TextTokensPreview() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      sx={{
        mb: 3,
        p: 3,
        borderRadius: 1.5,
        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack spacing={2}>
        {[
          { name: 'primary', color: dashTheme.color.text.primary },
          { name: 'secondary', color: dashTheme.color.text.secondary },
          { name: 'muted', color: dashTheme.color.text.muted },
        ].map((text) => (
          <Box key={text.name}>
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.6,
                color: text.color,
              }}
            >
              The quick brown fox jumps over the lazy dog
              <Typography
                component="span"
                sx={{
                  ml: 1.5,
                  fontFamily: 'Fira Code, monospace',
                  fontSize: 11,
                  color: isDark
                    ? 'rgba(255,255,255,0.4)'
                    : 'rgba(15,23,42,0.4)',
                }}
              >
                {text.name}
              </Typography>
            </Typography>
          </Box>
        ))}
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: dashTheme.color.intent.primary,
          }}
        >
          <Typography
            sx={{
              fontSize: 15,
              lineHeight: 1.6,
              color: dashTheme.color.text.inverse,
            }}
          >
            The quick brown fox jumps over the lazy dog
            <Typography
              component="span"
              sx={{
                ml: 1.5,
                fontFamily: 'Fira Code, monospace',
                fontSize: 11,
                opacity: 0.7,
              }}
            >
              inverse
            </Typography>
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
