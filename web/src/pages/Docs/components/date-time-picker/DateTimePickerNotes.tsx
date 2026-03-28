import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * DateTimePickerNotes displays implementation notes and usage guidelines
 */
export function DateTimePickerNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const notes = [
    {
      title: 'Built on Native HTML Inputs',
      content:
        'DateTimePicker is built on native HTML date/time inputs (date, time, datetime-local), not MUI X Date Pickers. This means zero external dependencies beyond MUI core, but browser support and appearance vary by browser. Native inputs provide good accessibility and mobile experience out of the box.',
    },
    {
      title: 'Three Modes',
      content:
        'DateTimePicker supports three modes via the mode prop: "date" for date-only selection, "time" for time-only selection, and "datetime" (default) for combined date and time. The mode determines which native input type is used and what data format is expected.',
    },
    {
      title: 'ISO 8601 UTC Storage',
      content:
        'All values are stored as ISO 8601 UTC strings (e.g., "2024-03-28T14:30:00.000Z") or null. The component automatically converts between ISO format (for storage/transmission) and the native input format (YYYY-MM-DD, HH:mm, YYYY-MM-DDTHH:mm). This ensures consistent, timezone-aware date handling.',
    },
    {
      title: 'DashForm Integration',
      content:
        'When used inside DashForm, DateTimePicker automatically binds to the form through the DashFormBridge. The component self-registers on mount, binding value, onChange, and onBlur handlers automatically. Validation errors from form context display as helperText. No explicit prop passing required—integration is seamless.',
    },
    {
      title: 'Standalone Usage',
      content:
        'DateTimePicker can be used as a standalone component outside of DashForm. In this mode, it behaves like a regular controlled component and requires explicit value (ISO 8601 string or null) and onChange props. The simplified onChange callback receives the ISO string directly, not an event object.',
    },
    {
      title: 'Error Gating',
      content:
        'Errors are displayed only when the field is touched (after blur) OR when the form has been submitted. This prevents showing validation errors while the user is still interacting with the picker. Touch tracking occurs on blur events.',
    },
    {
      title: 'Time Mode Base Date',
      content:
        'When mode="time", the component needs a base date to construct a complete ISO 8601 timestamp. If a value already exists, it preserves the date component. Otherwise, it uses today\'s date. This ensures time-only inputs still produce valid ISO timestamps.',
    },
    {
      title: 'Reactive Visibility',
      content:
        'DateTimePicker supports conditional rendering through the visibleWhen prop (part of Reactive V2 architecture). This is a component-level decision powered by engine-driven predicates. The engine provides access to all field state via getNode(name), and the component re-evaluates visibility on dependency changes. When visibleWhen returns false, the component renders null.',
    },
    {
      title: 'Browser Behavior',
      content:
        'Native date/time inputs behave differently across browsers. Chrome, Edge, and Safari provide custom picker UIs. Firefox uses native OS pickers. Older browsers may fall back to text inputs. The component provides consistent data handling regardless of browser presentation.',
    },
    {
      title: 'Common Use Cases',
      content:
        'DateTimePicker is ideal for appointment scheduling, event start/end times, deadline selection, reminder timestamps, booking date/time, publish-at scheduling, and any scenario requiring date and/or time input. Use mode="date" for date-only fields, mode="time" for time-only, and mode="datetime" for full timestamps.',
    },
    {
      title: 'Type Safety',
      content:
        'All DateTimePicker components are fully typed with TypeScript, providing autocompletion and type checking in your IDE. The value is always typed as string | null (ISO 8601 UTC format) in form data, ensuring consistent handling.',
    },
  ];

  return (
    <Stack spacing={2.5}>
      {notes.map((note, index) => (
        <Box
          key={note.title}
          sx={{
            p: 2.5,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(17,24,39,0.35)' : 'rgba(248,250,252,0.80)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(15,23,42,0.08)',
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: isDark
                ? 'rgba(17,24,39,0.50)'
                : 'rgba(255,255,255,0.90)',
              borderColor: isDark
                ? 'rgba(255,255,255,0.10)'
                : 'rgba(15,23,42,0.12)',
            },
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box
              sx={{
                mt: 0.5,
                minWidth: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                bgcolor: isDark
                  ? 'rgba(139,92,246,0.15)'
                  : 'rgba(139,92,246,0.10)',
                border: isDark
                  ? '1px solid rgba(139,92,246,0.25)'
                  : '1px solid rgba(139,92,246,0.20)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: isDark
                    ? 'rgba(139,92,246,0.90)'
                    : 'rgba(109,40,217,0.90)',
                }}
              >
                {index + 1}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: isDark
                    ? 'rgba(255,255,255,0.90)'
                    : 'rgba(15,23,42,0.90)',
                  mb: 0.75,
                }}
              >
                {note.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                {note.content}
              </Typography>
            </Box>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
