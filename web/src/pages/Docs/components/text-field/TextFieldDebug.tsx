import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MuiTextField from '@mui/material/TextField';
import { TextField as DashTextField } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Debug page to compare vanilla MUI vs Dashforge TextField rendering
 * Use this to inspect the DOM structure and computed CSS values
 */
export function TextFieldDebug() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={4} sx={{ p: 4 }}>
      <Typography variant="h4">TextField Debug Comparison</Typography>

      {/* Vanilla MUI TextField */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
            mb: 2,
          }}
        >
          1. Vanilla MUI TextField (size="small", variant="outlined")
        </Typography>
        <Box
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            borderRadius: 1,
            bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
          }}
        >
          <MuiTextField
            id="mui-debug-field"
            label="Vanilla MUI Label"
            name="mui-test"
            variant="outlined"
            size="small"
          />
        </Box>
        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
          Open DevTools and inspect: FormControl → InputLabel → OutlinedInput →
          input
        </Typography>
      </Box>

      {/* Dashforge TextField */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
            mb: 2,
          }}
        >
          2. Dashforge TextField (same props)
        </Typography>
        <Box
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            borderRadius: 1,
            bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
          }}
        >
          <DashTextField
            id="dash-debug-field"
            label="Dashforge Label"
            name="dash-test"
          />
        </Box>
        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
          Compare computed styles with vanilla MUI above
        </Typography>
      </Box>

      {/* Debug info */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
            mb: 2,
          }}
        >
          Key CSS Properties to Inspect
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2" component="div">
            <strong>FormControl (.MuiFormControl-root):</strong>
            <br />- margin, display, position
          </Typography>
          <Typography variant="body2" component="div">
            <strong>InputLabel (.MuiInputLabel-root):</strong>
            <br />- transform (both default and .MuiInputLabel-shrink)
            <br />- top, left, position
            <br />- line-height, font-size
          </Typography>
          <Typography variant="body2" component="div">
            <strong>OutlinedInput root (.MuiOutlinedInput-root):</strong>
            <br />- height, min-height
            <br />- padding
            <br />- display, align-items
          </Typography>
          <Typography variant="body2" component="div">
            <strong>Input element (.MuiOutlinedInput-input):</strong>
            <br />- padding (top, bottom, left, right)
            <br />- line-height, font-size, height
          </Typography>
          <Typography variant="body2" component="div">
            <strong>Fieldset (.MuiOutlinedInput-notchedOutline):</strong>
            <br />- position, padding-left
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}
