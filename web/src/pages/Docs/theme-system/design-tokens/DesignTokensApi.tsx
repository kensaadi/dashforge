import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { ColorIntentPreview } from './ColorIntentPreview';
import { SurfaceTokensPreview } from './SurfaceTokensPreview';
import { TextTokensPreview } from './TextTokensPreview';
import { RadiusScalePreview } from './RadiusScalePreview';
import { DocsCodeBlock } from '../../components/shared/CodeBlock';

/**
 * API Reference section - Complete token documentation
 */
export function DesignTokensApi() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const tokenTables = [
    {
      title: 'Color Intent Tokens',
      tokens: [
        { name: 'primary', description: 'Brand identity, primary actions' },
        {
          name: 'secondary',
          description: 'Secondary actions, less prominent UI',
        },
        {
          name: 'success',
          description: 'Successful operations, positive feedback',
        },
        { name: 'warning', description: 'Caution, reversible warnings' },
        { name: 'danger', description: 'Errors, destructive actions' },
        { name: 'info', description: 'Neutral information, tips' },
      ],
    },
    {
      title: 'Surface Tokens',
      tokens: [
        { name: 'canvas', description: 'Base application background' },
        { name: 'elevated', description: 'Raised surfaces (cards, dialogs)' },
        { name: 'overlay', description: 'Modal overlays, backdrops' },
      ],
    },
    {
      title: 'Text Tokens',
      tokens: [
        { name: 'primary', description: 'Primary body text' },
        { name: 'secondary', description: 'Supporting text, labels' },
        { name: 'muted', description: 'Disabled text, placeholders' },
        { name: 'inverse', description: 'Text on dark backgrounds' },
      ],
    },
    {
      title: 'Radius Scale',
      tokens: [
        { name: 'sm', description: '4px - Small components' },
        { name: 'md', description: '8px - Default rounding' },
        { name: 'lg', description: '12px - Cards, panels' },
        { name: 'pill', description: '999px - Pills, avatars' },
      ],
    },
  ];

  return (
    <Stack spacing={4} id="api">
      <Stack spacing={2}>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: 28, md: 36 },
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
          }}
        >
          API Reference
        </Typography>
        <Typography
          sx={{
            fontSize: 15,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            maxWidth: 680,
          }}
        >
          Complete reference for all Dashforge tokens. Use these through{' '}
          <code
            style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.875em' }}
          >
            createDashTheme()
          </code>
          —avoid direct component-level overrides.
        </Typography>
      </Stack>

      {/* Important Note */}
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
            color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
            mb: 1,
            fontWeight: 600,
          }}
        >
          This API represents the semantic foundation of your UI.
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
          }}
        >
          Prefer token overrides over component-level styling. Always customize
          tokens through{' '}
          <code
            style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.875em' }}
          >
            createDashTheme()
          </code>
          . Do not override individual component styles directly unless
          absolutely necessary.
        </Typography>
      </Box>

      {/* Color Intent Tokens */}
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          Color Intent Tokens
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mb: 2.5,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
          }}
        >
          Semantic colors that communicate intent and meaning across your UI.
        </Typography>

        <ColorIntentPreview />

        {/* Reference Table */}
        <Box
          sx={{
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '200px 1fr',
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
              Description
            </Typography>
          </Box>
          {tokenTables[0].tokens.map((token, index) => (
            <Box
              key={token.name}
              sx={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                borderBottom:
                  index < tokenTables[0].tokens.length - 1
                    ? '1px solid'
                    : 'none',
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
                  fontFamily: 'Fira Code, monospace',
                  fontWeight: 600,
                  color: isDark ? '#a78bfa' : '#7c3aed',
                }}
              >
                {token.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  p: 1.5,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {token.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Surface Tokens */}
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          Surface Tokens
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mb: 2.5,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
          }}
        >
          Background colors for surfaces at different elevation levels.
        </Typography>

        <SurfaceTokensPreview />

        {/* Reference Table */}
        <Box
          sx={{
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '200px 1fr',
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
              Description
            </Typography>
          </Box>
          {tokenTables[1].tokens.map((token, index) => (
            <Box
              key={token.name}
              sx={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                borderBottom:
                  index < tokenTables[1].tokens.length - 1
                    ? '1px solid'
                    : 'none',
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
                  fontFamily: 'Fira Code, monospace',
                  fontWeight: 600,
                  color: isDark ? '#a78bfa' : '#7c3aed',
                }}
              >
                {token.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  p: 1.5,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {token.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Text Tokens */}
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          Text Tokens
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mb: 2.5,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
          }}
        >
          Text colors for different hierarchy and prominence levels.
        </Typography>

        <TextTokensPreview />

        {/* Reference Table */}
        <Box
          sx={{
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '200px 1fr',
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
              Description
            </Typography>
          </Box>
          {tokenTables[2].tokens.map((token, index) => (
            <Box
              key={token.name}
              sx={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                borderBottom:
                  index < tokenTables[2].tokens.length - 1
                    ? '1px solid'
                    : 'none',
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
                  fontFamily: 'Fira Code, monospace',
                  fontWeight: 600,
                  color: isDark ? '#a78bfa' : '#7c3aed',
                }}
              >
                {token.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  p: 1.5,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {token.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Radius Scale */}
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          Radius Scale
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mb: 2.5,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
          }}
        >
          Border radius values for consistent rounded corners across components.
        </Typography>

        <RadiusScalePreview />

        {/* Reference Table */}
        <Box
          sx={{
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '200px 1fr',
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
              Description
            </Typography>
          </Box>
          {tokenTables[3].tokens.map((token, index) => (
            <Box
              key={token.name}
              sx={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                borderBottom:
                  index < tokenTables[3].tokens.length - 1
                    ? '1px solid'
                    : 'none',
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
                  fontFamily: 'Fira Code, monospace',
                  fontWeight: 600,
                  color: isDark ? '#a78bfa' : '#7c3aed',
                }}
              >
                {token.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  p: 1.5,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {token.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Full Type Reference */}
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          Full Type Reference
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
          }}
        >
          Complete TypeScript interface for the Dashforge theme system. All
          tokens are strongly typed.
        </Typography>

        {/* DashforgeTheme Interface */}
        <DocsCodeBlock
          code={`export interface DashforgeTheme {
  meta: {
    name: string;
    version: string;
    mode: 'light' | 'dark';
  };
  color: {
    intent: ColorIntent;
    surface: ColorSurface;
    text: ColorText;
    border: string;
  };
  typography: {
    fontFamily: string;
    scale: TypographyScale;
  };
  spacing: {
    scale: SpacingScale;
  };
  radius: {
    scale: RadiusScale;
  };
  shadow: {
    scale: ShadowScale;
  };
}

export interface ColorIntent {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export interface ColorSurface {
  canvas: string;
  elevated: string;
  overlay: string;
}

export interface ColorText {
  primary: string;
  secondary: string;
  muted: string;
  inverse: string;
}

export interface RadiusScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface TypographyScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface SpacingScale {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
}

export interface ShadowScale {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}`}
          language="typescript"
        />
      </Box>

      {/* Usage Example */}
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          Type-Safe Customization
        </Typography>
        <DocsCodeBlock
          code={`import { createDashTheme } from './theme/createDashTheme';
import type { DashforgeTheme } from '@dashforge/tokens';

// Partial overrides with type safety
const customTheme = createDashTheme({
  color: {
    intent: {
      primary: '#7c3aed',      // TypeScript ensures valid color string
      success: '#059669',
    },
    surface: {
      canvas: '#fafafa',       // Light mode background
    },
  },
  radius: {
    scale: {
      md: '12px',              // TypeScript ensures valid CSS value
      lg: '16px',
    },
  },
});

// Full theme is type-safe
const theme: DashforgeTheme = customTheme;`}
          language="typescript"
        />
      </Box>

      {/* Bottom Note */}
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
            color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.8)',
            mb: 1,
          }}
        >
          <strong>Source of Truth:</strong> For the complete, up-to-date type
          definitions, see:
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Fira Code, monospace',
            fontSize: '0.875em',
            color: isDark ? '#a78bfa' : '#7c3aed',
          }}
        >
          libs/dashforge/tokens/src/theme/types.ts
        </Typography>
      </Box>
    </Stack>
  );
}
