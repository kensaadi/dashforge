import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Common Mistakes & Best Practices section
 */
export function DesignTokensNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const mistakes = [
    {
      icon: '❌',
      title: 'Using primary for everything',
      description:
        'Reserve primary for brand identity and main actions. Using it everywhere destroys semantic hierarchy and makes your UI look like one big call-to-action.',
      type: 'mistake' as const,
    },
    {
      icon: '❌',
      title: 'Hardcoding colors in components',
      description:
        'Hardcoded colors break system consistency. Every hardcoded value is a future bug when you need to rebrand or support dark mode.',
      type: 'mistake' as const,
    },
    {
      icon: '❌',
      title: 'Overriding MUI theme directly',
      description:
        'Bypassing the Dashforge adapter breaks the semantic layer. Always use createDashTheme() + createMuiThemeFromDashTheme().',
      type: 'mistake' as const,
    },
    {
      icon: '❌',
      title: 'Treating tokens as design variables',
      description:
        'Tokens are not CSS variables you tweak for aesthetics. They represent meaning. Choose tokens based on intent, not appearance.',
      type: 'mistake' as const,
    },
    {
      icon: '✅',
      title: 'Thinking in intent, not appearance',
      description:
        'Ask "what does this UI element mean?" not "what color looks good?". Success means positive outcome. Danger means destructive action. Primary means brand identity.',
      type: 'practice' as const,
    },
  ];

  return (
    <Stack spacing={4} id="notes">
      <Stack spacing={2}>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: 28, md: 36 },
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
          }}
        >
          Common Mistakes & Best Practices
        </Typography>
        <Typography
          sx={{
            fontSize: 15,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            maxWidth: 680,
          }}
        >
          Learn what NOT to do. These mistakes break the semantic system.
        </Typography>
      </Stack>

      {/* Mistake & Practice Cards */}
      <Grid container spacing={3}>
        {mistakes.map((item) => (
          <Grid key={item.title} size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 2,
                bgcolor:
                  item.type === 'mistake'
                    ? isDark
                      ? 'rgba(239,68,68,0.06)'
                      : 'rgba(239,68,68,0.04)'
                    : isDark
                    ? 'rgba(34,197,94,0.06)'
                    : 'rgba(34,197,94,0.04)',
                border: '1px solid',
                borderColor:
                  item.type === 'mistake'
                    ? isDark
                      ? 'rgba(239,68,68,0.20)'
                      : 'rgba(239,68,68,0.15)'
                    : isDark
                    ? 'rgba(34,197,94,0.20)'
                    : 'rgba(34,197,94,0.15)',
              }}
            >
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontSize: 20 }}>{item.icon}</Typography>
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 700,
                      color:
                        item.type === 'mistake'
                          ? isDark
                            ? '#fca5a5'
                            : '#dc2626'
                          : isDark
                          ? '#86efac'
                          : '#16a34a',
                    }}
                  >
                    {item.title}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  {item.description}
                </Typography>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Bottom Note */}
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
            mb: 1,
          }}
        >
          When NOT to use tokens
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            lineHeight: 1.6,
          }}
        >
          Tokens are for system-level decisions. If you need a one-off color for
          a specific component (like a logo or illustration), use inline styles.
          Do not pollute the token system with component-specific values.
        </Typography>
      </Box>
    </Stack>
  );
}
