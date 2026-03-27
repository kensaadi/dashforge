import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * AutocompleteCapabilities highlights Dashforge-specific features
 */
export function AutocompleteCapabilities() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const capabilities = [
    {
      title: 'Reactive V2 Integration',
      description:
        'Load options dynamically from runtime state using optionsFromFieldData. When options change, the current value is preserved (no automatic reset), following the Reactive V2 no-reconciliation policy.',
    },
    {
      title: 'Form Closure V1 Compliance',
      description:
        'Errors display only when the field is touched (after blur) OR when the form is submitted. This prevents error spam before user interaction.',
    },
    {
      title: 'Unresolved Value Handling',
      description:
        'If a value does not match any option, the display sanitizes to empty while preserving the underlying value. Console warnings are logged in development mode only (not user-facing).',
    },
    {
      title: 'Type Safety',
      description:
        'Generic support for custom option types with explicit mapper functions (getOptionValue, getOptionLabel, getOptionDisabled). No unsafe casts in public APIs.',
    },
    {
      title: 'Always FreeSolo',
      description:
        'The component is always in freeSolo mode, allowing users to type custom values not in the options list. This provides maximum flexibility for user input.',
    },
  ];

  return (
    <Stack spacing={4}>
      <Typography
        variant="body1"
        sx={{
          fontSize: 16,
          lineHeight: 1.7,
          color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
        }}
      >
        DashAutocomplete includes several Dashforge-specific features beyond
        standard MUI Autocomplete functionality.
      </Typography>

      <Stack spacing={3}>
        {capabilities.map((capability) => (
          <Box key={capability.title}>
            <Typography
              variant="h6"
              sx={{
                fontSize: 16,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 0.5,
              }}
            >
              {capability.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: 14,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.65)'
                  : 'rgba(15,23,42,0.65)',
              }}
            >
              {capability.description}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
