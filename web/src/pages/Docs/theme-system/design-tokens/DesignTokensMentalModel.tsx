import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Mental Model section - Teaching correct semantic thinking
 */
export function DesignTokensMentalModel() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={4} id="mental-model">
      <Stack spacing={2}>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: 28, md: 36 },
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
          }}
        >
          Mental Model
        </Typography>
      </Stack>

      {/* Core Message */}
      <Box
        sx={{
          p: 4,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(139,92,246,0.10)' : 'rgba(139,92,246,0.06)',
          border: isDark
            ? '2px solid rgba(139,92,246,0.30)'
            : '2px solid rgba(139,92,246,0.20)',
        }}
      >
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 700,
            lineHeight: 1.4,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            textAlign: 'center',
          }}
        >
          You are not choosing colors. You are defining meaning.
        </Typography>
      </Box>

      {/* Strong Statement */}
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(239,68,68,0.10)' : 'rgba(239,68,68,0.06)',
          border: isDark
            ? '2px solid rgba(239,68,68,0.30)'
            : '2px solid rgba(239,68,68,0.20)',
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
          ⚠️ If you treat tokens like colors, you are using Dashforge wrong.
        </Typography>
      </Box>

      {/* Three Rules */}
      <Stack spacing={3}>
        <Typography
          sx={{
            fontSize: 17,
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          Three Rules for Success
        </Typography>

        <Stack spacing={2}>
          {[
            {
              number: '1',
              title: 'Define meaning, not appearance',
              description:
                'Tokens express semantic intent (primary = "brand action"), not visual properties.',
            },
            {
              number: '2',
              title: 'One token should affect many components',
              description:
                'Changing primary updates buttons, links, focus states, checkboxes—everywhere.',
            },
            {
              number: '3',
              title: 'Meaning stays stable even if appearance changes',
              description:
                'Success can be green in default theme, blue in color-blind mode. The meaning never changes.',
            },
          ].map((rule) => (
            <Box
              key={rule.number}
              sx={{
                p: 2.5,
                borderRadius: 1.5,
                bgcolor: isDark ? 'rgba(0,0,0,0.20)' : 'rgba(248,250,252,0.80)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.08)',
              }}
            >
              <Stack direction="row" spacing={2}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: isDark
                      ? 'rgba(139,92,246,0.20)'
                      : 'rgba(139,92,246,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: isDark ? '#a78bfa' : '#7c3aed',
                    }}
                  >
                    {rule.number}
                  </Typography>
                </Box>
                <Stack spacing={0.5}>
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: isDark
                        ? 'rgba(255,255,255,0.90)'
                        : 'rgba(15,23,42,0.90)',
                    }}
                  >
                    {rule.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: isDark
                        ? 'rgba(255,255,255,0.65)'
                        : 'rgba(15,23,42,0.65)',
                    }}
                  >
                    {rule.description}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Stack>

      {/* WRONG vs CORRECT Example */}
      <Stack spacing={2}>
        <Typography
          sx={{
            fontSize: 17,
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          Example: WRONG vs CORRECT
        </Typography>

        <Box
          component="pre"
          sx={{
            m: 0,
            p: 2.5,
            borderRadius: 1.5,
            fontSize: 13,
            lineHeight: 1.7,
            fontFamily: '"Fira Code", "SF Mono", Menlo, monospace',
            color: isDark ? '#e5e7eb' : '#1f2937',
            bgcolor: isDark ? 'rgba(0,0,0,0.30)' : 'rgba(248,250,252,0.80)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15,23,42,0.08)',
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: 6,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: isDark
                ? 'rgba(255,255,255,0.15)'
                : 'rgba(15,23,42,0.20)',
              borderRadius: 1,
            },
          }}
        >
          {`// ❌ WRONG: Treating tokens like colors
<Button sx={{ bgcolor: '#7c3aed' }}>Click</Button>

// ✅ CORRECT: Using semantic intent
const theme = createDashTheme({
  color: { intent: { primary: '#7c3aed' } }
});
<Button color="primary">Click</Button>`}
        </Box>
      </Stack>
    </Stack>
  );
}
