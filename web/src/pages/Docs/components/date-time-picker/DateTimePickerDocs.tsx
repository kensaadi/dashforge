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

      {/* Access Control (RBAC) - Compact Grid Layout */}
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
            Fields can be hidden, disabled, or readonly when users lack access.
          </Typography>
        </Box>

        {/* Compact Grid of Access Patterns */}
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
              Disable when cannot edit
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
              Readonly for view-only
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
          </Box>

          {/* Pattern 4: Combined with visibleWhen */}
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
              Combined with visibleWhen
            </Typography>
            <DocsCodeBlock
              code={`<DateTimePicker
  name="reminderAt"
  label="Reminder Date"
  mode="datetime"
  visibleWhen={(e) =>
    e.getValue('enableReminders') === true
  }
  access={{
    resource: 'task.reminderAt',
    action: 'read',
    onUnauthorized: 'hide',
  }}
/>`}
              language="tsx"
            />
          </Box>
        </Box>

        {/* Compact Info Box */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.20)'
              : '1px solid rgba(59,130,246,0.15)',
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(15,23,42,0.80)',
            }}
          >
            <strong>Note:</strong> When combining visibleWhen with RBAC, both
            conditions must be satisfied. The field shows only if UI logic
            returns true AND the user has required permissions.
          </Typography>
        </Box>
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

      {/* Under the hood - Info Cards */}
      <DocsSection
        id="notes"
        title="Under the hood"
        description="How DateTimePicker works internally"
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
