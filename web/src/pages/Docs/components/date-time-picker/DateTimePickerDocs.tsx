import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsHeroSection, DocsSection, DocsDivider } from '../shared';
import { DateTimePickerExamples } from './DateTimePickerExamples';
import { DateTimePickerCapabilities } from './DateTimePickerCapabilities';
import { DateTimePickerScenarios } from './DateTimePickerScenarios';
import { DateTimePickerApi } from './DateTimePickerApi';
import { DateTimePickerNotes } from './DateTimePickerNotes';
import { DocsCodeBlock } from '../shared/CodeBlock';

/**
 * DateTimePickerDocs - Complete documentation page for DateTimePicker component
 * Follows the established input component documentation pattern
 */
export function DateTimePickerDocs() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <DocsHeroSection
        title="DateTimePicker"
        description="A flexible date and time input component built on native HTML inputs. Supports date-only, time-only, and datetime modes with ISO 8601 UTC storage. Integrates seamlessly with DashForm for validation, error handling, and reactive visibility."
        themeColor="purple"
      />

      {/* Quick Start - Ultra Compact Onboarding Card */}
      <Box
        id="quick-start"
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.04)',
          border: isDark
            ? '1px solid rgba(139,92,246,0.20)'
            : '1px solid rgba(139,92,246,0.15)',
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
                color: isDark ? '#a78bfa' : '#7c3aed',
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
                READY
              </Typography>
            </Box>
          </Stack>
          <DateTimePickerQuickStart />
        </Stack>
      </Box>

      <DocsDivider />

      {/* Examples */}
      <DocsSection
        id="examples"
        title="Examples"
        description="Common usage patterns and configurations"
      >
        <DateTimePickerExamples />
      </DocsSection>

      <DocsDivider />

      {/* Capabilities */}
      <DocsSection
        id="capabilities"
        title="Dashforge Capabilities"
        description="What makes DateTimePicker powerful in the Dashforge ecosystem"
      >
        <DateTimePickerCapabilities />
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
            Control field visibility and interaction based on user permissions.
            Fields can be hidden, disabled, or set to readonly when users lack
            the required access. Integrates seamlessly with the Dashforge RBAC
            system.
          </Typography>
        </Box>

        <Stack spacing={3}>
          {/* Example 1: Hidden Field */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Hide field when user lacks permission
            </Typography>
            <DocsCodeBlock
              code={`<DateTimePicker
  name="publishedAt"
  label="Published At"
  access={{
    resource: 'article.publishedAt',
    action: 'read',
    onUnauthorized: 'hide',
  }}
/>`}
              language="tsx"
            />
          </Box>

          {/* Example 2: Disabled Field */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Disable field when user cannot edit
            </Typography>
            <DocsCodeBlock
              code={`<DateTimePicker
  name="startAt"
  label="Start Date"
  access={{
    resource: 'event.startAt',
    action: 'update',
    onUnauthorized: 'disable',
  }}
/>`}
              language="tsx"
            />
          </Box>

          {/* Example 3: Readonly Field */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Make field readonly when user has view-only access
            </Typography>
            <DocsCodeBlock
              code={`<DateTimePicker
  name="expiresAt"
  label="Expiration Date"
  access={{
    resource: 'subscription.expiresAt',
    action: 'update',
    onUnauthorized: 'readonly',
  }}
/>`}
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
              Note: DateTimePicker supports native readonly via the underlying
              TextField's readOnly property, allowing users to see and select
              the value but preventing edits.
            </Typography>
          </Box>

          {/* Example 4: Combination with visibleWhen */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Combine with visibleWhen for UI logic + permissions
            </Typography>
            <DocsCodeBlock
              code={`<DateTimePicker
  name="reminderAt"
  label="Reminder Date"
  mode="datetime"
  visibleWhen={(engine) =>
    engine.getNode('enableReminders')?.value === true
  }
  access={{
    resource: 'task.reminderAt',
    action: 'read',
    onUnauthorized: 'hide',
  }}
/>`}
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
              Note: visibleWhen controls UI logic (show when reminders are
              enabled), while RBAC controls permissions (hide if user lacks
              access). Both must be true for the field to render.
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <DocsDivider />

      {/* Scenarios */}
      <DocsSection
        id="scenarios"
        title="Form Integration Scenarios"
        description="Real-world usage in forms and applications"
      >
        <DateTimePickerScenarios />
      </DocsSection>

      <DocsDivider />

      {/* API Reference */}
      <DocsSection
        id="api"
        title="API Reference"
        description="Complete props documentation"
      >
        <DateTimePickerApi />
      </DocsSection>

      <DocsDivider />

      {/* Implementation Notes */}
      <DocsSection
        id="notes"
        title="Implementation Notes"
        description="Important details and best practices"
      >
        <DateTimePickerNotes />
      </DocsSection>
    </Stack>
  );
}

/**
 * Quick Start section component
 */
function DateTimePickerQuickStart() {
  const code = `import { DashForm } from '@dashforge/forms';
import { DateTimePicker } from '@dashforge/ui';

function AppointmentForm() {
  const handleSubmit = (data) => {
    console.log('Appointment:', data.appointmentTime);
    // Value is ISO 8601 UTC string: "2024-03-28T14:30:00.000Z"
  };

  return (
    <DashForm onSubmit={handleSubmit}>
      <DateTimePicker
        name="appointmentTime"
        label="Appointment Date & Time"
        mode="datetime"
        rules={{ required: 'Please select a date and time' }}
      />
      <button type="submit">Schedule</button>
    </DashForm>
  );
}`;

  return <DocsCodeBlock code={code} language="typescript" />;
}
