import { Stack, Button, Typography, Box } from '@mui/material';
import { Autocomplete } from '@dashforge/ui';
import { DashForm } from '@dashforge/forms';
import { ExampleSection } from './ExampleSection';
import { COUNTRIES } from './mockDataSources';
import { useState } from 'react';

interface StaticOptionsForm {
  country: string;
}

export function StaticOptionsExample() {
  const [submittedData, setSubmittedData] = useState<StaticOptionsForm | null>(
    null
  );

  return (
    <ExampleSection
      title="Example 1: Static Options"
      description="Basic usage with a static string array. No mappers needed for simple string options."
    >
      <DashForm<StaticOptionsForm>
        defaultValues={{
          country: '',
        }}
        onSubmit={(data) => {
          setSubmittedData(data);
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <Autocomplete<string, string>
            name="country"
            label="Select Country"
            options={COUNTRIES}
            helperText="Type or select from dropdown"
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
        </Box>
      )}
    </ExampleSection>
  );
}
