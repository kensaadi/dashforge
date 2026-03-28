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
      description: 'Date and time picker combined (default mode)',
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
        />
      ),
    },
    {
      title: 'Date Only',
      description: 'Date picker without time selection',
      code: `<DateTimePicker 
  label="Deadline" 
  name="deadline" 
  mode="date"
/>`,
      component: (
        <DateTimePicker label="Deadline" name="deadline" mode="date" />
      ),
    },
    {
      title: 'Time Only',
      description: 'Time picker without date selection',
      code: `<DateTimePicker 
  label="Meeting Time" 
  name="meetingTime" 
  mode="time"
/>`,
      component: (
        <DateTimePicker label="Meeting Time" name="meetingTime" mode="time" />
      ),
    },
    {
      title: 'With Helper Text',
      description: 'Provides guidance below the picker',
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
        />
      ),
    },
    {
      title: 'Error State',
      description: 'Shows validation error with message',
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
        />
      ),
    },
    {
      title: 'Disabled',
      description: 'Read-only state for locked dates/times',
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
        alignItems: 'stretch',
      }}
    >
      {examples.map((example) => (
        <Box
          key={example.title}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Stack spacing={2} sx={{ height: '100%' }}>
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
                  mb: 0.5,
                }}
              >
                {example.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 13,
                  color: isDark
                    ? 'rgba(255,255,255,0.60)'
                    : 'rgba(15,23,42,0.60)',
                }}
              >
                {example.description}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <DocsPreviewBlock code={example.code}>
                <Box sx={{ p: 2 }}>{example.component}</Box>
              </DocsPreviewBlock>
            </Box>
          </Stack>
        </Box>
      ))}
    </Box>
  );
}
