import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Theme Adapter section - Explains how to properly integrate with MUI
 */
export function DesignTokensAdapter() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={4} id="adapter">
      <Stack spacing={2}>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: 28, md: 36 },
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
          }}
        >
          Theme Adapter
        </Typography>
        <Typography
          sx={{
            fontSize: 15,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            maxWidth: 680,
          }}
        >
          Dashforge uses an adapter pattern to integrate with Material-UI.
          Always customize Dashforge tokens, never MUI directly.
        </Typography>
      </Stack>

      {/* CRITICAL WARNING BOX */}
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
          border: '2px solid',
          borderColor: isDark ? '#ef4444' : '#dc2626',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: isDark ? '#fca5a5' : '#dc2626',
            mb: 1.5,
          }}
        >
          ⚠️ Do Not Override MUI Theme Directly
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
            mb: 1,
          }}
        >
          If you use{' '}
          <code
            style={{
              fontFamily: 'Fira Code, monospace',
              padding: '2px 6px',
              background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
              borderRadius: 4,
            }}
          >
            createTheme()
          </code>{' '}
          directly, you bypass Dashforge's semantic system.
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
          }}
        >
          <strong>Always use:</strong>{' '}
          <code
            style={{
              fontFamily: 'Fira Code, monospace',
              padding: '2px 6px',
              background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
              borderRadius: 4,
            }}
          >
            createDashTheme()
          </code>{' '}
          →{' '}
          <code
            style={{
              fontFamily: 'Fira Code, monospace',
              padding: '2px 6px',
              background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
              borderRadius: 4,
            }}
          >
            createMuiThemeFromDashTheme()
          </code>
        </Typography>
      </Box>

      {/* WRONG Example */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          ❌ Wrong: Bypassing Dashforge
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
            {`import { createTheme } from '@mui/material/styles';

// ❌ DO NOT DO THIS
const myTheme = createTheme({
  palette: {
    primary: {
      main: '#7c3aed',
    },
  },
});

// You just broke semantic consistency`}
          </code>
        </Box>
      </Box>

      {/* CORRECT Example */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          ✅ Correct: Using Dashforge Adapter
        </Typography>
        <Box
          component="pre"
          sx={{
            p: 2.5,
            borderRadius: 1.5,
            bgcolor: isDark ? '#1e1e1e' : '#f8f8f8',
            border: '1px solid',
            borderColor: isDark
              ? 'rgba(139,92,246,0.3)'
              : 'rgba(139,92,246,0.2)',
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
            {`import { createDashTheme } from './theme/createDashTheme';
import { createMuiThemeFromDashTheme } from '@dashforge/theme-mui';

// ✅ DO THIS
const dashTheme = createDashTheme({
  color: {
    intent: {
      primary: '#7c3aed',
    },
  },
});

const muiTheme = createMuiThemeFromDashTheme(dashTheme);

// Semantic meaning preserved, MUI integration automatic`}
          </code>
        </Box>
      </Box>

      {/* Architecture Explanation */}
      <Box
        sx={{
          p: 2.5,
          borderRadius: 1.5,
          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
            mb: 1.5,
            fontWeight: 600,
          }}
        >
          Why This Matters:
        </Typography>
        <Stack spacing={1.5} component="ul" sx={{ m: 0, pl: 2.5 }}>
          <Typography
            component="li"
            variant="body2"
            sx={{
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
            }}
          >
            <strong>Consistency:</strong> All components interpret{' '}
            <code
              style={{
                fontFamily: 'Fira Code, monospace',
                fontSize: '0.875em',
              }}
            >
              primary
            </code>{' '}
            the same way
          </Typography>
          <Typography
            component="li"
            variant="body2"
            sx={{
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
            }}
          >
            <strong>Multi-Tenant:</strong> Change one token, rebrand the entire
            app
          </Typography>
          <Typography
            component="li"
            variant="body2"
            sx={{
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
            }}
          >
            <strong>Type Safety:</strong> Dashforge tokens are strongly typed,
            preventing mistakes
          </Typography>
          <Typography
            component="li"
            variant="body2"
            sx={{
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
            }}
          >
            <strong>Future-Proof:</strong> When we add new tokens, your
            customizations still work
          </Typography>
        </Stack>
      </Box>

      {/* Bottom Note */}
      <Box
        sx={{
          p: 2,
          borderRadius: 1,
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
          }}
        >
          <strong>Bottom line:</strong> If you need to customize MUI beyond what
          Dashforge provides, open an issue. Do not work around the
          system—extend it correctly.
        </Typography>
      </Box>
    </Stack>
  );
}
