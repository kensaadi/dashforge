import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * AutocompleteNotes provides implementation notes and warnings
 */
export function AutocompleteNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

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
        Important technical details, warnings, and behavioral notes for
        Autocomplete.
      </Typography>

      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
            mb: 1,
          }}
        >
          Always FreeSolo Mode
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: 14,
            lineHeight: 1.7,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
          }}
        >
          DashAutocomplete is always in freeSolo mode. Users can type arbitrary
          text that doesn't match any option. The value is not constrained to
          the provided options list. Use validation rules if you need to enforce
          that values must be from the options list.
        </Typography>
      </Box>

      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
            mb: 1,
          }}
        >
          Reactive V2 Policy Compliance
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: 14,
            lineHeight: 1.7,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            mb: 1.5,
          }}
        >
          When using <code>optionsFromFieldData</code> for runtime option
          updates:
        </Typography>
        <Stack
          component="ul"
          spacing={1}
          sx={{
            pl: 3,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
          }}
        >
          <Typography component="li" variant="body2" sx={{ fontSize: 14 }}>
            <strong>No automatic reset:</strong> Values are never automatically
            reset when options change
          </Typography>
          <Typography component="li" variant="body2" sx={{ fontSize: 14 }}>
            <strong>Display sanitization only:</strong> UI shows sanitized state
            (empty if unmatched), but underlying value is preserved
          </Typography>
          <Typography component="li" variant="body2" sx={{ fontSize: 14 }}>
            <strong>Console warnings only:</strong> Unresolved values log to
            console in development mode (not user-facing error messages)
          </Typography>
        </Stack>
      </Box>

      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
            mb: 1,
          }}
        >
          Runtime Options
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: 14,
            lineHeight: 1.7,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
          }}
        >
          Set <code>optionsFromFieldData={`{true}`}</code> to load options from
          field runtime state instead of the static options prop. Requires
          DashFormContext. Runtime data shape:{' '}
          <code>{`{ options: TOption[] }`}</code>. Use reactions to update
          runtime options when other fields change.
        </Typography>
      </Box>

      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
            mb: 1,
          }}
        >
          Type Safety
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: 14,
            lineHeight: 1.7,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
          }}
        >
          Use generic type parameters for custom option types. TValue must be{' '}
          <code>string | number</code>. Provide explicit mapper functions
          (getOptionValue, getOptionLabel) for type-safe option handling. Avoid{' '}
          <code>any</code> in option types.
        </Typography>
      </Box>

      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
            mb: 1,
          }}
        >
          Performance
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: 14,
            lineHeight: 1.7,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
          }}
        >
          Large option sets (1000+ items) may impact performance. Search is
          client-side only. Consider reducing option count or implementing
          server-side filtering for very large datasets.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ fontSize: 14 }}>
          <strong>Future Features:</strong> Multiple mode, async search, option
          grouping, and virtualization are planned but not yet available.
        </Typography>
      </Alert>
    </Stack>
  );
}
