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

        <Stack spacing={3}>
          {/* Example 1: Hide */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Hide button when user lacks permission
            </Typography>
            <DocsCodeBlock
              code={`<Button
  variant="contained"
  color="error"
  access={{
    resource: 'user',
    action: 'delete',
    onUnauthorized: 'hide',
  }}
  onClick={handleDeleteUser}
>
  Delete User
</Button>

// Button hidden (returns null) when user lacks 'user.delete' permission`}
              language="tsx"
            />
          </Box>

          {/* Example 2: Disable */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Disable button when user cannot execute action
            </Typography>
            <DocsCodeBlock
              code={`<Button
  variant="contained"
  access={{
    resource: 'article',
    action: 'publish',
    onUnauthorized: 'disable',
  }}
  onClick={handlePublish}
>
  Publish Article
</Button>

// Button disabled (grayed out, not clickable)
// when user lacks 'article.publish' permission`}
              language="tsx"
            />
          </Box>

          {/* Example 3: Readonly Fallback */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Readonly fallback (behaves as disabled)
            </Typography>
            <DocsCodeBlock
              code={`<Button
  variant="contained"
  access={{
    resource: 'invoice',
    action: 'approve',
    onUnauthorized: 'readonly',
  }}
  onClick={handleApprove}
>
  Approve Invoice
</Button>

// Button disabled when user lacks 'invoice.approve' permission
// Note: Buttons do not support true readonly semantics.
// readonly falls back to disabled for safe, explicit behavior.`}
              language="tsx"
            />
            <Typography
              sx={{
                fontSize: 14,
                lineHeight: 1.6,
                color: isDark
                  ? 'rgba(255,255,255,0.55)'
                  : 'rgba(15,23,42,0.55)',
                mt: 1.5,
                fontStyle: 'italic',
              }}
            >
              Note: Buttons are action components and do not have readonly
              semantics. When <code>onUnauthorized: 'readonly'</code> is used,
              the button falls back to disabled state for safety. This prevents
              unintended action execution while providing clear visual feedback.
            </Typography>
          </Box>

          {/* Example 4: Combined with Business Logic */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Combine RBAC with application state
            </Typography>
            <DocsCodeBlock
              code={`function PublishButton() {
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishArticle();
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Button
      variant="contained"
      disabled={isPublishing}
      access={{
        resource: 'article',
        action: 'publish',
        onUnauthorized: 'disable',
      }}
      onClick={handlePublish}
    >
      {isPublishing ? 'Publishing...' : 'Publish Article'}
    </Button>
  );
}

// RBAC controls authorization (can user publish?)
// Application state controls loading/submission (is publish in progress?)
// Both combine via OR logic: button disabled if either condition is true`}
              language="tsx"
            />
            <Typography
              sx={{
                fontSize: 14,
                lineHeight: 1.6,
                color: isDark
                  ? 'rgba(255,255,255,0.55)'
                  : 'rgba(15,23,42,0.55)',
                mt: 1.5,
                fontStyle: 'italic',
              }}
            >
              Note: RBAC handles authorization (permissions), not all UI logic.
              Combine the <code>access</code> prop with explicit{' '}
              <code>disabled</code> for loading states, validation failures, or
              business rules. The effective disabled state uses OR logic: the
              button is disabled if either RBAC or explicit props require it.
            </Typography>
          </Box>
        </Stack>
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
