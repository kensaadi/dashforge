import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DashForm } from '@dashforge/forms';
import { DateTimePicker, Select, Switch } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * DateTimePickerReactiveDemo - Demonstrates reactive visibility with date/time pickers
 * Shows how pickers can conditionally appear based on other field values
 */
export function DateTimePickerReactiveDemo() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 2,
        bgcolor: isDark ? 'rgba(0,0,0,0.20)' : 'rgba(248,250,252,0.60)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(15,23,42,0.08)',
      }}
    >
      <DashForm
        defaultValues={{
          eventType: '',
          enableReminder: false,
          eventDate: null,
          reminderTime: null,
        }}
      >
        <Stack spacing={2.5}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
              mb: 0.5,
            }}
          >
            Create Event
          </Typography>

          <Select
            name="eventType"
            label="Event type"
            fullWidth
            options={[
              { label: 'Meeting', value: 'meeting' },
              { label: 'Deadline', value: 'deadline' },
              { label: 'Reminder', value: 'reminder' },
            ]}
          />

          {/* Event date: appears for all event types except empty */}
          <DateTimePicker
            name="eventDate"
            label="Event date"
            mode="date"
            visibleWhen={(engine) => {
              const eventType = engine.getNode('eventType')?.value;
              return eventType !== '' && eventType !== null;
            }}
          />

          <Switch name="enableReminder" label="Enable reminder" />

          {/* Reminder time: appears only when reminder is enabled */}
          <DateTimePicker
            name="reminderTime"
            label="Reminder date & time"
            mode="datetime"
            visibleWhen={(engine) => {
              const enabled = engine.getNode('enableReminder')?.value;
              return enabled === true;
            }}
          />
        </Stack>
      </DashForm>
    </Box>
  );
}
