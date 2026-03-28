import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { DateTimePickerFormIntegrationDemo } from './demos/DateTimePickerFormIntegrationDemo';
import { DateTimePickerReactiveDemo } from './demos/DateTimePickerReactiveDemo';

interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  demo: React.ReactNode;
  code: string;
  whyItMatters: string;
}

/**
 * DateTimePickerScenarios demonstrates DateTimePicker in realistic, interactive form contexts
 * Each scenario includes a live demo users can interact with, followed by code
 */
export function DateTimePickerScenarios() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const scenarios: Scenario[] = [
    {
      id: 'react-hook-form-integration',
      title: 'React Hook Form Integration',
      subtitle: 'Try it: Select dates/times and submit the schedule',
      description:
        'DateTimePicker integrates seamlessly with React Hook Form through DashForm. Components self-register, values sync automatically in ISO 8601 UTC format, and validation works out of the box. Try selecting dates and times to see validation in action (appointment and deadline are required). Submit the form to see the complete state.',
      demo: <DateTimePickerFormIntegrationDemo />,
      code: `import { DashForm } from '@dashforge/forms';
import { DateTimePicker } from '@dashforge/ui';

function AppointmentScheduler() {
  const handleSubmit = (data: FormData) => {
    console.log('Scheduled:', data);
    // All values are ISO 8601 UTC strings or null
  };

  return (
    <DashForm
      defaultValues={{ 
        appointmentDate: null,
        deadlineDate: null,
        meetingTime: null
      }}
      onSubmit={handleSubmit}
      mode="onBlur"
    >
      <DateTimePicker
        name="appointmentDate"
        label="Appointment date & time"
        mode="datetime"
        rules={{
          required: 'Please select an appointment time'
        }}
      />
      <DateTimePicker
        name="deadlineDate"
        label="Project deadline"
        mode="date"
        rules={{
          required: 'Please select a deadline'
        }}
      />
      <DateTimePicker
        name="meetingTime"
        label="Daily meeting time"
        mode="time"
        helperText="Select your preferred meeting time"
      />
      <button type="submit">Schedule</button>
    </DashForm>
  );
}

// DateTimePicker automatically:
// - Registers with React Hook Form
// - Syncs value from form state (ISO 8601 UTC)
// - Returns ISO strings on submit
// - Shows errors only after touched OR submit
// - Tracks touched state on blur`,
      whyItMatters:
        'Gradual adoption: Drop DateTimePicker into existing form architectures without rewriting state management. Perfect for scheduling systems, booking forms, deadline trackers, and any date/time input.',
    },
    {
      id: 'reactive-conditional-visibility',
      title: 'Reactive Conditional Visibility',
      subtitle:
        'Try it: Select an event type and enable reminder to see pickers appear',
      description:
        'DateTimePicker supports conditional rendering through the visibleWhen prop. Fields render based on engine state—components query field values and make rendering decisions. Select an event type to see the date picker appear. Enable the reminder switch to reveal the reminder date/time picker instantly without manual state orchestration. This is part of Dashforge Reactive V2 architecture.',
      demo: <DateTimePickerReactiveDemo />,
      code: `import { DashForm } from '@dashforge/forms';
import { DateTimePicker, Select, Switch } from '@dashforge/ui';

function EventCreator() {
  return (
    <DashForm 
      defaultValues={{ 
        eventType: '',
        enableReminder: false,
        eventDate: null,
        reminderTime: null
      }}
    >
      <Select
        name="eventType"
        label="Event type"
        options={[
          { label: 'Meeting', value: 'meeting' },
          { label: 'Deadline', value: 'deadline' },
          { label: 'Reminder', value: 'reminder' }
        ]}
      />

      {/* Event date: appears when event type is selected */}
      <DateTimePicker
        name="eventDate"
        label="Event date"
        mode="date"
        visibleWhen={(engine) => {
          const eventType = engine.getNode('eventType')?.value;
          return eventType !== '' && eventType !== null;
        }}
      />

      <Switch
        name="enableReminder"
        label="Enable reminder"
      />

      {/* Reminder time: appears only when enabled */}
      <DateTimePicker
        name="reminderTime"
        label="Reminder date & time"
        mode="datetime"
        visibleWhen={(engine) => {
          const enabled = engine.getNode('enableReminder')?.value;
          return enabled === true;
        }}
      />
    </DashForm>
  );
}

// The Engine API provides:
// - getNode(name): Access any field's state
// - Component re-renders on dependency changes
// - Component makes rendering decision (engine provides state)`,
      whyItMatters:
        'Build adaptive scheduling forms where date/time pickers respond to user selections. The component handles conditional rendering—you define the predicate. Perfect for dynamic event forms, conditional deadlines, and context-dependent scheduling.',
    },
  ];

  return (
    <Stack spacing={4}>
      <Typography
        variant="body1"
        sx={{
          fontSize: 15,
          lineHeight: 1.75,
          color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
          maxWidth: 720,
        }}
      >
        DateTimePicker works in real form contexts, not just isolated demos. Try
        these live scenarios to experience DashForm integration and reactive
        visibility—both fully implemented and production-ready.
      </Typography>

      <Stack spacing={5}>
        {scenarios.map((scenario) => (
          <Box key={scenario.id}>
            <Stack spacing={3}>
              {/* Header */}
              <Box>
                <Typography
                  id={scenario.id}
                  variant="h3"
                  sx={{
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: isDark
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(15,23,42,0.95)',
                    mb: 0.5,
                  }}
                >
                  {scenario.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: isDark
                      ? 'rgba(139,92,246,0.85)'
                      : 'rgba(109,40,217,0.90)',
                  }}
                >
                  {scenario.subtitle}
                </Typography>
              </Box>

              {/* Description */}
              <Typography
                variant="body1"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                {scenario.description}
              </Typography>

              {/* Live Preview with Collapsible Code */}
              <DocsPreviewBlock code={scenario.code}>
                {scenario.demo}
              </DocsPreviewBlock>

              {/* Why It Matters */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: isDark
                    ? 'rgba(139,92,246,0.08)'
                    : 'rgba(139,92,246,0.05)',
                  border: isDark
                    ? '1px solid rgba(139,92,246,0.20)'
                    : '1px solid rgba(139,92,246,0.15)',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isDark
                      ? 'rgba(139,92,246,0.90)'
                      : 'rgba(109,40,217,0.95)',
                    mb: 0.5,
                  }}
                >
                  Why it matters
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  {scenario.whyItMatters}
                </Typography>
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
