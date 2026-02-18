import { useRef } from 'react';
import { DashForm } from '@dashforge/forms';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import { StressSection } from './StressSection';

export function StressForm() {
  const renderCount = useRef(0);
  renderCount.current++;
  console.log('StressForm renders:', renderCount.current);

  const handleSubmit = (data: unknown) => {
    console.log('Form submitted:', data);
  };

  return (
    <DashForm
      onSubmit={handleSubmit}
      defaultValues={{
        personal: {
          field1: '',
          field2: '',
          field3: '',
          field4: '',
          field5: '',
        },
        address: {
          field1: '',
          field2: '',
          field3: '',
          field4: '',
          field5: '',
        },
        company: {
          field1: '',
          field2: '',
          field3: '',
          field4: '',
          field5: '',
        },
        preferences: {
          field1: '',
          field2: '',
          field3: '',
          field4: '',
          field5: '',
        },
        advanced: {
          field1: '',
          field2: '',
          field3: '',
          field4: '',
          field5: '',
        },
      }}
    >
      <Paper elevation={1} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Stack spacing={4}>
          <StressSection title="Personal Information" fieldPrefix="personal" />
          <Divider />
          <StressSection title="Address Information" fieldPrefix="address" />
          <Divider />
          <StressSection title="Company Information" fieldPrefix="company" />
          <Divider />
          <StressSection title="Preferences" fieldPrefix="preferences" />
          <Divider />
          <StressSection title="Advanced Data" fieldPrefix="advanced" />
          <Divider />
          <Button type="submit" variant="contained" size="large" fullWidth>
            Submit
          </Button>
        </Stack>
      </Paper>
    </DashForm>
  );
}
