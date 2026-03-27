import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Token Structure section - Explains the token hierarchy and decision guidance
 */
export function DesignTokensStructure() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const decisionGuide = [
    {
      condition: 'Brand or main action',
      token: 'primary',
      example: 'Sign Up button, brand logo color',
    },
    {
      condition: 'Success or positive feedback',
      token: 'success',
      example: 'Form submitted, payment processed',
    },
    {
      condition: 'Caution or reversible warning',
      token: 'warning',
      example: 'Unsaved changes, approaching limit',
    },
    {
      condition: 'Error or destructive action',
      token: 'danger',
      example: 'Delete account, critical failure',
    },
    {
      condition: 'Neutral information',
      token: 'info',
      example: 'Tip, system notification',
    },
    {
      condition: 'Secondary or less prominent',
      token: 'secondary',
      example: 'Cancel button, muted accent',
    },
  ];

  return (
    <Stack spacing={4} id="structure">
      <Stack spacing={2}>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: 28, md: 36 },
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
          }}
        >
          Token Structure
        </Typography>
        <Typography
          sx={{
            fontSize: 15,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            maxWidth: 680,
          }}
        >
          Dashforge tokens are organized by purpose, not by color. Learn how to
          choose the right token for your use case.
        </Typography>
      </Stack>

      {/* Token Hierarchy */}
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          Token Hierarchy
        </Typography>
        <Box
          component="pre"
          sx={{
            p: 2.5,
            borderRadius: 1.5,
            bgcolor: isDark ? '#1e1e1e' : '#f8f8f8',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            overflow: 'auto',
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: 'Fira Code, monospace',
          }}
        >
          <code
            style={{
              color: isDark ? '#d4d4d4' : '#24292e',
              display: 'block',
            }}
          >
            {`DashforgeTheme
├── color
│   ├── intent          // Semantic colors (primary, success, etc.)
│   ├── surface         // Background layers (canvas, elevated, overlay)
│   ├── text            // Text colors (primary, secondary, muted, inverse)
│   └── border          // Border colors
├── typography
│   ├── fontFamily
│   └── scale           // Font sizes (xs, sm, base, lg, xl, etc.)
├── spacing
│   └── scale           // Spacing values (1-12)
├── radius
│   └── scale           // Border radius (xs, sm, md, lg, xl, full)
└── shadow
    └── scale           // Elevation shadows (sm, md, lg, xl)`}
          </code>
        </Box>
      </Box>

      {/* WARNING: Don't overuse primary */}
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(251,191,36,0.12)' : 'rgba(251,191,36,0.08)',
          border: '2px solid',
          borderColor: isDark ? '#fbbf24' : '#f59e0b',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: isDark ? '#fde68a' : '#d97706',
            mb: 1.5,
          }}
        >
          ⚠️ Don't Overuse Primary
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
            mb: 1,
          }}
        >
          <strong>Common mistake:</strong> Using{' '}
          <code
            style={{
              fontFamily: 'Fira Code, monospace',
              padding: '2px 6px',
              background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
              borderRadius: 4,
            }}
          >
            primary
          </code>{' '}
          for everything that's not an error.
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
          }}
        >
          Reserve{' '}
          <code
            style={{
              fontFamily: 'Fira Code, monospace',
              padding: '2px 6px',
              background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
              borderRadius: 4,
            }}
          >
            primary
          </code>{' '}
          for <strong>brand identity</strong> and{' '}
          <strong>primary actions</strong>. Use{' '}
          <code
            style={{
              fontFamily: 'Fira Code, monospace',
              padding: '2px 6px',
              background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
              borderRadius: 4,
            }}
          >
            info
          </code>{' '}
          for neutral notifications,{' '}
          <code
            style={{
              fontFamily: 'Fira Code, monospace',
              padding: '2px 6px',
              background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
              borderRadius: 4,
            }}
          >
            secondary
          </code>{' '}
          for less prominent UI.
        </Typography>
      </Box>

      {/* WRONG vs CORRECT Examples */}
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          Choosing the Right Token
        </Typography>

        <Grid container spacing={3}>
          {/* WRONG */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 2.5,
                height: '100%',
                borderRadius: 1.5,
                bgcolor: isDark
                  ? 'rgba(239,68,68,0.08)'
                  : 'rgba(239,68,68,0.05)',
                border: '1px solid',
                borderColor: isDark
                  ? 'rgba(239,68,68,0.3)'
                  : 'rgba(239,68,68,0.2)',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: isDark ? '#fca5a5' : '#dc2626',
                }}
              >
                ❌ Wrong
              </Typography>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                  fontSize: 13,
                  lineHeight: 1.5,
                  fontFamily: 'Fira Code, monospace',
                  overflow: 'auto',
                }}
              >
                <code style={{ color: isDark ? '#d4d4d4' : '#24292e' }}>
                  {`// Everything is primary
<Button color="primary">
  Save
</Button>
<Button color="primary">
  Cancel
</Button>
<Alert severity="primary">
  Info message
</Alert>

// No semantic hierarchy`}
                </code>
              </Box>
            </Box>
          </Grid>

          {/* CORRECT */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 2.5,
                height: '100%',
                borderRadius: 1.5,
                bgcolor: isDark
                  ? 'rgba(34,197,94,0.08)'
                  : 'rgba(34,197,94,0.05)',
                border: '1px solid',
                borderColor: isDark
                  ? 'rgba(34,197,94,0.3)'
                  : 'rgba(34,197,94,0.2)',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: isDark ? '#86efac' : '#16a34a',
                }}
              >
                ✅ Correct
              </Typography>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                  fontSize: 13,
                  lineHeight: 1.5,
                  fontFamily: 'Fira Code, monospace',
                  overflow: 'auto',
                }}
              >
                <code style={{ color: isDark ? '#d4d4d4' : '#24292e' }}>
                  {`// Semantic intent
<Button color="primary">
  Save
</Button>
<Button color="secondary">
  Cancel
</Button>
<Alert severity="info">
  Info message
</Alert>

// Clear visual hierarchy`}
                </code>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Decision Guide Table */}
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          Quick Decision Guide
        </Typography>
        <Box
          sx={{
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          {/* Table Header */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 2fr',
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                p: 1.5,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
              }}
            >
              Condition
            </Typography>
            <Typography
              variant="caption"
              sx={{
                p: 1.5,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
                borderLeft: '1px solid',
                borderColor: 'divider',
              }}
            >
              Token
            </Typography>
            <Typography
              variant="caption"
              sx={{
                p: 1.5,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
                borderLeft: '1px solid',
                borderColor: 'divider',
              }}
            >
              Example
            </Typography>
          </Box>

          {/* Table Rows */}
          {decisionGuide.map((row, index) => (
            <Box
              key={row.token}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 2fr',
                borderBottom:
                  index < decisionGuide.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: isDark
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(0,0,0,0.01)',
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  p: 1.5,
                  color: isDark
                    ? 'rgba(255,255,255,0.85)'
                    : 'rgba(15,23,42,0.85)',
                }}
              >
                {row.condition}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  p: 1.5,
                  fontFamily: 'Fira Code, monospace',
                  fontWeight: 600,
                  color: isDark ? '#a78bfa' : '#7c3aed',
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {row.token}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  p: 1.5,
                  color: isDark
                    ? 'rgba(255,255,255,0.65)'
                    : 'rgba(15,23,42,0.65)',
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {row.example}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Bottom Note */}
      <Box
        sx={{
          p: 2.5,
          borderRadius: 1.5,
          bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.06)',
          border: '1px solid',
          borderColor: isDark
            ? 'rgba(139,92,246,0.25)'
            : 'rgba(139,92,246,0.20)',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.8)',
            mb: 1,
          }}
        >
          <strong>Remember:</strong> Tokens represent <strong>meaning</strong>,
          not aesthetics.
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
          }}
        >
          If you find yourself choosing a token because you like the color,
          you're doing it wrong. Choose based on what the UI element{' '}
          <em>means</em> to the user.
        </Typography>
      </Box>
    </Stack>
  );
}
