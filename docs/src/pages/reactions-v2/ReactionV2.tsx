import { Box, Stack, Typography, Alert } from '@mui/material';
import { CountryProvinceExample } from './CountryProvinceExample';
import { CountryProvinceCityExample } from './CountryProvinceCityExample';
import { UnresolvedValueExample } from './UnresolvedValueExample';
import { GenericOptionsExample } from './GenericOptionsExample';

export function ReactionV2() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Stack spacing={4} sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box>
          <Typography variant="h4">Reactive V2 - Live Demo</Typography>
          <Typography variant="body2" color="text.secondary">
            Validates Reactive V2 architecture with real runtime-driven forms.
            Tests field-change reactions, dynamic options, and chained
            dependencies.
          </Typography>
        </Box>

        {/* Policy Notice */}
        <Alert severity="info">
          This demo follows the current approved Reactive V2 policy: no
          automatic reconciliation, no value reset, no UI error messaging for
          unresolved values.
        </Alert>

        {/* Examples */}
        <CountryProvinceExample />
        <CountryProvinceCityExample />
        <UnresolvedValueExample />
        <GenericOptionsExample />
      </Stack>
    </Box>
  );
}
