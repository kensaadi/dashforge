import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Why This Matters section - Product value proposition
 */
export function DesignTokensWhy() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const valueCards = [
    {
      title: 'Consistency at Scale',
      description:
        'Change one token and update your entire UI consistently. No scattered values, no broken designs.',
    },
    {
      title: 'Faster Product Iteration',
      description:
        'Rebrand, theme, or adjust system colors without rewriting components. Ship faster.',
    },
    {
      title: 'Multi-Brand Ready',
      description:
        'Use the same codebase with different tenant identities. White-label at scale.',
    },
  ];

  return (
    <Stack spacing={4} id="why">
      <Stack spacing={2}>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: 28, md: 36 },
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
          }}
        >
          Why This Matters
        </Typography>
        <Typography
          sx={{
            fontSize: 15,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            maxWidth: 680,
          }}
        >
          Design tokens solve three critical problems in product development
        </Typography>
      </Stack>

      {/* Problem vs Solution Comparison */}
      <Grid container spacing={3}>
        {/* LEFT: Problem (Red/Negative) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              bgcolor: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.05)',
              border: '2px solid',
              borderColor: isDark
                ? 'rgba(239,68,68,0.3)'
                : 'rgba(239,68,68,0.25)',
            }}
          >
            <Stack spacing={2.5}>
              <Typography
                sx={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: isDark ? '#fca5a5' : '#dc2626',
                }}
              >
                Without Design Tokens
              </Typography>
              <Stack spacing={1.5} component="ul" sx={{ m: 0, pl: 2.5 }}>
                <Typography
                  component="li"
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.75)'
                      : 'rgba(15,23,42,0.75)',
                  }}
                >
                  Inconsistent UI
                </Typography>
                <Typography
                  component="li"
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.75)'
                      : 'rgba(15,23,42,0.75)',
                  }}
                >
                  Hardcoded colors everywhere
                </Typography>
                <Typography
                  component="li"
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.75)'
                      : 'rgba(15,23,42,0.75)',
                  }}
                >
                  Theme changes are slow and error-prone
                </Typography>
                <Typography
                  component="li"
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.75)'
                      : 'rgba(15,23,42,0.75)',
                  }}
                >
                  No scalable branding
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Grid>

        {/* RIGHT: Solution (Green/Positive) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              bgcolor: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.05)',
              border: '2px solid',
              borderColor: isDark
                ? 'rgba(34,197,94,0.3)'
                : 'rgba(34,197,94,0.25)',
            }}
          >
            <Stack spacing={2.5}>
              <Typography
                sx={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: isDark ? '#86efac' : '#16a34a',
                }}
              >
                With Design Tokens
              </Typography>
              <Stack spacing={1.5} component="ul" sx={{ m: 0, pl: 2.5 }}>
                <Typography
                  component="li"
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.75)'
                      : 'rgba(15,23,42,0.75)',
                  }}
                >
                  Consistent UI across the entire app
                </Typography>
                <Typography
                  component="li"
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.75)'
                      : 'rgba(15,23,42,0.75)',
                  }}
                >
                  Centralized semantic control
                </Typography>
                <Typography
                  component="li"
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.75)'
                      : 'rgba(15,23,42,0.75)',
                  }}
                >
                  Instant global updates
                </Typography>
                <Typography
                  component="li"
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.75)'
                      : 'rgba(15,23,42,0.75)',
                  }}
                >
                  Multi-tenant ready
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Grid>
      </Grid>

      {/* Value Cards Grid */}
      <Grid container spacing={3}>
        {valueCards.map((card, index) => (
          <Grid key={card.title} size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 2,
                bgcolor: isDark
                  ? 'rgba(139,92,246,0.06)'
                  : 'rgba(139,92,246,0.04)',
                border: isDark
                  ? '1px solid rgba(139,92,246,0.20)'
                  : '1px solid rgba(139,92,246,0.15)',
              }}
            >
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: isDark
                      ? 'rgba(139,92,246,0.15)'
                      : 'rgba(139,92,246,0.10)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: isDark ? '#a78bfa' : '#7c3aed',
                    }}
                  >
                    {index + 1}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: isDark
                      ? 'rgba(255,255,255,0.90)'
                      : 'rgba(15,23,42,0.90)',
                  }}
                >
                  {card.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  {card.description}
                </Typography>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Strong Bottom Callout */}
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(139,92,246,0.10)' : 'rgba(139,92,246,0.06)',
          border: isDark
            ? '2px solid rgba(139,92,246,0.30)'
            : '2px solid rgba(139,92,246,0.20)',
        }}
      >
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
          }}
        >
          Design tokens are not a styling convenience. They are the foundation
          of a scalable UI system.
        </Typography>
      </Box>
    </Stack>
  );
}
