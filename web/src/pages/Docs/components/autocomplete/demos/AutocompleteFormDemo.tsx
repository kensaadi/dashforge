import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Autocomplete } from '@dashforge/ui';
import { DashForm } from '@dashforge/forms';

interface FormValues {
  country: string | null;
  city: string | null;
}

const countries = [
  'United States',
  'Canada',
  'Mexico',
  'United Kingdom',
  'Germany',
  'France',
];

const cities = [
  'New York',
  'Los Angeles',
  'Chicago',
  'Toronto',
  'Vancouver',
  'London',
  'Berlin',
  'Paris',
];

/**
 * Autocomplete integrated with DashForm for validation
 */
export function AutocompleteFormDemo() {
  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  const handleSubmit = (data: FormValues) => {
    setSubmitted(data);
  };

  return (
    <Box>
      <DashForm<FormValues>
        defaultValues={{ country: null, city: null }}
        onSubmit={handleSubmit}
      >
        <Stack spacing={2}>
          <Autocomplete
            name="country"
            label="Country"
            options={countries}
            rules={{ required: 'Country is required' }}
            fullWidth
          />
          <Autocomplete
            name="city"
            label="City"
            options={cities}
            rules={{
              required: 'City is required',
              validate: (value: string | null) => {
                if (value && value.length < 3) {
                  return 'City must be at least 3 characters';
                }
                return true;
              },
            }}
            fullWidth
          />
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </Stack>
      </DashForm>
      {submitted && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="subtitle2">Submitted Values:</Typography>
          <Typography variant="body2">
            Country: <strong>{submitted.country || 'None'}</strong>
          </Typography>
          <Typography variant="body2">
            City: <strong>{submitted.city || 'None'}</strong>
          </Typography>
        </Box>
      )}
    </Box>
  );
}
