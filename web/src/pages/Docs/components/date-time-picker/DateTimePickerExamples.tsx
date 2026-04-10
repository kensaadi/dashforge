import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DateTimePicker } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';

interface Example {
  title: string;
  description: string;
  code: string;
  component: React.ReactNode;
}

/**
 * DateTimePickerExamples displays interactive DateTimePicker examples
 * Each example shows both the rendered component and its code
 */
export function DateTimePickerExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const examples: Example[] = [
    {
      title: 'DateTime Mode',
      description: 'Combined date and time selection for appointments',
      code: `<DateTimePicker 
  label="Appointment" 
  name="appointment" 
  mode="datetime"
/>`,
      component: (
        <DateTimePicker
          label="Appointment"
          name="appointment"
          mode="datetime"
          fullWidth
        />
      ),
    },
    {
      title: 'Date Only',
      description: 'Select dates for deadlines and milestones',
      code: `<DateTimePicker 
  label="Deadline" 
  name="deadline" 
  mode="date"
/>`,
      component: (
        <DateTimePicker
          label="Deadline"
          name="deadline"
          mode="date"
          fullWidth
        />
      ),
    },
    {
      title: 'Time Only',
      description: 'Choose time slots without date selection',
      code: `<DateTimePicker 
  label="Meeting Time" 
  name="meetingTime" 
  mode="time"
/>`,
      component: (
        <DateTimePicker
          label="Meeting Time"
          name="meetingTime"
          mode="time"
          fullWidth
        />
      ),
    },
    {
      title: 'With Helper Text',
      description: 'Guide users with contextual instructions',
      code: `<DateTimePicker 
  label="Reminder" 
  name="reminder"
  mode="datetime"
  helperText="Select when you want to be reminded"
/>`,
      component: (
        <DateTimePicker
          label="Reminder"
          name="reminder"
          mode="datetime"
          helperText="Select when you want to be reminded"
          fullWidth
        />
      ),
    },
    {
      title: 'Error State',
      description: 'Validation feedback for required datetime fields',
      code: `<DateTimePicker
  label="Event Start"
  name="eventStart"
  mode="datetime"
  error
  helperText="Event start time is required"
/>`,
      component: (
        <DateTimePicker
          label="Event Start"
          name="eventStart"
          mode="datetime"
          error
          helperText="Event start time is required"
          fullWidth
        />
      ),
    },
    {
      title: 'Disabled',
      description: 'Prevent interaction when datetime is locked',
      code: `<DateTimePicker
  label="Publish Date"
  name="publishDate"
  mode="datetime"
  disabled
/>`,
      component: (
        <DateTimePicker
          label="Publish Date"
          name="publishDate"
          mode="datetime"
          disabled
          fullWidth
        />
      ),
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, 1fr)',
        },
        gap: 3,
        alignItems: 'start',
      }}
    >
      {examples.map((example) => (
        <Box
          key={example.title}
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: isDark
                    ? 'rgba(255,255,255,0.90)'
                    : 'rgba(15,23,42,0.90)',
                  mb: 0.25,
                  lineHeight: 1.3,
                }}
              >
                {example.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: isDark
                    ? 'rgba(255,255,255,0.60)'
                    : 'rgba(15,23,42,0.60)',
                }}
              >
                {example.description}
              </Typography>
            </Box>
            <DocsPreviewBlock code={example.code} badge="" compact>
              {example.component}
            </DocsPreviewBlock>
          </Stack>
        </Box>
      ))}
    </Box>
  );
}
