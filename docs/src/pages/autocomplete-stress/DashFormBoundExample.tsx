import { Stack, Button, Typography, Box } from '@mui/material';
import { Autocomplete } from '@dashforge/ui';
import { DashForm } from '@dashforge/forms';
import { ExampleSection } from './ExampleSection';
import { COUNTRIES } from './mockDataSources';
import { useState } from 'react';

interface DashFormBoundForm {
  preferredCountry: string;
  secondChoice: string;
}

export function DashFormBoundExample() {
  const [submittedData, setSubmittedData] = useState<DashFormBoundForm | null>(
    null
  );

  return (
    <ExampleSection
      title="Example 4: DashForm Bound Mode"
      description="Multiple Autocomplete fields bound to DashForm with validation and error display."
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Both fields are required. Errors display after field blur or form
        submission attempt.
      </Typography>

      <DashForm<DashFormBoundForm>
        defaultValues={{
          preferredCountry: '',
          secondChoice: '',
        }}
        onSubmit={(data) => {
          setSubmittedData(data);
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <Autocomplete<string, string>
            name="preferredCountry"
            label="Preferred Country"
            options={COUNTRIES}
            rules={{ required: 'Preferred country is required' }}
            helperText="This field is required"
          />
          <Autocomplete<string, string>
            name="secondChoice"
            label="Second Choice"
            options={COUNTRIES}
            rules={{ required: 'Second choice is required' }}
            helperText="This field is also required"
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
