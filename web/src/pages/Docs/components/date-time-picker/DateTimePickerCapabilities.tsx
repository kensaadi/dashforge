import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsCodeBlock } from '../shared/CodeBlock';

/**
 * DateTimePickerCapabilities documents the progressive adoption model
 * Explains Controlled, React Hook Form, and Reactive capabilities
 */
export function DateTimePickerCapabilities() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const capabilities = [
    {
      title: 'Controlled',
      status: 'Available Now',
      statusColor: isDark ? 'rgba(34,197,94,0.85)' : 'rgba(22,163,74,0.90)',
      statusBg: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.08)',
      statusBorder: isDark ? 'rgba(34,197,94,0.25)' : 'rgba(34,197,94,0.20)',
      description:
        'DateTimePicker works as a standard React controlled component with ISO 8601 UTC storage. No proprietary lock-in required.',
      points: [
        'ISO 8601 UTC value format',
        'Standard onChange callback pattern',
        'No external dependencies required',
      ],
      code: `<DateTimePicker
  value={startTime}
  onChange={(iso) => setStartTime(iso)}
  label="Event start time"
  mode="datetime"
/>`,
    },
    {
      title: 'React Hook Form Ready',
      status: 'Integration-Friendly',
      statusColor: isDark ? 'rgba(59,130,246,0.90)' : 'rgba(37,99,235,0.95)',
      statusBg: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)',
      statusBorder: isDark ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.20)',
      description:
        'Designed to integrate with React Hook Form workflows through DashForm. Supports validation, error gating, and touch tracking.',
      points: [
        'Works through DashForm bridge',
        'Validation rules supported',
        'Error gating on touch/submit',
      ],
      code: `<DashForm>
  <DateTimePicker 
    name="appointment"
    label="Appointment time"
    mode="datetime"
    rules={{
      required: 'Please select a time'
    }}
  />
</DashForm>`,
    },
    {
      title: 'Reactive Visibility',
      status: 'Available Now',
      statusColor: isDark ? 'rgba(139,92,246,0.90)' : 'rgba(109,40,217,0.95)',
      statusBg: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)',
      statusBorder: isDark ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.20)',
      description:
        'DateTimePicker can participate in engine-driven visibility rules through visibleWhen. Use it when date/time input depends on other form state.',
      points: [
        'Conditional rendering via visibleWhen',
        'Engine evaluates the predicate',
        'Useful for dependent scheduling fields',
      ],
      code: `<DateTimePicker
  name="reminderTime"
  label="Reminder time"
  mode="datetime"
  visibleWhen={(engine) => 
    engine.getNode('enableReminder')?.value === true
  }
/>`,
    },
  ];

  return (
    <Stack spacing={4}>
      <Box>
        <Typography
          variant="body1"
          sx={{
            fontSize: 15,
            lineHeight: 1.75,
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            maxWidth: 720,
          }}
        >
          DateTimePicker is designed for progressive adoption. Use it as a
          simple controlled component, integrate it with React Hook Form, or
          leverage Dashforge-native reactive capabilities. Choose the level that
          fits your team's workflow.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(3, minmax(0, 1fr))',
          },
          gap: { xs: 3, md: 3 },
        }}
      >
        {capabilities.map((capability) => (
          <Box
            key={capability.title}
            sx={{
              p: { xs: 3, md: 3.5 },
              borderRadius: 2.5,
              bgcolor: isDark
                ? 'rgba(17,24,39,0.50)'
                : 'rgba(255,255,255,0.90)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.08)'
                : '1px solid rgba(15,23,42,0.08)',
              transition: 'all 0.2s ease',
              boxShadow: isDark
                ? 'none'
                : '0 1px 3px rgba(15,23,42,0.03), 0 1px 2px rgba(15,23,42,0.02)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: isDark
                  ? '0 8px 16px rgba(0,0,0,0.30)'
                  : '0 8px 16px rgba(15,23,42,0.08)',
              },
            }}
          >
            <Stack spacing={2.5}>
              {/* Header */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: isDark
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(15,23,42,0.95)',
                  }}
                >
                  {capability.title}
                </Typography>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: capability.statusBg,
                    border: `1px solid ${capability.statusBorder}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      color: capability.statusColor,
                    }}
                  >
                    {capability.status}
                  </Typography>
                </Box>
              </Stack>

              {/* Description */}
              <Typography
                sx={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                {capability.description}
              </Typography>

              {/* Bullet Points */}
              <Stack spacing={1.25}>
                {capability.points.map((point, i) => (
                  <Stack
                    key={i}
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                  >
                    <Box
                      sx={{
                        mt: 0.75,
                        minWidth: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: isDark
                          ? 'rgba(139,92,246,0.60)'
                          : 'rgba(109,40,217,0.70)',
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: isDark
                          ? 'rgba(255,255,255,0.65)'
                          : 'rgba(15,23,42,0.65)',
                      }}
                    >
                      {point}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              {/* Code Example */}
              <Box
                sx={{
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.06)'
                    : '1px solid rgba(15,23,42,0.06)',
                }}
              >
                <DocsCodeBlock code={capability.code} language="typescript" />
              </Box>
            </Stack>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
