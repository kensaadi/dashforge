import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsHeroSection, DocsSection, DocsDivider } from '../shared';
import { ButtonExamples } from './ButtonExamples';
import { ButtonCapabilities } from './ButtonCapabilities';
import { ButtonScenarios } from './ButtonScenarios';
import { ButtonApi } from './ButtonApi';
import { ButtonNotes } from './ButtonNotes';
import { DocsCodeBlock } from '../shared/CodeBlock';

/**
 * ButtonDocs - Complete documentation page for Button component
 * Covers basic usage, variants, RBAC integration, and action patterns
 */
export function ButtonDocs() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <DocsHeroSection
        title="Button"
        description="An action component with built-in RBAC support for declarative access control. Wraps MUI Button with permission-based rendering and disabling. Perfect for primary actions, destructive operations, publishing workflows, and contextual toolbar actions."
        themeColor="blue"
      />

      {/* Quick Start */}
      <Box
        id="quick-start"
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)',
          border: isDark
            ? '1px solid rgba(59,130,246,0.20)'
            : '1px solid rgba(59,130,246,0.15)',
          position: 'relative',
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
                color: isDark ? '#60a5fa' : '#2563eb',
              }}
            >
              Quick Start
            </Typography>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor: isDark
                  ? 'rgba(34,197,94,0.15)'
                  : 'rgba(34,197,94,0.10)',
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
            code={`import { Button } from '@dashforge/ui';

<Button onClick={handleClick}>Click Me</Button>`}
            language="tsx"
          />
        </Stack>
      </Box>

      {/* Examples Section */}
      <DocsSection
        id="examples"
        title="Examples"
        description="Common Button patterns and variants"
      >
        <ButtonExamples />
      </DocsSection>

      <DocsDivider />

      {/* Variants Section */}
      <DocsSection
        id="variants"
        title="Button Variants"
        description="MUI Button variants for different UI contexts"
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Contained (Primary)
            </Typography>
            <DocsCodeBlock
              code={`<Button variant="contained" onClick={handleSave}>
  Save Changes
</Button>`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Outlined (Secondary)
            </Typography>
            <DocsCodeBlock
              code={`<Button variant="outlined" onClick={handleCancel}>
  Cancel
</Button>`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Text (Tertiary)
            </Typography>
            <DocsCodeBlock
              code={`<Button variant="text" onClick={handleReset}>
  Reset
</Button>`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Destructive Actions
            </Typography>
            <DocsCodeBlock
              code={`<Button variant="contained" color="error" onClick={handleDelete}>
  Delete User
</Button>`}
              language="tsx"
            />
          </Box>
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Capabilities */}
      <DocsSection
        id="capabilities"
        title="Dashforge Capabilities"
        description="What makes Button powerful in the Dashforge ecosystem"
      >
        <ButtonCapabilities />
      </DocsSection>

      <DocsDivider />

      {/* Access Control (RBAC) */}
      <Stack spacing={4} id="access-control">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 2,
            }}
          >
            Access Control (RBAC)
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
              maxWidth: 720,
            }}
          >
            Control button visibility and interaction based on user permissions.
            Buttons can be hidden or disabled when users lack the required
            access. Integrates seamlessly with the Dashforge RBAC system for
            declarative action authorization.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
            },
            gap: 3,
          }}
        >
          {/* Pattern 1: Hide */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: isDark
                ? 'rgba(17,24,39,0.40)'
                : 'rgba(248,250,252,0.90)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.08)'
                : '1px solid rgba(15,23,42,0.10)',
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Hide when unauthorized
            </Typography>
            <DocsCodeBlock
              code={`<Button
  variant="contained"
  access={{
    resource: 'user',
    action: 'delete',
    onUnauthorized: 'hide',
  }}
>
  Delete User
</Button>`}
              language="tsx"
            />
          </Box>

          {/* Pattern 2: Disable */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: isDark
                ? 'rgba(17,24,39,0.40)'
                : 'rgba(248,250,252,0.90)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.08)'
                : '1px solid rgba(15,23,42,0.10)',
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Disable when cannot execute
            </Typography>
            <DocsCodeBlock
              code={`<Button
  variant="contained"
  access={{
    resource: 'article',
    action: 'publish',
    onUnauthorized: 'disable',
  }}
>
  Publish Article
</Button>`}
              language="tsx"
            />
          </Box>

          {/* Pattern 3: Readonly */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: isDark
                ? 'rgba(17,24,39,0.40)'
                : 'rgba(248,250,252,0.90)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.08)'
                : '1px solid rgba(15,23,42,0.10)',
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Readonly fallback
            </Typography>
            <DocsCodeBlock
              code={`<Button
  variant="contained"
  access={{
    resource: 'invoice',
    action: 'approve',
    onUnauthorized: 'readonly',
  }}
>
  Approve Invoice
</Button>`}
              language="tsx"
            />
          </Box>

          {/* Pattern 4: Combined */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: isDark
                ? 'rgba(17,24,39,0.40)'
                : 'rgba(248,250,252,0.90)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.08)'
                : '1px solid rgba(15,23,42,0.10)',
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Combined with disabled state
            </Typography>
            <DocsCodeBlock
              code={`<Button
  variant="contained"
  disabled={isPublishing}
  access={{
    resource: 'article',
    action: 'publish',
    onUnauthorized: 'disable',
  }}
>
  Publish
</Button>`}
              language="tsx"
            />
          </Box>
        </Box>

        {/* Implementation Note - Compact */}
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.20)'
              : '1px solid rgba(59,130,246,0.15)',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: 13,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            <strong>Note:</strong> Buttons do not support readonly semantics.
            When <code>onUnauthorized: 'readonly'</code> is used, it falls back
            to disabled for safety. Combine <code>access</code> with explicit{' '}
            <code>disabled</code> for loading states or business rules.
          </Typography>
        </Box>
      </Stack>

      <DocsDivider />

      {/* Action Integration Section */}
      <DocsSection
        id="scenarios"
        title="Action Integration Scenarios"
        description="Real-world usage in forms, toolbars, and workflows"
      >
        <ButtonScenarios />
      </DocsSection>

      <DocsDivider />

      {/* API Reference */}
      <DocsSection
        id="api"
        title="API Reference"
        description="Complete props documentation"
      >
        <ButtonApi />
      </DocsSection>

      <DocsDivider />

      {/* Implementation Notes */}
      <DocsSection
        id="notes"
        title="Implementation Notes"
        description="Important details and best practices"
      >
        <ButtonNotes />
      </DocsSection>
    </Stack>
  );
}
