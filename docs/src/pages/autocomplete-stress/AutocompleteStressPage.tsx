import { Box, Stack, Typography, Alert } from '@mui/material';
import { StaticOptionsExample } from './StaticOptionsExample';
import { FreeSoloExample } from './FreeSoloExample';
import { GenericOptionsExample } from './GenericOptionsExample';
import { DashFormBoundExample } from './DashFormBoundExample';
import { RuntimeOptionsExample } from './RuntimeOptionsExample';
import { DisabledOptionsExample } from './DisabledOptionsExample';

export function AutocompleteStressPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Stack spacing={4} sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box>
          <Typography variant="h4">Autocomplete - Stress Testing</Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive stress testing and validation of the Autocomplete
            component. Demonstrates all supported features including static
            options, FreeSolo mode, generic options with mappers, runtime
            options, and disabled states.
          </Typography>
        </Box>

        {/* Policy Notice */}
        <Alert severity="info">
          This page follows Reactive V2 policy: no automatic reconciliation,
          display sanitization only, no UI error messaging for unresolved
          values. Developer warnings for unresolved values appear in the browser
          console (dev mode only).
        </Alert>

        {/* Examples */}
        <StaticOptionsExample />
        <FreeSoloExample />
        <GenericOptionsExample />
        <DashFormBoundExample />
        <RuntimeOptionsExample />
        <DisabledOptionsExample />
      </Stack>
    </Box>
  );
}
