import { Stack, Button, Typography, Box } from '@mui/material';
import { Autocomplete } from '@dashforge/ui';
import { DashForm } from '@dashforge/forms';
import { ExampleSection } from './ExampleSection';
import { SERVICE_TIERS, type ServiceTier } from './mockDataSources';
import { useState } from 'react';

interface DisabledOptionsForm {
  serviceTierId: number | null;
}

export function DisabledOptionsExample() {
  const [submittedData, setSubmittedData] =
    useState<DisabledOptionsForm | null>(null);

  return (
    <ExampleSection
      title="Example 6: Disabled Options"
      description="Some options are disabled and cannot be selected. Useful for showing unavailable choices."
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Try opening the dropdown. You'll see some options are grayed out and
        cannot be selected (Enterprise and Legacy tiers).
      </Typography>

      <DashForm<DisabledOptionsForm>
        defaultValues={{
          serviceTierId: null,
        }}
        onSubmit={(data) => {
          setSubmittedData(data);
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <Autocomplete<number, ServiceTier>
            name="serviceTierId"
            label="Service Tier"
            options={SERVICE_TIERS}
            getOptionValue={(tier) => tier.id}
            getOptionLabel={(tier) => tier.name}
            getOptionDisabled={(tier) => tier.disabled}
            helperText="Some tiers are unavailable"
          />
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </Stack>
      </DashForm>

      {submittedData && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            Submitted Data:
          </Typography>
          <Typography variant="body2" component="pre" sx={{ mt: 1 }}>
            {JSON.stringify(submittedData, null, 2)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Notice: Only enabled service tiers can be selected.
          </Typography>
        </Box>
      )}
    </ExampleSection>
  );
}
