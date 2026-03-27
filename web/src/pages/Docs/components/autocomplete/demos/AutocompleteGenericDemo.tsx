import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Autocomplete } from '@dashforge/ui';

interface Country {
  code: string;
  name: string;
  population: number;
}

const countries: Country[] = [
  { code: 'us', name: 'United States', population: 331000000 },
  { code: 'cn', name: 'China', population: 1440000000 },
  { code: 'in', name: 'India', population: 1380000000 },
  { code: 'br', name: 'Brazil', population: 213000000 },
  { code: 'pk', name: 'Pakistan', population: 221000000 },
  { code: 'ng', name: 'Nigeria', population: 206000000 },
];

/**
 * Generic Autocomplete demo with object options and mapper functions
 */
export function AutocompleteGenericDemo() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Box>
      <Autocomplete<string, Country>
        name="country"
        label="Country"
        options={countries}
        value={value}
        onChange={setValue}
        getOptionValue={(option) => option.code}
        getOptionLabel={(option) => option.name}
      />
      {value && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Selected country code: <strong>{value}</strong>
        </Typography>
      )}
    </Box>
  );
}
