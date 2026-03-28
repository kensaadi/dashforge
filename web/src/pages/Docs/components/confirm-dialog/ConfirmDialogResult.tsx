import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsCodeBlock } from '../shared/CodeBlock';

/**
 * Result section for ConfirmDialog
 * Explains semantic result type (KEEP SHORT)
 */
export function ConfirmDialogResult() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={3}>
      <Typography
        variant="body1"
        sx={{
          fontSize: 15,
          lineHeight: 1.75,
          color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
          maxWidth: 720,
        }}
      >
        The confirm function returns a semantic result that explicitly
        distinguishes between user actions and system behavior. Most of the
        time, you only need to check for confirmed status.
      </Typography>

      {/* Primary Pattern - Simple */}
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(34,197,94,0.06)' : 'rgba(34,197,94,0.04)',
          border: isDark
            ? '1px solid rgba(34,197,94,0.15)'
            : '1px solid rgba(34,197,94,0.12)',
        }}
      >
        <Stack spacing={2}>
          <Box>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: isDark ? '#86efac' : '#16a34a',
                mb: 1,
              }}
            >
              Recommended Pattern (90% of cases)
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: 14,
                lineHeight: 1.6,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
                mb: 2,
              }}
            >
              Check for confirmed, abort everything else
            </Typography>
          </Box>

          <DocsCodeBlock
            code={`const result = await confirm({ title: 'Delete?' });

if (result.status === 'confirmed') {
  // User confirmed - proceed
  await performAction();
}
// Everything else = abort (simple!)`}
            language="tsx"
          />
        </Stack>
      </Box>

      {/* Result Types Table */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
            mb: 2,
          }}
        >
          Result Types
        </Typography>

        <Stack spacing={1.5}>
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: isDark
                ? 'rgba(17,24,39,0.35)'
                : 'rgba(248,250,252,0.80)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.06)'
                : '1px solid rgba(15,23,42,0.08)',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: isDark
                    ? 'rgba(34,197,94,0.15)'
                    : 'rgba(34,197,94,0.10)',
                  border: isDark
                    ? '1px solid rgba(34,197,94,0.25)'
                    : '1px solid rgba(34,197,94,0.20)',
                  minWidth: 110,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: isDark ? '#86efac' : '#16a34a',
                  }}
                >
                  confirmed
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                User clicked confirm button
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: isDark
                ? 'rgba(17,24,39,0.35)'
                : 'rgba(248,250,252,0.80)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.06)'
                : '1px solid rgba(15,23,42,0.08)',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: isDark
                    ? 'rgba(251,146,60,0.15)'
                    : 'rgba(251,146,60,0.10)',
                  border: isDark
                    ? '1px solid rgba(251,146,60,0.25)'
                    : '1px solid rgba(251,146,60,0.20)',
                  minWidth: 110,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: isDark ? '#fdba74' : '#ea580c',
                  }}
                >
                  cancelled
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                User cancelled via button, backdrop, or ESC key
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: isDark
                ? 'rgba(17,24,39,0.35)'
                : 'rgba(248,250,252,0.80)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.06)'
                : '1px solid rgba(15,23,42,0.08)',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: isDark
                    ? 'rgba(248,113,113,0.15)'
                    : 'rgba(248,113,113,0.10)',
                  border: isDark
                    ? '1px solid rgba(248,113,113,0.25)'
                    : '1px solid rgba(248,113,113,0.20)',
                  minWidth: 110,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: isDark ? '#fca5a5' : '#dc2626',
                  }}
                >
                  blocked
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                Another dialog is already open (re-entrant call)
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Advanced Pattern - Optional */}
      <Box
        sx={{
          p: 2.5,
          borderRadius: 1.5,
          bgcolor: isDark ? 'rgba(17,24,39,0.35)' : 'rgba(248,250,252,0.80)',
          border: isDark
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid rgba(15,23,42,0.08)',
        }}
      >
        <Stack spacing={1.5}>
          <Typography
            variant="body2"
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Advanced: Track cancellation reasons
          </Typography>
          <DocsCodeBlock
            code={`if (result.status === 'cancelled') {
  analytics.track('dialog_cancelled', {
    reason: result.reason // 'cancel-button', 'backdrop', 'escape-key'
  });
}`}
            language="tsx"
          />
        </Stack>
      </Box>
    </Stack>
  );
}
