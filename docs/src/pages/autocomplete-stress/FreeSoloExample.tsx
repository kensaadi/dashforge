import { Stack, Button, Typography, Box, Alert } from '@mui/material';
import { Autocomplete } from '@dashforge/ui';
import { DashForm } from '@dashforge/forms';
import { ExampleSection } from './ExampleSection';
import { LANGUAGES } from './mockDataSources';
import { useState } from 'react';

interface FreeSoloForm {
  language: string;
}

export function FreeSoloExample() {
  const [submittedData, setSubmittedData] = useState<FreeSoloForm | null>(null);

  return (
    <ExampleSection
      title="Example 2: FreeSolo Mode"
      description="Demonstrates FreeSolo behavior - users can type arbitrary text not in the options list."
    >
      <Alert severity="info" sx={{ mb: 2 }}>
        FreeSolo mode is always active in this Autocomplete component. You can
        select from suggestions OR type any custom text. The form accepts both.
      </Alert>

      <DashForm<FreeSoloForm>
        defaultValues={{
          language: '',
        }}
        onSubmit={(data) => {
          setSubmittedData(data);
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <Autocomplete<string, string>
            name="language"
            label="Programming Language"
            options={LANGUAGES}
            helperText="Try typing a custom language name"
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
            Notice: Custom text entries are accepted even if not in the options
            list.
          </Typography>
        </Box>
      )}
    </ExampleSection>
  );
}
