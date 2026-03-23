import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * NumberFieldNotes displays implementation notes and usage guidelines
 */
export function NumberFieldNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const notes = [
    {
      title: 'Numeric Parsing',
      content:
        'NumberField automatically converts string input to number type. Empty values are stored as null, never as NaN. This ensures type-safe numeric handling across your forms.',
    },
    {
      title: 'Empty Values',
      content:
        'When the input is empty, NumberField stores null instead of empty string or NaN. This makes validation logic cleaner and prevents edge cases with numeric operations.',
    },
    {
      title: 'Step Behavior',
      content:
        'The step prop (via inputProps.step) controls increment/decrement buttons and arrow key behavior. Use step="0.1" for decimals or step="5" for larger increments.',
    },
    {
      title: 'DashForm Integration',
      content:
        'When used inside DashForm, NumberField automatically integrates through DashFormBridge. It handles automatic field binding, numeric type conversion (string → number | null), and validation from form context. Errors are displayed when the field has been touched or after form submission. Explicit props override form-provided values.',
    },
    {
      title: 'Min/Max Validation',
      content:
        'Use inputProps={{ min, max }} for browser-level constraints (visual spinner limits) and rules={{ min, max }} for form-level validation with custom error messages. Combining both provides dual-layer protection.',
    },
    {
      title: 'Type Safety',
      content:
        'NumberField is fully typed with TypeScript. The value prop accepts number | string | null, and onChange events maintain type compatibility with both controlled and form-bound usage patterns.',
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
